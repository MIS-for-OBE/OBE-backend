import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  HttpException,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import * as _ from 'lodash';
import * as jsonwebtoken from 'jsonwebtoken';
import { buildBodyPayload } from './helper/logging.helper';

@Injectable()
export class DocumentInterceptor implements NestInterceptor {
  private readonly reqLogger = new Logger('HttpRequest');
  private readonly resLogger = new Logger('HttpResponse');
  private readonly reqLogEnabled: boolean = true;
  private readonly resLogEnabled: boolean = true;

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    try {
      const ctx = context?.switchToHttp();
      const req = ctx?.getRequest();
      const res = ctx?.getResponse();

      const now = Date?.now();
      this.logReq(req);
      if (!this.resLogEnabled) {
        return next.handle();
      }
      return next.handle().pipe(
        tap((resBody) => {
          this.logSuccessRes(req, res, resBody, now);
        }),
        catchError((err) => {
          this.logErrorRes(req, err, now);
          return throwError(() => err);
        }),
      );
    } catch (error) {
      return next.handle();
    }
  }

  getUserToken(req) {
    const token = (req.headers.authorization || '')
      .replace(/bearer|Bearer/, '')
      .trim();
    const result = jsonwebtoken.decode(token);
    return result;
  }

  getFullPath(req) {
    const fullPath = req.baseUrl + req.path;
    return req.method + ' ' + fullPath;
  }

  logReq(req) {
    try {
      if (!this.reqLogEnabled) {
        return;
      }
      const userToken = this.getUserToken(req);
      this.reqLogger.log(
        'Request',

        {
          userToken,
          path: this.getFullPath(req),
          ...(_.includes(['GET', 'DELETE'], req.method)
            ? { query: req.query }
            : {
                body: buildBodyPayload(req.body),
                query: _.isEmpty(req.query) ? undefined : req.query,
              }),
        },
      );
    } catch (error) {
      // continue
    }
  }

  logSuccessRes(req, res, resBody, now) {
    try {
      const ms = now ? Date.now() - now : '-';
      this.resLogger.log(
        'Response',

        {
          status: res?.statusCode || 200,
          path: this.getFullPath(req),
          durationMs: ms,
          data: resBody,
        },
      );
    } catch (error) {
      // continue
    }
  }

  logErrorRes(req, err, now) {
    try {
      const ms = now ? Date.now() - now : '-';
      const defaultResult = {
        status: 500,
        path: this.getFullPath(req),
        durationMs: ms,
      };
      if (err instanceof Error) {
        const statusCode = (err as any)?.status;
        if (statusCode === 200) {
          this.resLogger.log('Response', {
            ...defaultResult,
            status: 200,
            data: (err as any)?.data || {},
          });
          return;
        }
      }

      if (err instanceof HttpException) {
        const status = err.getStatus();
        this.resLogger.log('Response', { ...defaultResult, status });
        this.resLogger.error(err, err?.stack);
      } else {
        this.resLogger.log('Response', defaultResult);
      }
    } catch (error) {
      // continue
    }
  }
}
