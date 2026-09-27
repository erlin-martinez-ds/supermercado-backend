import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Usuario } from './entities/usuario.entity/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsuariosService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuariosRepository: Repository<Usuario>,
  ) {}

  async findAll(): Promise<Usuario[]> {
    return this.usuariosRepository.find();
  }

  async findOne(id: number): Promise<Usuario> {
    const usuario = await this.usuariosRepository.findOne({
      where: { id_usuario: id },
    });

    if (!usuario) {
      throw new NotFoundException(`El usuario con ID ${id} no existe`);
    }

    return usuario;
  }

  async create(
    createUsuarioDto: CreateUsuarioDto,
  ): Promise<Omit<Usuario, 'password'>> {
    const passwordHash = await bcrypt.hash(createUsuarioDto.password, 10);

    const usuario = this.usuariosRepository.create({
      ...createUsuarioDto,
      password: passwordHash,
    });

    const usuarioGuardado = await this.usuariosRepository.save(usuario);
    const { password, ...usuarioSinPassword } = usuarioGuardado;
    void password;

    return usuarioSinPassword;
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<Omit<Usuario, 'password'>> {
    const usuario = await this.findOne(id);

    if (updateUsuarioDto.password) {
      updateUsuarioDto.password = await bcrypt.hash(
        updateUsuarioDto.password,
        10,
      );
    }

    Object.assign(usuario, updateUsuarioDto);

    const usuarioActualizado = await this.usuariosRepository.save(usuario);
    const { password, ...usuarioSinPassword } = usuarioActualizado;
    void password;

    return usuarioSinPassword;
  }
}
