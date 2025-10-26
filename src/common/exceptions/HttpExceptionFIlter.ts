import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { ResponseMessages } from '../constants/ResponseMessage';

@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: HttpException, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();

    const status: number = exception.getStatus
      ? exception.getStatus()
      : HttpStatus.INTERNAL_SERVER_ERROR;

    const exceptionResponse = exception.getResponse() as
      | string
      | { message: string | string[] };

    let errorMessage =
      typeof exceptionResponse === 'string'
        ? exceptionResponse
        : Array.isArray(exceptionResponse.message)
          ? exceptionResponse.message.join(', ')
          : exceptionResponse.message;

    const predefinedMessages = {
      [HttpStatus.INTERNAL_SERVER_ERROR]:
        ResponseMessages.Error.internalServerError,
    };

    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    errorMessage = predefinedMessages[status] || errorMessage;

    response.status(status).json({
      statusCode: status,
      message: errorMessage,
      error: HttpStatus[status],
    });
  }
}
