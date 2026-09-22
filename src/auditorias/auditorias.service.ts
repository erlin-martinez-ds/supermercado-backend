import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { EntityManager } from 'typeorm';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Auditoria } from './entities/auditoria.entity/auditoria.entity';

import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';
import { Sucursal } from '../sucursales/entities/sucursal.entity/sucursal.entity';

import { CreateAuditoriaDto } from './dto/create-auditoria.dto';

@Injectable()
export class AuditoriasService {
  constructor(
    @InjectRepository(Auditoria)
    private readonly auditoriaRepository: Repository<Auditoria>,

    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,

    @InjectRepository(Sucursal)
    private readonly sucursalRepository: Repository<Sucursal>,
  ) {}

  async findAll() {
    return this.auditoriaRepository.find({
      relations: { usuario: true, sucursal: true },
      order: {
        id_auditoria: 'DESC',
      },
    });
  }

  async findOne(id: number) {
    const auditoria = await this.auditoriaRepository.findOne({
      where: {
        id_auditoria: id,
      },
      relations: { usuario: true, sucursal: true },
    });

    if (!auditoria) {
      throw new NotFoundException(`No se encontró la auditoría con id ${id}`);
    }

    return auditoria;
  }

  async create(dto: CreateAuditoriaDto) {
    let usuario: Usuario | null = null;
    let sucursal: Sucursal | null = null;

    if (dto.id_usuario !== undefined) {
      usuario = await this.usuarioRepository.findOne({
        where: {
          id_usuario: dto.id_usuario,
        },
      });

      if (!usuario) {
        throw new NotFoundException(
          `No se encontró el usuario con id ${dto.id_usuario}`,
        );
      }
    }

    if (dto.id_sucursal !== undefined) {
      sucursal = await this.sucursalRepository.findOne({
        where: {
          id_sucursal: dto.id_sucursal,
        },
      });

      if (!sucursal) {
        throw new NotFoundException(
          `No se encontró la sucursal con id ${dto.id_sucursal}`,
        );
      }
    }

    if (
      dto.datos_anteriores === undefined &&
      dto.datos_nuevos === undefined &&
      !dto.observacion
    ) {
      throw new ConflictException(
        'La auditoría debe contener información del cambio o una observación',
      );
    }

    const auditoria = this.auditoriaRepository.create({
      id_usuario: dto.id_usuario ?? null,
      id_sucursal: dto.id_sucursal ?? null,
      usuario,
      sucursal,
      accion: dto.accion,
      entidad: dto.entidad,
      id_registro: dto.id_registro ?? null,
      datos_anteriores: dto.datos_anteriores ?? null,
      datos_nuevos: dto.datos_nuevos ?? null,
      observacion: dto.observacion ?? null,
    });

    return this.auditoriaRepository.save(auditoria);
  }
  async registrar(
    manager: EntityManager,
    datos: {
      id_usuario?: number | null;
      id_sucursal?: number | null;
      accion: string;
      entidad: string;
      id_registro?: string | null;
      datos_anteriores?: Record<string, any> | null;
      datos_nuevos?: Record<string, any> | null;
      observacion?: string | null;
    },
  ) {
    const auditoriaRepository = manager.getRepository(Auditoria);

    const auditoria = auditoriaRepository.create({
      id_usuario: datos.id_usuario ?? null,
      id_sucursal: datos.id_sucursal ?? null,
      accion: datos.accion,
      entidad: datos.entidad,
      id_registro: datos.id_registro ?? null,
      datos_anteriores: datos.datos_anteriores ?? null,
      datos_nuevos: datos.datos_nuevos ?? null,
      observacion: datos.observacion ?? null,
    });

    return auditoriaRepository.save(auditoria);
  }
}
