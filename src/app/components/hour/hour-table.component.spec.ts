import { NO_ERRORS_SCHEMA, Injectable, DebugElement, ElementRef } from '@angular/core';
import { TestBed, ComponentFixture, fakeAsync, async, tick } from '@angular/core/testing';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as rxjs from 'rxjs';


import { Hour } from 'app/models';
import { HourTableComponent } from './hour-table.component';
import { ApiService, DialogService } from 'app/services';
import { HourEditModal } from './hour-edit.modal';

describe('HourTableComponent', () => {

  let fixture: ComponentFixture<HourTableComponent>,
    comp: HourTableComponent,

    datePipeStub,
    ngbModalStub,
    apiServiceStub,
    dialogServiceStub;

  beforeEach(() => {

    datePipeStub = {
      transform: jasmine.createSpy('date.transform').and.stub()
    };

    ngbModalStub = {
      open: jasmine.createSpy('ngbModal.open').and.stub()
    };

    apiServiceStub = {
      getStatsSubject: jasmine.createSpy('api.getStatsSubject').and.returnValue(new rxjs.BehaviorSubject({})),
      getList: jasmine.createSpy('api.getList').and.returnValue(rxjs.of([])),
      put: jasmine.createSpy('api.put').and.returnValue(rxjs.of({})),
      delete: jasmine.createSpy('api.delete').and.returnValue(rxjs.of({})),
    };

    dialogServiceStub = {
      confirm: jasmine.createSpy('dialog.confirm').and.stub()
    };

    //Override template if we dont need it
    TestBed.overrideComponent(HourTableComponent, {
      set: {
        template: '<div></div>'
      }
    });

    TestBed.configureTestingModule({
      declarations: [HourTableComponent], // declare the test component
      providers: [
        { provide: DatePipe, useValue: datePipeStub },
        { provide: NgbModal, useValue: ngbModalStub },
        { provide: ApiService, useValue: apiServiceStub },
        { provide: DialogService, useValue: dialogServiceStub },
      ],
      //NO_ERRORS_SCHEMA allow any property on any element
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(HourTableComponent);
    comp = fixture.componentInstance;

  });

  describe('ngOnInit method', () => {

    let statsSubject;

    beforeEach(() => {
      spyOn(comp, 'getItems').and.stub();

      statsSubject = new rxjs.Subject();
      apiServiceStub.getStatsSubject.and.returnValue(statsSubject);
    });

    it('calls getItems', () => {
      comp.ngOnInit();

      expect(comp.getItems).toHaveBeenCalled();
    });

    it('subscribes to apiService.getStatsSubject() calling getItems in next', () => {
      comp.ngOnInit();
      expect(apiServiceStub.getStatsSubject).toHaveBeenCalled();
      expect(comp.getItems).toHaveBeenCalledTimes(1);

      statsSubject.next(true);
      expect(comp.getItems).toHaveBeenCalledTimes(2);
    });

  });

  describe('ngOnDestroy method', () => {

    it('if this.statsSub, calls this.statsSub.unsubscribe', () => {
      (comp as any).statsSub = {
        unsubscribe: jasmine.createSpy('statsSub.unsubscribe')
      };
      comp.ngOnDestroy();
      expect((comp as any).statsSub.unsubscribe).toHaveBeenCalled();
    });

  });

  describe('getList private method', () => {

    beforeEach(() => {
      comp.pageSize = 10;
      comp.currentPage = 2;
      comp.currentSort = {
        field: 'testField',
        order: 'desc'
      };
    });

    it('set loading to true', () => {
      (comp as any).getList();
      expect(comp.loading).toBeTruthy();
    });

    it('calls and returns apiService.getList with the correct args', () => {
      (comp as any).getList();
      expect(apiServiceStub.getList).toHaveBeenCalledWith(Hour, {
        limit: 10,
        page: 2,
        sort: 'testField',
        order: 'desc'
      });
    });

    it('when apiService.getList next, set loading to false and return the result', () => {
      const list = [{ foo: 'foo' }, { foo: 'foo2' }];
      apiServiceStub.getList.and.returnValue(rxjs.of(list));

      let result;
      (comp as any).getList()
        .subscribe(
          data => result = data
        );

      expect(result).toBe(list);
      expect(comp.loading).toBeFalsy();
    });

    it('when apiService.getList error, set loading to false', () => {

      apiServiceStub.getList.and.returnValue(rxjs.throwError('error'));

      let result;
      (comp as any).getList()
        .subscribe(
          null,
          error => result = error,
        );

      expect(result).toBe('error');
      expect(comp.loading).toBeFalsy();
    });

  });

  describe('getItems method', () => {

    let list: any;

    beforeEach(() => {
      list = [{ foo: 'foo' }, { foo: 'foo2' }];
      spyOn(comp as any, 'getList').and.returnValue(rxjs.of(list));
    });

    it('calls getList and when next, set items', () => {
      comp.items = null;
      (comp as any).getItems();
      expect((comp as any).getList).toHaveBeenCalled();
      expect(comp.items).toBe(list);
    });

  });

  describe('setOrder method', () => {

    beforeEach(() => {
      spyOn(comp as any, 'getItems').and.callThrough();
    });

    it('set currentSort and calls getItems (currentSort.field is fieldName and order asc)', () => {
      comp.currentSort = {field: 'a', order: 'asc'};
      comp.setOrder('a');
      expect(comp.currentSort).toEqual({field: 'a', order: 'desc'});
      expect((comp as any).getItems).toHaveBeenCalled();
    });

    it('set currentSort and calls getItems (currentSort.field is fieldName and order desc)', () => {
      comp.currentSort = {field: 'a', order: 'desc'};
      comp.setOrder('a');
      expect(comp.currentSort).toEqual({field: 'a', order: 'asc'});
      expect((comp as any).getItems).toHaveBeenCalled();
    });

    it('set currentSort and calls getItems (currentSort.field is not fieldName)', () => {
      comp.currentSort = {field: 'b', order: 'asc'};
      comp.setOrder('a');
      expect(comp.currentSort).toEqual({field: 'a', order: 'asc'});
      expect((comp as any).getItems).toHaveBeenCalled();
    });

  });

  describe('setPageSize method', () => {

    beforeEach(() => {
      spyOn(comp as any, 'getItems');
    });

    it('set pageSize and calls getItems', () => {
      comp.pageSize = 200;
      comp.setPageSize(100);
      expect(comp.pageSize).toBe(100);
      expect((comp as any).getItems).toHaveBeenCalled();
    });

  });

  describe('editItem method', () => {

    let hour,
        result,
        modalRef;

    beforeEach(() => {
      hour = {
        foo: 'oldFoo'
      } as any;

      result = {
        foo: 'newFoo'
      } as any;

      modalRef = {
        componentInstance: {},
        result: Promise.resolve()
      };
      ngbModalStub.open.and.returnValue(modalRef);
    })

    it('calls ngbModal.open and set componentInstace.item', () => {
      comp.editItem(hour);
      expect(ngbModalStub.open).toHaveBeenCalledWith(HourEditModal);
      expect(modalRef.componentInstance.item).toBe(hour);
    });

    it('when modalRef.result resolves, calls apiService.put', fakeAsync(() => {
      modalRef.result = Promise.resolve(result);
      comp.editItem(hour);
      tick();
      expect(apiServiceStub.put).toHaveBeenCalledWith(Hour, hour, result);
    }));

  });

  describe('deleteItem method', () => {

    let hour;

    beforeEach(() => {
      hour = {
        foo: 'oldFoo'
      } as any;

      dialogServiceStub.confirm.and.returnValue(Promise.resolve());
    })

    it('calls dialogService.confirm', () => {
      comp.deleteItem(hour);
      expect(dialogServiceStub.confirm).toHaveBeenCalledWith(jasmine.any(String));
    });

    it('when dialogService.confirm resolves, calls apiService.put', fakeAsync(() => {
      comp.deleteItem(hour);
      tick();
      expect(apiServiceStub.delete).toHaveBeenCalledWith(Hour, hour);
    }));

  });

});