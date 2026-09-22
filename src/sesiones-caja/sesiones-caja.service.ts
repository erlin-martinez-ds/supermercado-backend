import {
  ConflictException,
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

import { SesionCaja } from './entities/sesion-caja.entity/sesion-caja.entity';
import { CreateSesionCajaDto } from './dto/create-sesion-caja.dto';
import { CerrarSesionCajaDto } from './dto/cerrar-sesion-caja.dto';

import { Caja } from '../cajas/entities/caja.entity/caja.entity';
import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { UsuarioSucursal } from '../usuario-sucursal/entities/usuario-sucursal.entity/usuario-sucursal.entity';
import { Venta } from '../ventas/entities/venta.entity/venta.entity';
import { PagoVenta } from '../ventas/entities/pago-venta.entity/pago-venta.entity';
import { UsuarioRol } from '../usuario-rol/entities/usuario-rol.entity/usuario-rol.entity';
@Injectable()
export class SesionesCajaService {
  constructor(
    @InjectRepository(SesionCaja)
    private readonly sesionCajaRepository: Repository<SesionCaja>,

    @InjectRepository(Caja)
    private readonly cajaRepository: Repository<Caja>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(UsuarioSucursal)
    private readonly usuarioSucursalRepository: Repository<UsuarioSucursal>,

    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,

    @InjectRepository(PagoVenta)
    private readonly pagoVentaRepository: Repository<PagoVenta>,

    @InjectRepository(UsuarioRol)
    private readonly usuarioRolRepository: Repository<UsuarioRol>,

    private readonly dataSource: DataSource,
  ) {}

  async findAll(idUsuario: number): Promise<SesionCaja[]> {
    const rolesGlobales = [
      'Administrador',
      'Coordinador',
      'Contador',
      'Fiscal',
    ];

    const rolesUsuario = await this.usuarioRolRepository.find({
      where: {
        id_usuario: idUsuario,
      },
      relations: {
        rol: true,
      },
    });

    const tieneAccesoGlobal = rolesUsuario.some((usuarioRol) =>
      rolesGlobales.includes(usuarioRol.rol.nombre),
    );

    // Estos roles pueden consultar todas las sucursales
    if (tieneAccesoGlobal) {
      return this.sesionCajaRepository.find({
        relations: {
          caja: {
            sucursal: true,
          },
          usuario_apertura: true,
        },
        order: {
          id_sesion_caja: 'DESC',
        },
      });
    }

    // Obtener las sucursales asignadas al usuario
    const asignaciones = await this.usuarioSucursalRepository.find({
      where: {
        id_usuario: idUsuario,
      },
    });

    const idsSucursales = asignaciones.map(
      (asignacion) => asignacion.id_sucursal,
    );

    if (idsSucursales.length === 0) {
      return [];
    }

    return this.sesionCajaRepository
      .createQueryBuilder('sesion')
      .leftJoinAndSelect('sesion.caja', 'caja')
      .leftJoinAndSelect('caja.sucursal', 'sucursal')
      .leftJoinAndSelect('sesion.usuario_apertura', 'usuario')
      .where('caja.id_sucursal IN (:...idsSucursales)', {
        idsSucursales,
      })
      .orderBy('sesion.id_sesion_caja', 'DESC')
      .getMany();
  }

  async findOne(id: number, idUsuario: number): Promise<SesionCaja> {
    const sesion = await this.sesionCajaRepository.findOne({
      where: {
        id_sesion_caja: id,
      },
      relations: {
        caja: {
          sucursal: true,
        },
        usuario_apertura: true,
      },
    });

    if (!sesion) {
      throw new NotFoundException(
        `No se encontró la sesión de caja con ID ${id}`,
      );
    }

    const rolesGlobales = [
      'Administrador',
      'Coordinador',
      'Contador',
      'Fiscal',
    ];

    const rolesUsuario = await this.usuarioRolRepository.find({
      where: {
        id_usuario: idUsuario,
      },
      relations: {
        rol: true,
      },
    });

    const tieneAccesoGlobal = rolesUsuario.some((usuarioRol) =>
      rolesGlobales.includes(usuarioRol.rol.nombre),
    );

    if (tieneAccesoGlobal) {
      return sesion;
    }

    const accesoSucursal = await this.usuarioSucursalRepository.findOne({
      where: {
        id_usuario: idUsuario,
        id_sucursal: sesion.caja.id_sucursal,
      },
    });

    if (!accesoSucursal) {
      throw new ForbiddenException(
        'No tiene acceso a la sucursal de esta sesión de caja',
      );
    }

    return sesion;
  }

  async findAbiertaPorCaja(
    idCaja: number,
    idUsuario: number,
  ): Promise<SesionCaja> {
    const caja = await this.cajaRepository.findOne({
      where: {
        id_caja: idCaja,
      },
    });

    if (!caja) {
      throw new NotFoundException(`No se encontró la caja con ID ${idCaja}`);
    }

    const rolesGlobales = [
      'Administrador',
      'Coordinador',
      'Contador',
      'Fiscal',
    ];

    const rolesUsuario = await this.usuarioRolRepository.find({
      where: {
        id_usuario: idUsuario,
      },
      relations: {
        rol: true,
      },
    });

    const tieneAccesoGlobal = rolesUsuario.some((usuarioRol) =>
      rolesGlobales.includes(usuarioRol.rol.nombre),
    );

    if (!tieneAccesoGlobal) {
      const accesoSucursal = await this.usuarioSucursalRepository.findOne({
        where: {
          id_usuario: idUsuario,
          id_sucursal: caja.id_sucursal,
        },
      });

      if (!accesoSucursal) {
        throw new ForbiddenException(
          'No tiene acceso a la sucursal de esta caja',
        );
      }
    }

    const sesion = await this.sesionCajaRepository.findOne({
      where: {
        id_caja: idCaja,
        estado: 'ABIERTA',
      },
      relations: {
        caja: {
          sucursal: true,
        },
        usuario_apertura: true,
      },
    });

    if (!sesion) {
      throw new NotFoundException(
        `La caja con ID ${idCaja} no tiene una sesión abierta`,
      );
    }

    return sesion;
  }

  async abrir(
    dto: CreateSesionCajaDto,
    idUsuario: number,
  ): Promise<SesionCaja> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const caja = await queryRunner.manager.findOne(Caja, {
        where: {
          id_caja: dto.id_caja,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!caja) {
        throw new NotFoundException(
          `No se encontró la caja con ID ${dto.id_caja}`,
        );
      }

      if (caja.estado !== 'ACTIVA') {
        throw new BadRequestException(
          'No se puede abrir una sesión en una caja inactiva',
        );
      }

      const usuario = await queryRunner.manager.findOne(Usuario, {
        where: {
          id_usuario: idUsuario,
        },
      });

      if (!usuario) {
        throw new NotFoundException(`No se encontró el usuario ${idUsuario}`);
      }

      if (usuario.estado !== 'ACTIVO') {
        throw new BadRequestException(
          'No se puede abrir una sesión con un usuario inactivo',
        );
      }

      const accesoSucursal = await queryRunner.manager.findOne(
        UsuarioSucursal,
        {
          where: {
            id_usuario: idUsuario,
            id_sucursal: caja.id_sucursal,
          },
        },
      );

      if (!accesoSucursal) {
        throw new BadRequestException(
          'El usuario no tiene acceso a la sucursal de esta caja',
        );
      }

      const sesionAbierta = await queryRunner.manager.findOne(SesionCaja, {
        where: {
          id_caja: dto.id_caja,
          estado: 'ABIERTA',
        },
      });

      if (sesionAbierta) {
        throw new ConflictException(
          `La caja ${caja.nombre} ya tiene una sesión abierta`,
        );
      }

      const sesion = queryRunner.manager.create(SesionCaja, {
        id_caja: dto.id_caja,
        id_usuario_apertura: idUsuario,
        monto_inicial: dto.monto_inicial,
        estado: 'ABIERTA',
        observaciones: dto.observaciones ?? null,
      });

      const sesionGuardada = await queryRunner.manager.save(SesionCaja, sesion);

      await queryRunner.commitTransaction();

      return sesionGuardada;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async cerrar(
    id: number,
    dto: CerrarSesionCajaDto,
    idUsuarioCierre: number,
  ): Promise<SesionCaja> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const sesion = await queryRunner.manager.findOne(SesionCaja, {
        where: {
          id_sesion_caja: id,
        },
        relations: {
          caja: true,
        },
        lock: {
          mode: 'pessimistic_write',
        },
      });

      if (!sesion) {
        throw new NotFoundException(
          `No se encontró la sesión de caja con ID ${id}`,
        );
      }

      if (sesion.estado !== 'ABIERTA') {
        throw new ConflictException('La sesión de caja ya está cerrada');
      }

      const rolesUsuario = await queryRunner.manager.find(UsuarioRol, {
        where: {
          id_usuario: idUsuarioCierre,
        },
        relations: {
          rol: true,
        },
      });

      const rolesCierreAdministrativo = [
        'Administrador',
        'Coordinador',
        'Encargado de sucursal',
      ];

      const puedeCerrarAdministrativamente = rolesUsuario.some((usuarioRol) =>
        rolesCierreAdministrativo.includes(usuarioRol.rol.nombre),
      );

      const esUsuarioQueAbrio =
        Number(sesion.id_usuario_apertura) === Number(idUsuarioCierre);

      if (!esUsuarioQueAbrio && !puedeCerrarAdministrativamente) {
        throw new ForbiddenException(
          'Solo el usuario que abrió la sesión o un responsable autorizado puede cerrarla',
        );
      }

      const usuario = await queryRunner.manager.findOne(Usuario, {
        where: {
          id_usuario: idUsuarioCierre,
        },
      });

      if (!usuario) {
        throw new NotFoundException(
          `No se encontró el usuario ${idUsuarioCierre}`,
        );
      }

      if (usuario.estado !== 'ACTIVO') {
        throw new BadRequestException(
          'No se puede cerrar una sesión con un usuario inactivo',
        );
      }

      const accesoSucursal = await queryRunner.manager.findOne(
        UsuarioSucursal,
        {
          where: {
            id_usuario: idUsuarioCierre,
            id_sucursal: sesion.caja.id_sucursal,
          },
        },
      );

      if (!accesoSucursal) {
        throw new BadRequestException(
          'El usuario no tiene acceso a la sucursal donde se encuentra esta caja',
        );
      }

      const pagosEfectivo = await queryRunner.manager
        .createQueryBuilder(PagoVenta, 'pago')
        .innerJoin('pago.venta', 'venta')
        .innerJoin('pago.metodo_pago', 'metodo')
        .where('venta.id_sesion_caja = :idSesion', {
          idSesion: id,
        })
        .andWhere('venta.estado = :estado', {
          estado: 'CONFIRMADA',
        })
        .andWhere('metodo.nombre = :metodo', {
          metodo: 'Efectivo en caja',
        })
        .select('COALESCE(SUM(pago.monto), 0)', 'total')
        .getRawOne();

      const totalEfectivo = Number(pagosEfectivo?.total ?? 0);

      const efectivoEsperado = Number(sesion.monto_inicial) + totalEfectivo;

      const diferencia = Number(
        (Number(dto.monto_final) - efectivoEsperado).toFixed(2),
      );

      sesion.estado = 'CERRADA';
      sesion.fecha_cierre = new Date();
      sesion.id_usuario_cierre = idUsuarioCierre;
      sesion.efectivo_esperado = efectivoEsperado;
      sesion.monto_final = dto.monto_final;
      sesion.diferencia = diferencia;

      if (dto.observaciones !== undefined) {
        sesion.observaciones = dto.observaciones;
      }

      const sesionCerrada = await queryRunner.manager.save(SesionCaja, sesion);

      await queryRunner.commitTransaction();

      return sesionCerrada;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
