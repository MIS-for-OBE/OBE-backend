import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable()
export class RepoInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    return next.handle().pipe(map((data) => this.transformId(data)));
  }

  private transformId(document: any): any {
    if (Array.isArray(document)) {
      return document.map((doc) => this.replaceId(doc));
    }
    return this.replaceId(document);
  }

  private replaceId(doc: any): any {
    if (doc && doc._id) {
      doc.id = doc._id;
      delete doc._id;
    }
    return doc;
  }
}
