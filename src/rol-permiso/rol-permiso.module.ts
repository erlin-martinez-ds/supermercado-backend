import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { RolPermiso } from './entities/rol-permiso.entity/rol-permiso.entity';
import { Rol } from '../roles/entities/rol.entity/rol.entity';
import { Permiso } from '../permisos/entities/permiso.entity/permiso.entity';
import { RolPermisoController } from './rol-permiso.controller';
import { RolPermisoService } from './rol-permiso.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      RolPermiso,
      Rol,
      Permiso,
    ]),
  ],
  controllers: [RolPermisoController],
  providers: [RolPermisoService],
})
export class RolPermisoModule {}