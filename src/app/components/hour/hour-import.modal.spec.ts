import { NO_ERRORS_SCHEMA, Injectable, DebugElement, ElementRef } from '@angular/core';
import { TestBed, ComponentFixture, fakeAsync, async, tick } from '@angular/core/testing';

import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { HourImportModal } from './hour-import.modal';

describe('HourImportModal', () => {

  let fixture: ComponentFixture<HourImportModal>,
    comp: HourImportModal,

    activeModalStub;

  beforeEach(() => {

    activeModalStub = {
      close: jasmine.createSpy('modal.close')
    };

    //Override template if we dont need it
    TestBed.overrideComponent(HourImportModal, {
      set: {
        template: '<div></div>'
      }
    });

    TestBed.configureTestingModule({
      declarations: [HourImportModal], // declare the test component
      providers: [
        { provide: NgbActiveModal, useValue: activeModalStub }
      ],
      //NO_ERRORS_SCHEMA allow any property on any element
      schemas: [NO_ERRORS_SCHEMA]
    });

    fixture = TestBed.createComponent(HourImportModal);
    comp = fixture.componentInstance;

  });

  describe('ngOnInit method', () => {

    it('set model', () => {
      comp.ngOnInit();

      expect(comp.model).toEqual({
        file: null,
      });
    });

  });

  describe('selectedFile method', () => {

    beforeEach(() => {
      comp.model = { file: null };
    });

    it('set model.file as event.target.files[0]', () => {
      const file = { foo: 'foo' } as any;
      comp.selectedFile({
        target: {
          files: [file]
        }
      });
      expect(comp.model.file).toBe(file);
    });

  });

});