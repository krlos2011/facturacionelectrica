import { ApiService } from './api.service';
import { HttpParams, HttpHeaders } from '@angular/common/http';
import * as rxjs from 'rxjs';

import { Hour } from 'app/models';

import { environment } from 'environments/environment';

describe('ApiService', () => {

  let apiService: ApiService,
    httpClientStub: any;

  beforeEach(() => {

    httpClientStub = {
      get: jasmine.createSpy('httpClient.get').and.callFake(() => rxjs.of({})),
      post: jasmine.createSpy('httpClient.post').and.callFake(() => rxjs.of({})),
      put: jasmine.createSpy('httpClient.put').and.callFake(() => rxjs.of({})),
      delete: jasmine.createSpy('httpClient.delete').and.callFake(() => rxjs.of({})),
    }

    apiService = new ApiService(httpClientStub);
  });

  describe('getList method', () => {

    beforeEach(() => {
      httpClientStub.get.and.callFake(() => rxjs.of({
        body: [{ _id: 'item1Id' }],
        headers: {
          get: jasmine.createSpy('httpClient.get.headers.get').and.callFake((indicator) => {
            switch (indicator) {
              case 'x-total-count':
                return 100;
              case 'x-total-pages':
                return 10;
              default:
                return -1;
            }
          })
        }
      }));
    })

    it('calls httpClient.get with the correct args', () => {
      let params = new HttpParams();

      apiService.getList<Hour>(Hour, { limit: 10, page: 1 })
        .subscribe();

      params = params.set('limit', '10');
      params = params.set('page', '1');

      expect(httpClientStub.get.calls.argsFor(0)[0]).toBe(environment.apiHost + Hour.prototype.getResourceName());
      expect(httpClientStub.get.calls.argsFor(0)[1].observe).toBe('response');
      expect(httpClientStub.get.calls.argsFor(0)[1].params.get('limit')).toBe(10);
      expect(httpClientStub.get.calls.argsFor(0)[1].params.get('page')).toBe(1);

    });

    it('map the httpClient.get response creating new T instances and adding $totalCount and $totalPages and return it', () => {

      let result;
      apiService.getList<Hour>(Hour, {})
        .subscribe(
          list => result = list
        );

      expect(result[0].constructor).toBe(Hour);
      expect(result[0].getId()).toBe('item1Id');
      expect(result.$totalCount).toBe(100);
      expect(result.$totalPages).toBe(10);

    });

  });

  describe('post method', () => {

    let hour,
      data;

    beforeEach(() => {
      hour = new Hour({ _id: 'hourId' });
      spyOn(hour, 'init').and.callThrough();

      data = { _id: 'hourId', price: 1 };

      httpClientStub.post.and.callFake(() => rxjs.of(Object.assign({ cost: 2 }, data)));
    })

    it('calls httpClient.post with the correct args (with object)', () => {
      apiService.post<Hour>(Hour, hour, data)
        .subscribe();

      expect(httpClientStub.post).toHaveBeenCalledWith(environment.apiHost + Hour.prototype.getResourceName() + '/hourId', data);

    });

    it('calls httpClient.post with the correct args (without object)', () => {
      apiService.post<Hour>(Hour, null, data)
        .subscribe();

      expect(httpClientStub.post).toHaveBeenCalledWith(environment.apiHost + Hour.prototype.getResourceName(), data);

    });

    it('map the httpClient.post response with object.init, if object', () => {

      let objResult;

      apiService.post<Hour>(Hour, hour, data)
        .subscribe(
          result => objResult = result,
        );

      expect(hour.init).toHaveBeenCalledWith({ _id: 'hourId', price: 1, cost: 2 });
      expect(objResult).toBe(hour);
      expect(hour.cost).toBe(2);
    });

    it('map the httpClient.post response creating a new instance of T', () => {

      let objResult;

      apiService.post<Hour>(Hour, null, data)
        .subscribe(
          result => objResult = result,
        );

      expect(objResult.constructor).toBe(Hour);
      expect(objResult.cost).toBe(2);
    });

    it('if T is Hour and statsSubject, calls statsSubject.next', () => {

      (apiService as any).statsSubject = {
        next: jasmine.createSpy('statsSubject.next')
      };

      apiService.post<Hour>(Hour, null, data)
        .subscribe(
        );

      expect((apiService as any).statsSubject.next).toHaveBeenCalledWith(true);
    });

  });

  describe('put method', () => {

    let hour,
      data;

    beforeEach(() => {
      hour = new Hour({ _id: 'hourId' });
      spyOn(hour, 'init').and.callThrough();

      data = { _id: 'hourId', price: 1 };

      httpClientStub.put.and.callFake(() => rxjs.of(Object.assign({ cost: 2 }, data)));
    })

    it('calls httpClient.put with the correct args (with object)', () => {
      apiService.put<Hour>(Hour, hour, data)
        .subscribe();

      expect(httpClientStub.put).toHaveBeenCalledWith(environment.apiHost + Hour.prototype.getResourceName() + '/hourId', data);

    });

    it('map the httpClient.put response with object.init, if object', () => {

      let objResult;

      apiService.put<Hour>(Hour, hour, data)
        .subscribe(
          result => objResult = result,
        );

      expect(hour.init).toHaveBeenCalledWith({ _id: 'hourId', price: 1, cost: 2 });
      expect(objResult).toBe(hour);
      expect(hour.cost).toBe(2);
    });

    it('if T is Hour and statsSubject, calls statsSubject.next', () => {

      (apiService as any).statsSubject = {
        next: jasmine.createSpy('statsSubject.next')
      };

      apiService.put<Hour>(Hour, hour, data)
        .subscribe(
        );

      expect((apiService as any).statsSubject.next).toHaveBeenCalledWith(true);
    });

  });

  describe('delete method', () => {

    let hour;

    beforeEach(() => {
      hour = new Hour({ _id: 'hourId' });
      spyOn(hour, 'init').and.callThrough();

      httpClientStub.delete.and.callFake(() => rxjs.of({}));
    })

    it('calls httpClient.delete with the correct args (with object)', () => {
      apiService.delete<Hour>(Hour, hour)
        .subscribe();

      expect(httpClientStub.delete).toHaveBeenCalledWith(environment.apiHost + Hour.prototype.getResourceName() + '/hourId');

    });

    it('map the httpClient.delete response returning the object', () => {

      let objResult;

      apiService.delete<Hour>(Hour, hour)
        .subscribe(
          result => objResult = result,
        );

      expect(objResult).toBe(hour);
    });

    it('if T is Hour and statsSubject, calls statsSubject.next', () => {

      (apiService as any).statsSubject = {
        next: jasmine.createSpy('statsSubject.next')
      };

      apiService.delete<Hour>(Hour, hour)
        .subscribe(
        );

      expect((apiService as any).statsSubject.next).toHaveBeenCalledWith(true);
    });

  });

  describe('import method', () => {

    let file: any;


    beforeEach(() => {
      file = {
        name: 'File Name'
      }
    });

    it('calls httpClient.post with the correct args', () => {
      let formData: FormData = new FormData();
      formData.append('file', file, file.name);

      let headers = new HttpHeaders();
      headers = headers.append('Accept', 'application/json');

      apiService.import<Hour>(Hour, file, { foo: 'fooParam' })
        .subscribe();

      expect(httpClientStub.post).toHaveBeenCalledWith(
        environment.apiHost + Hour.prototype.getResourceName() + '/import',
        formData,
        {
          headers: headers,
          params: { foo: 'fooParam' }
        });
    });

    it('if T is Hour and statsSubject, calls statsSubject.next', () => {

      (apiService as any).statsSubject = {
        next: jasmine.createSpy('statsSubject.next')
      };

      apiService.import<Hour>(Hour, file, { foo: 'fooParam' })
        .subscribe();

      expect((apiService as any).statsSubject.next).toHaveBeenCalledWith(true);
    });

  });

  describe('getStatsSubject method', () => {

    it('initialize statsSubject if is null and return it as Observable', () => {
      (apiService as any).statsSubject = null;
      const statsSubject = apiService.getStatsSubject();
      expect((apiService as any).statsSubject.constructor).toBe(rxjs.Subject);
      expect(statsSubject).toEqual((apiService as any).statsSubject.asObservable());
    });

    it('if statsSubject already initialized, return it as Observable without creating a new instance', () => {
      const firstInstance = new rxjs.Subject<boolean>();
      (apiService as any).statsSubject = firstInstance;
      expect(apiService.getStatsSubject()).toEqual((apiService as any).statsSubject.asObservable());
      expect((apiService as any).statsSubject).toBe(firstInstance);
    });

  });

  describe('getStats method', () => {

    it('calls httpClient.get with the correct args', () => {
      apiService.getStats<any>('testPath')
        .subscribe();

      expect(httpClientStub.get).toHaveBeenCalledWith(environment.apiHost + '/stats/testPath');

    });

  });

});