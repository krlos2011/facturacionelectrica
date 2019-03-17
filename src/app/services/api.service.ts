import { Injectable } from '@angular/core';
import { HttpClient, HttpParams, HttpHeaders, HttpErrorResponse } from '@angular/common/http';
import * as rxjs from 'rxjs';
import * as rxjsOperators from 'rxjs/operators';

import { Serializable, Hour } from 'app/models';

import { environment } from 'environments/environment';

export interface ApiList<Serializable> extends Array<Serializable> {
  $totalCount?: number;
  $totalPages?: number;
}

@Injectable()
export class ApiService {

  protected statsSubject: rxjs.Subject<boolean>;

  constructor(
    protected httpClient: HttpClient,
  ) {
  }

  protected catchError(error: HttpErrorResponse | string): rxjs.Observable<any> {
    console.error(error);

    if (error instanceof HttpErrorResponse) {
      let text = (error.error && error.error.message) ? error.error.message : error.statusText;
      return rxjs.throwError(text);
    }

    return rxjs.throwError(error);
  }

  public getList<T extends Serializable>(t: { new({ }): T; }, searchParams: any = {}): rxjs.Observable<ApiList<T>> {
    const path = t.prototype.getResourceName();

    let params: HttpParams = new HttpParams();
    for (let key in searchParams) {
      params = params.set(key, searchParams[key]);
    }

    return this.httpClient.get<Array<T>>(
      environment.apiHost + path,
      {
        params: params,
        observe: 'response'
      }
    ).pipe(
      rxjsOperators.map(response => {
        let result: ApiList<T> = <ApiList<T>>response.body.map(object => new t(object));
        result.$totalCount = +response.headers.get('x-total-count');
        result.$totalPages = +response.headers.get('x-total-pages');

        return result;
      }),
      rxjsOperators.catchError(error => this.catchError(error))
    );
  }

  public post<T extends Serializable>(t: { new({ }): T; }, object: T, data: any = {}): rxjs.Observable<T> {

    return this.httpClient.post<T>(
      environment.apiHost + t.prototype.getResourceName() + ((object && object.getId()) ? ('/' + object.getId()) : ''),
      data
    ).pipe(
      rxjsOperators.map(data => {
        let result: T;
        if (object) {
          object.init(data);
          result = object;
        }
        else if (data) {
          const item = new t(data);
          result = item;
        }
        else {
          result = object;
        }

        if (result instanceof Hour && this.statsSubject) {
          this.statsSubject.next(true);
        }

        return result;
      }),
      rxjsOperators.catchError(error => this.catchError(error))
    );
  }

  // Crud methods
  public put<T extends Serializable>(t: { new({ }): T; }, object: T, body: any): rxjs.Observable<T> {

    return this.httpClient.put<T>(
      environment.apiHost + object.getResourceName() + (object.getId() ? ('/' + object.getId()) : ''),
      body
    )
      .pipe(
        rxjsOperators.map(data => {
          object.init(data);

          if (object instanceof Hour && this.statsSubject) {
            this.statsSubject.next(true);
          }

          return object;
        })
      );
  }

  public delete<T extends Serializable>(t: { new({ }): T; }, object: T): rxjs.Observable<T> {

    return this.httpClient.delete(
      environment.apiHost + object.getResourceName() + '/' + object.getId()
    ).pipe(
      rxjsOperators.map(() => {
        if (object instanceof Hour && this.statsSubject) {
          this.statsSubject.next(true);
        }
        return object;
      }),
      rxjsOperators.catchError(error => this.catchError(error))
    );

  }

  public import<T extends Serializable>(t: { new({ }): T; }, file: File, params: any = {}): rxjs.Observable<any> {

    let formData: FormData = new FormData();
    formData.append('file', file, file.name);

    let headers = new HttpHeaders();
    headers = headers.append('Accept', 'application/json');

    return this.httpClient.post(
      environment.apiHost + t.prototype.getResourceName() + '/import',
      formData,
      {
        headers: headers,
        params: params
      }
    )
      .pipe(
        rxjsOperators.map(result => {
          if (new t({}) instanceof Hour && this.statsSubject) {
            this.statsSubject.next(true);
          }
          return result;
        }),
        rxjsOperators.catchError(error => this.catchError(error))
      );

  }

  // Stats methods
  public getStatsSubject(): rxjs.Observable<boolean> {
    if (!this.statsSubject) {
      this.statsSubject = new rxjs.Subject<boolean>();
    }
    return this.statsSubject.asObservable();
  }

  public getStats<T>(path: string): rxjs.Observable<T> {
    return this.httpClient.get<T>(environment.apiHost + '/stats/' + path)
    .pipe(
      rxjsOperators.catchError(error => this.catchError(error))
    );
  }


}
