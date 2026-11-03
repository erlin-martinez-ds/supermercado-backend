import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@ApiTags('general')
@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @ApiOperation({ summary: 'Listar general' })
  @ApiResponse({ status: 200, description: 'Respuesta exitosa' })
  @Get()
  getHello(): string {
    return this.appService.getHello();
  }
}
