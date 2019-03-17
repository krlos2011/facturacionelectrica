import { NO_ERRORS_SCHEMA, Injectable, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture, fakeAsync, async, tick } from '@angular/core/testing';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as rxjs from 'rxjs';

import { Hour } from './models';

import { ApiService } from './services';
import { AppComponent } from './app.component';
import { HourImportModal, HourEditModal } from './components';

describe('AppComponent', () => {

  let fixture: ComponentFixture<AppComponent>,
    comp: AppComponent,

    ngbModalStub,
    apiServiceStub;

  beforeEach(() => {

    ngbModalStub = {
      open: jasmine.createSpy('ngbModal.open').and.stub()
    };

    apiServiceStub = {
      getStatsSubject: jasmine.createSpy('api.getStatsSubject').and.returnValue(new rxjs.BehaviorSubject({})),
      getStats: jasmine.createSpy('api.getStats').and.returnValue(rxjs.of([])),
      import: jasmine.createSpy('api.import').and.returnValue(rxjs.of({})),
      post: jasmine.createSpy('api.post').and.returnValue(rxjs.of({})),
    };

    //Override template if we dont need it
    TestBed.overrideComponent(AppComponent, {
      set: {
        template: '<div></div>'
      }
    });

    TestBed.configureTestingModule({
      declarations: [AppComponent], // declare the test component
      providers: [
        { provide: NgbModal, useValue: ngbModalStub },
        { provide: ApiService, useValue: apiServiceStub },
      ],
      //NO_ERRORS_SCHEMA allow any property on any element
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();  //es necesario cuando tenemos templateURL, en nuestro caso casi siempre

    fixture = TestBed.createComponent(AppComponent);
    comp = fixture.componentInstance;

  });

  describe('ngOnInit method', () => {

    let statsSubject;

    beforeEach(() => {
      spyOn(comp as any, 'getStatsSummary').and.stub();

      statsSubject = new rxjs.Subject();
      apiServiceStub.getStatsSubject.and.returnValue(statsSubject);
    });

    it('calls getStatsSummary', () => {
      comp.ngOnInit();

      expect((comp as any).getStatsSummary).toHaveBeenCalled();
    });

    it('subscribes to apiService.getStatsSubject() calling getStatsSummary in next', () => {
      comp.ngOnInit();
      expect(apiServiceStub.getStatsSubject).toHaveBeenCalled();
      expect((comp as any).getStatsSummary).toHaveBeenCalledTimes(1);

      statsSubject.next(true);
      expect((comp as any).getStatsSummary).toHaveBeenCalledTimes(2);
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

  describe('import method', () => {

    let result,
      modalRef;

    beforeEach(() => {
      result = {
        file: { foo: 'foo' }
      };
      modalRef = {
        componentInstance: {},
        result: Promise.resolve()
      };
      ngbModalStub.open.and.returnValue(modalRef);
    })

    it('calls ngbModal.open', () => {
      comp.import();
      expect(ngbModalStub.open).toHaveBeenCalledWith(HourImportModal);
    });

    it('when modalRef.result resolves, calls apiService.import if result.file', fakeAsync(() => {
      modalRef.result = Promise.resolve(result);
      comp.import();
      tick();
      expect(apiServiceStub.import).toHaveBeenCalledWith(Hour, result.file);
    }));

    it('when modalRef.result resolves, not calls apiService.import if !result.file', fakeAsync(() => {
      modalRef.result = Promise.resolve({});
      comp.import();
      tick();
      expect(apiServiceStub.import).not.toHaveBeenCalled();
    }));

  });

  describe('addItem method', () => {

    let result,
        modalRef;

    beforeEach(() => {

      result = {
        foo: 'newFoo',
        date: '2020-01-01'
      } as any;

      modalRef = {
        componentInstance: {},
        result: Promise.resolve()
      };
      ngbModalStub.open.and.returnValue(modalRef);
    })

    it('calls ngbModal.open', () => {
      comp.addItem();
      expect(ngbModalStub.open).toHaveBeenCalledWith(HourEditModal);
    });

    it('when modalRef.result resolves, calls apiService.post (editing date)', fakeAsync(() => {
      modalRef.result = Promise.resolve(result);
      comp.addItem();
      tick();
      expect(result.date).toBe((new Date('2020-01-01')).toISOString());
      expect(apiServiceStub.post).toHaveBeenCalledWith(Hour, null, result);
    }));

  });

});