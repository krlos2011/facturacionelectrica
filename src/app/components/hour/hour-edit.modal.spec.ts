import { NO_ERRORS_SCHEMA, Injectable, DebugElement, ElementRef } from '@angular/core';
import { TestBed, ComponentFixture, fakeAsync, async, tick } from '@angular/core/testing';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { HourEditModal } from './hour-edit.modal';

describe('HourEditModal', () => {

  let fixture: ComponentFixture<HourEditModal>,
    comp: HourEditModal,

    activeModalStub;

  beforeEach(() => {

    activeModalStub = {
      close: jasmine.createSpy('modal.close')
    };

    //Override template if we dont need it
    TestBed.overrideComponent(HourEditModal, {
      set: {
        template: '<div></div>'
      }
    });

    TestBed.configureTestingModule({
      declarations: [HourEditModal], // declare the test component
      providers: [
        { provide: NgbActiveModal, useValue: activeModalStub }
      ],
      //NO_ERRORS_SCHEMA allow any property on any element
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(HourEditModal);
    comp = fixture.componentInstance;

  });

  describe('ngOnInit method', () => {

    beforeEach(() => {
      spyOn(comp, 'setModelCost').and.stub();
    })

    it('set model as a copy of item and calls setModelCost', () => {
      comp.item = { consumption: 1, cost: 2, date: '2010-01-01' } as any;
      comp.ngOnInit();

      expect(comp.model).not.toBe(comp.item);
      expect(comp.model).toEqual(comp.item);

      expect(comp.setModelCost).toHaveBeenCalled();
    });

    it('if !item.date, set model.date as new Date string with an accepted format', () => {
      comp.item = { consumption: 1, cost: 2 } as any;
      comp.ngOnInit();

      const today = new Date();
      today.setMinutes(0, 0, 0);

      expect(comp.model.date).toBe(today.toISOString().split('.')[0]);
    });

  });

  describe('setModelCost method', () => {

    it('set model.cost as consumption * price / 1000', () => {
      comp.model = {
        consumption: 100,
        price: .8
      } as any;
      comp.setModelCost();
      expect(comp.model.cost).toBe(.08);
    });

  });

});