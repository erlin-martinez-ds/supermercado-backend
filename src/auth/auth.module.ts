import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { Usuario } from '../usuarios/entities/usuario.entity/usuario.entity';

import { JwtStrategy } from './jwt.strategy';
import { UsuarioRol } from '../usuario-rol/entities/usuario-rol.entity/usuario-rol.entity';
import { RolesGuard } from './roles.guard';
import { JwtAuthGuard } from './jwt-auth.guard';

@Module({
  imports: [
    TypeOrmModule.forFeature([Usuario, UsuarioRol]),

    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],

      useFactory: (configService: ConfigService) => ({
        secret: configService.getOrThrow<string>('JWT_SECRET'),

        signOptions: {
          expiresIn: '8h',
        },
      }),
    }),
  ],
  exports: [JwtAuthGuard, RolesGuard],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, RolesGuard, JwtAuthGuard],
})
export class AuthModule {}
