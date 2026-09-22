import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';

import { InjectRepository } from '@nestjs/typeorm';
import { EntityManager, Repository } from 'typeorm';

import { Factura } from './entities/factura.entity';

@Injectable()
export class FacturasService {
  constructor(
    @InjectRepository(Factura)
    private readonly facturaRepository: Repository<Factura>,
  ) {}

  async findAll(): Promise<Factura[]> {
    return this.facturaRepository.find({
      relations: {
        venta: true,
      },
      order: {
        id_factura: 'DESC',
      },
    });
  }

  async findOne(id: number): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({
      where: {
        id_factura: id,
      },
      relations: {
        venta: true,
      },
    });

    if (!factura) {
      throw new NotFoundException(`No se encontró la factura ${id}`);
    }

    return factura;
  }

  async findByVenta(idVenta: number): Promise<Factura> {
    const factura = await this.facturaRepository.findOne({
      where: {
        id_venta: idVenta,
      },
      relations: {
        venta: true,
      },
    });

    if (!factura) {
      throw new NotFoundException(
        `No existe una factura para la venta ${idVenta}`,
      );
    }

    return factura;
  }

  async crearDesdeVenta(
    manager: EntityManager,
    idVenta: number,
    subtotal: number,
    totalDescuento: number,
    totalImpuesto: number,
    total: number,
  ): Promise<Factura> {
    const facturaExistente = await manager.findOne(Factura, {
      where: {
        id_venta: idVenta,
      },
    });

    if (facturaExistente) {
      throw new BadRequestException(`La venta ${idVenta} ya tiene una factura`);
    }

    const numeroFactura = `FAC-${idVenta}`;

    const factura = manager.create(Factura, {
      id_venta: idVenta,
      numero_factura: numeroFactura,
      fecha_emision: new Date(),
      subtotal,
      total_descuento: totalDescuento,
      total_impuesto: totalImpuesto,
      total,
      estado: 'EMITIDA',
    });

    return manager.save(Factura, factura);
  }
  async anularDesdeVenta(
    manager: EntityManager,
    idVenta: number,
  ): Promise<Factura> {
    const factura = await manager.findOne(Factura, {
      where: {
        id_venta: idVenta,
      },
    });

    if (!factura) {
      throw new NotFoundException(
        `No existe una factura para la venta ${idVenta}`,
      );
    }

    if (factura.estado === 'ANULADA') {
      throw new BadRequestException(
        `La factura de la venta ${idVenta} ya está anulada`,
      );
    }

    factura.estado = 'ANULADA';

    return manager.save(Factura, factura);
  }
}
