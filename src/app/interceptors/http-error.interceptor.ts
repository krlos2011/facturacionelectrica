import { HttpEvent, HttpInterceptor, HttpHandler, HttpRequest, HttpErrorResponse } from '@angular/common/http';
import * as rxjs from 'rxjs';
import * as rxjsOperators from 'rxjs/operators';

export class CatchErrorInterceptor implements HttpInterceptor {
  intercept(request: HttpRequest<any>, next: HttpHandler): rxjs.Observable<HttpEvent<any>> {

    return next
      .handle(request).pipe(
        rxjsOperators.tap((event: HttpEvent<any>) => { }, (err: any) => {
          if (err instanceof HttpErrorResponse) {
            let text = (err.error && err.error.message) ? err.error.message : err.statusText;
            (<any>window).globalEvents.emit('open error dialog', text);
          }
        }
        )
      );

  };
}