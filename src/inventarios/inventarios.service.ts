import {
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Inventario } from './entities/inventario.entity/inventario.entity';
import { Producto } from '../productos/entities/producto.entity/producto.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';
import { CreateInventarioDto } from './dto/create-inventario.dto';
import { UsuarioRol } from '../usuario-rol/entities/usuario-rol.entity/usuario-rol.entity';
import { UsuarioSucursal } from '../usuario-sucursal/entities/usuario-sucursal.entity/usuario-sucursal.entity';

@Injectable()
export class InventariosService {
  constructor(
    @InjectRepository(Inventario)
    private readonly inventariosRepository: Repository<Inventario>,

    @InjectRepository(Producto)
    private readonly productosRepository: Repository<Producto>,

    @InjectRepository(Sucursal)
    private readonly sucursalesRepository: Repository<Sucursal>,

    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepository: Repository<UsuarioRol>,

    @InjectRepository(UsuarioSucursal)
    private readonly usuarioSucursalRepository: Repository<UsuarioSucursal>,
  ) {}

  private async usuarioTieneAccesoSucursal(
    idUsuario: number,
    idSucursal: number,
  ): Promise<boolean> {
    const usuarioRol = await this.usuarioRolRepository.find({
      where: {
        id_usuario: idUsuario,
      },
      relations: {
        rol: true,
      },
    });

    const nombresRoles = usuarioRol.map((usuarioRol) => usuarioRol.rol.nombre);

    const tieneAccesoGlobal =
      nombresRoles.includes('Administrador') ||
      nombresRoles.includes('Coordinador') ||
      nombresRoles.includes('Contador') ||
      nombresRoles.includes('Fiscal');

    if (tieneAccesoGlobal) {
      return true;
    }

    const asignacion = await this.usuarioSucursalRepository.findOne({
      where: {
        id_usuario: idUsuario,
        id_sucursal: idSucursal,
      },
    });

    return !!asignacion;
  }
  async findAll(idUsuario: number): Promise<Inventario[]> {
    const usuarioRoles = await this.usuarioRolRepository.find({
      where: {
        id_usuario: idUsuario,
      },
      relations: {
        rol: true,
      },
    });

    const nombresRoles = usuarioRoles.map(
      (usuarioRol) => usuarioRol.rol.nombre,
    );

    const tieneAccesoGlobal =
      nombresRoles.includes('Administrador') ||
      nombresRoles.includes('Coordinador') ||
      nombresRoles.includes('Contador') ||
      nombresRoles.includes('Fiscal');

    // Los roles globales pueden consultar todos los inventarios.
    if (tieneAccesoGlobal) {
      return this.inventariosRepository.find({
        relations: {
          producto: true,
          sucursal: true,
        },
      });
    }

    // Para roles operativos, obtenemos las sucursales asignadas.
    const asignaciones = await this.usuarioSucursalRepository.find({
      where: {
        id_usuario: idUsuario,
      },
    });

    const idsSucursales = asignaciones.map(
      (asignacion) => asignacion.id_sucursal,
    );

    // Si no tiene ninguna sucursal asignada, no puede consultar inventarios.
    if (idsSucursales.length === 0) {
      return [];
    }

    return this.inventariosRepository
      .createQueryBuilder('inventario')
      .leftJoinAndSelect('inventario.producto', 'producto')
      .leftJoinAndSelect('inventario.sucursal', 'sucursal')
      .where('inventario.id_sucursal IN (:...idsSucursales)', {
        idsSucursales,
      })
      .getMany();
  }

  async findOne(id: number, idUsuario: number): Promise<Inventario> {
    const inventario = await this.inventariosRepository.findOne({
      where: { id_inventario: id },
      relations: {
        producto: true,
        sucursal: true,
      },
    });

    if (!inventario) {
      throw new NotFoundException(`El inventario con ID ${id} no existe`);
    }

    const tieneAcceso = await this.usuarioTieneAccesoSucursal(
      idUsuario,
      inventario.id_sucursal,
    );

    if (!tieneAcceso) {
      throw new ForbiddenException(
        'No tiene acceso al inventario de esta sucursal',
      );
    }

    return inventario;
  }

  async create(
    createInventarioDto: CreateInventarioDto,
    idUsuario: number,
  ): Promise<Inventario> {
    const producto = await this.productosRepository.findOne({
      where: {
        id_producto: createInventarioDto.id_producto,
      },
    });

    if (!producto) {
      throw new NotFoundException(
        `El producto con ID ${createInventarioDto.id_producto} no existe`,
      );
    }

    const sucursal = await this.sucursalesRepository.findOne({
      where: {
        id_sucursal: createInventarioDto.id_sucursal,
      },
    });

    if (!sucursal) {
      throw new NotFoundException(
        `La sucursal con ID ${createInventarioDto.id_sucursal} no existe`,
      );
    }

    const tieneAcceso = await this.usuarioTieneAccesoSucursal(
      idUsuario,
      createInventarioDto.id_sucursal,
    );

    if (!tieneAcceso) {
      throw new ForbiddenException('No tiene acceso a esta sucursal');
    }

    const inventarioExistente = await this.inventariosRepository.findOne({
      where: {
        id_producto: createInventarioDto.id_producto,
        id_sucursal: createInventarioDto.id_sucursal,
      },
    });

    if (inventarioExistente) {
      throw new ForbiddenException(
        'Ya existe un inventario para este producto en esta sucursal',
      );
    }

    const inventario = this.inventariosRepository.create(createInventarioDto);

    return this.inventariosRepository.save(inventario);
  }
}
