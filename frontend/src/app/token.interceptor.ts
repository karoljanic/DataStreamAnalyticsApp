import { Injectable } from '@angular/core';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor
} from '@angular/common/http';
import { Observable } from 'rxjs';
import { LocalStorageService } from './services/localstorage.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {

  constructor(private localStorage: LocalStorageService) { }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const userData = JSON.parse(this.localStorage.get(LocalStorageService.userKey) || '{}');
    if (userData.token) {
      request = request.clone({
        setHeaders: {
          Authorization: `Token ${userData.token}`
        }
      });
    }
    return next.handle(request);
  }
}
