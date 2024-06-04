import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
} from '@nestjs/common';
import * as chalk from 'chalk';
import { log } from 'console';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class DocumentInterceptor implements NestInterceptor {
  private readonly logger = new Logger(DocumentInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    this.logger.log(
      `Interceptor handling request ${request.method} ${request.url}`,
    );
    return next.handle().pipe(
      map((data) => {
        log(chalk.cyan(`Response: ${JSON.stringify(data)}`));
        return data;
      }),
    );
  }
}
