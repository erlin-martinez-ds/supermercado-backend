import {
  ArgumentsHost,
  Catch,
  ConflictException,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';

@Catch()
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Errores provenientes de MySQL
    if (exception?.code === 'ER_DUP_ENTRY') {
      return response.status(HttpStatus.CONFLICT).json({
        statusCode: HttpStatus.CONFLICT,
        message: 'Ya existe un registro con esa información',
        error: 'Conflict',
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    // Excepciones normales generadas por NestJS
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      return response.status(status).json({
        ...(typeof exceptionResponse === 'string'
          ? { message: exceptionResponse }
          : exceptionResponse),
        path: request.url,
        timestamp: new Date().toISOString(),
      });
    }

    // Error inesperado
    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      message: 'Error interno del servidor',
      error: 'Internal Server Error',
      path: request.url,
      timestamp: new Date().toISOString(),
    });
  }
}