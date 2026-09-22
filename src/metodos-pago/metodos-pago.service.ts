import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { MetodoPago } from './entities/metodo-pago.entity/metodo-pago.entity';
import { CreateMetodoPagoDto } from './dto/create-metodo-pago.dto';
import { UpdateMetodoPagoDto } from './dto/update-metodo-pago.dto';

@Injectable()
export class MetodosPagoService {
  constructor(
    @InjectRepository(MetodoPago)
    private readonly metodosPagoRepository: Repository<MetodoPago>,
  ) {}

  async findAll(): Promise<MetodoPago[]> {
    return this.metodosPagoRepository.find();
  }

  async findOne(id: number): Promise<MetodoPago> {
    const metodoPago = await this.metodosPagoRepository.findOne({
      where: { id_metodo_pago: id },
    });

    if (!metodoPago) {
      throw new NotFoundException(
        `El método de pago con ID ${id} no existe`,
      );
    }

    return metodoPago;
  }

  async create(
    createMetodoPagoDto: CreateMetodoPagoDto,
  ): Promise<MetodoPago> {
    const metodoPago = this.metodosPagoRepository.create(
      createMetodoPagoDto,
    );

    return this.metodosPagoRepository.save(metodoPago);
  }

  async update(
    id: number,
    updateMetodoPagoDto: UpdateMetodoPagoDto,
  ): Promise<MetodoPago> {
    const metodoPago = await this.findOne(id);

    Object.assign(metodoPago, updateMetodoPagoDto);

    return this.metodosPagoRepository.save(metodoPago);
  }
}