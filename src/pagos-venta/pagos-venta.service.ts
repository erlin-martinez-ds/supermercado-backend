import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { PagoVenta } from '../ventas/entities/pago-venta.entity/pago-venta.entity';
import { Venta } from '../ventas/entities/venta.entity/venta.entity';
import { MetodoPago } from '../metodos-pago/entities/metodo-pago.entity/metodo-pago.entity';
import { CreatePagoVentaDto } from './dto/create-pago-venta.dto';

@Injectable()
export class PagosVentaService {
  constructor(
    @InjectRepository(PagoVenta)
    private readonly pagoVentaRepository: Repository<PagoVenta>,

    @InjectRepository(Venta)
    private readonly ventaRepository: Repository<Venta>,

    @InjectRepository(MetodoPago)
    private readonly metodoPagoRepository: Repository<MetodoPago>,
  ) {}

  async findAll(): Promise<PagoVenta[]> {
    return this.pagoVentaRepository.find({
      relations: { venta: true, metodo_pago: true },
    });
  }

  async findByVenta(idVenta: number): Promise<PagoVenta[]> {
    const pagos = await this.pagoVentaRepository.find({
      where: { id_venta: idVenta },
      relations: { venta: true, metodo_pago: true },
    });

    return pagos;
  }

  async findOne(id: number): Promise<PagoVenta> {
    const pago = await this.pagoVentaRepository.findOne({
      where: { id_pago_venta: id },
      relations: { venta: true, metodo_pago: true },
    });

    if (!pago) {
      throw new NotFoundException(`No se encontró el pago de venta ${id}`);
    }

    return pago;
  }

  async create(dto: CreatePagoVentaDto): Promise<PagoVenta> {
    const venta = await this.ventaRepository.findOne({
      where: { id_venta: dto.id_venta },
    });

    if (!venta) {
      throw new NotFoundException(`No se encontró la venta ${dto.id_venta}`);
    }

    if (venta.estado === 'ANULADA') {
      throw new BadRequestException(
        `No se puede registrar un pago a una venta anulada (${dto.id_venta})`,
      );
    }

    const metodoPago = await this.metodoPagoRepository.findOne({
      where: { id_metodo_pago: dto.id_metodo_pago },
    });

    if (!metodoPago) {
      throw new NotFoundException(
        `No se encontró el método de pago ${dto.id_metodo_pago}`,
      );
    }

    if (metodoPago.estado !== 'ACTIVO') {
      throw new BadRequestException(
        `El método de pago "${metodoPago.nombre}" está inactivo y no se puede usar en esta venta`,
      );
    }

    const pagosExistentes = await this.pagoVentaRepository.find({
      where: { id_venta: dto.id_venta },
    });

    const totalPagosActuales = pagosExistentes.reduce(
      (sum, pago) => sum + Number(pago.monto),
      0,
    );

    const montoNuevo = Number(dto.monto);
    const totalVenta = Number(venta.total);

    if (totalPagosActuales + montoNuevo > totalVenta) {
      throw new BadRequestException(
        `El monto del pago (${montoNuevo.toFixed(2)}) excede el total de la venta (${totalVenta.toFixed(2)}). El total acumulado ya es ${totalPagosActuales.toFixed(2)}`,
      );
    }

    const pago = this.pagoVentaRepository.create({
      id_venta: dto.id_venta,
      id_metodo_pago: dto.id_metodo_pago,
      monto: dto.monto,
      referencia: dto.referencia ?? null,
    });

    return this.pagoVentaRepository.save(pago);
  }
}
