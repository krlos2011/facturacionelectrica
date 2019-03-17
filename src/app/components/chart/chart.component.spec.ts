import { NO_ERRORS_SCHEMA, Injectable, DebugElement } from '@angular/core';
import { TestBed, ComponentFixture, fakeAsync, async, tick } from '@angular/core/testing';
import * as moment from 'moment-timezone';
import * as rxjs from 'rxjs';
import * as c3 from 'c3';

import { ApiService } from '../../services';
import { ChartComponent } from './chart.component';

describe('ChartComponent', () => {

  let fixture: ComponentFixture<ChartComponent>,
    comp: ChartComponent,

    apiServiceStub;

  beforeEach(() => {

    apiServiceStub = {
      getStatsSubject: jasmine.createSpy('api.getStatsSubject').and.returnValue(new rxjs.BehaviorSubject({})),
      getStats: jasmine.createSpy('api.getStats').and.returnValue(rxjs.of([])),
    };

    //Override template if we dont need it
    TestBed.overrideComponent(ChartComponent, {
      set: {
        template: '<div></div>'
      }
    });

    TestBed.configureTestingModule({
      declarations: [ChartComponent], // declare the test component
      providers: [
        { provide: ApiService, useValue: apiServiceStub }
      ],
      //NO_ERRORS_SCHEMA allow any property on any element
      schemas: [NO_ERRORS_SCHEMA]
    })
      .compileComponents();  //es necesario cuando tenemos templateURL, en nuestro caso casi siempre

    fixture = TestBed.createComponent(ChartComponent);
    comp = fixture.componentInstance;

  });

  describe('ngOnChanges method', () => {

    beforeEach(() => {
      spyOn(comp, 'onResize').and.stub();
      spyOn(comp as any, 'getGraphData').and.stub();
    });

    it('if the change affects to path and is not the first change, calls getGraphData', () => {
      comp.ngOnChanges({
        path: {
          firstChange: false
        }
      } as any);
      expect((comp as any).getGraphData).toHaveBeenCalled();
    });

    it('if the change affects to field and is not the first change, calls getGraphData', () => {
      comp.ngOnChanges({
        field: {
          firstChange: false
        }
      } as any);
      expect((comp as any).getGraphData).toHaveBeenCalled();
    });

    it('if the change affects to operation and is not the first change, calls getGraphData', () => {
      comp.ngOnChanges({
        operation: {
          firstChange: false
        }
      } as any);
      expect((comp as any).getGraphData).toHaveBeenCalled();
    });

    it('if the change affects to chartType and is not the first change, calls onResize', () => {
      comp.ngOnChanges({
        chartType: {
          firstChange: false
        }
      } as any);
      expect(comp.onResize).toHaveBeenCalled();
    });

    it('if the change affects to yLabel and is not the first change, calls onResize', () => {
      comp.ngOnChanges({
        yLabel: {
          firstChange: false
        }
      } as any);
      expect(comp.onResize).toHaveBeenCalled();
    });

    it('if the change affects to heightRatio and is not the first change, calls onResize', () => {
      comp.ngOnChanges({
        heightRatio: {
          firstChange: false
        }
      } as any);
      expect(comp.onResize).toHaveBeenCalled();
    });

  });

  describe('ngAfterViewInit method', () => {

    let statsSubject;

    beforeEach(() => {
      spyOn(comp, 'onResize').and.stub();
      spyOn(comp as any, 'getGraphData').and.stub();

      statsSubject = new rxjs.Subject();
      apiServiceStub.getStatsSubject.and.returnValue(statsSubject);
    });

    it('calls onResize and getGraphData', () => {
      comp.ngAfterViewInit();

      expect(comp.onResize).toHaveBeenCalled();
      expect((comp as any).getGraphData).toHaveBeenCalled();
    });

    it('subscribes to apiService.getStatsSubject() calling getGraphData in next', () => {
      comp.ngAfterViewInit();
      expect(apiServiceStub.getStatsSubject).toHaveBeenCalled();
      expect((comp as any).getGraphData).toHaveBeenCalledTimes(1);

      statsSubject.next(true);
      expect((comp as any).getGraphData).toHaveBeenCalledTimes(2);
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

  describe('getGraphData private method', () => {

    beforeEach(() => {
      spyOn(<any>comp, 'parseAndCreateChart').and.stub();

      comp.path = 'testPath';
      comp.field = 'testField';
      comp.operation = 'testOperation';
    });

    it('calls apiService.getStats with the correct args', () => {
      (comp as any).getGraphData();
      expect(apiServiceStub.getStats).toHaveBeenCalledWith('testPath/testField/testOperation');
    });

    it('when apiService.getStats resolves, calls parseAndCreateChart', () => {
      let data = [{ foo: 'foo' }];
      apiServiceStub.getStats.and.returnValue(rxjs.of(data));
      (comp as any).getGraphData();
      expect((comp as any).parseAndCreateChart).toHaveBeenCalledWith(data);
    });

    it('when apiService.getStats rejects, set loading to false and set message', () => {
      comp.loading = true;
      apiServiceStub.getStats.and.returnValue(rxjs.throwError('errorMessage'));
      (comp as any).getGraphData();
      expect(comp.loading).toBeFalsy();
      expect(comp.message).toBe('errorMessage')
    });

  });

  describe('parseAndCreateChart private method', () => {

    let data,
      chartData;

    beforeEach(() => {
      data = [{ foo: 'foo' }];
      chartData = [['x', 1], ['y', 2]];
      spyOn(<any>comp, 'getChartData').and.returnValue(chartData);
      spyOn(<any>comp, 'createChart').and.stub();
    });

    it('set chartData calling getChartData, calls createChart and set loading to false', () => {
      comp.loading = true;
      (comp as any).parseAndCreateChart(data);
      expect((comp as any).getChartData).toHaveBeenCalledWith(data);
      expect(comp.chartData).toBe(chartData);
      expect((comp as any).createChart).toHaveBeenCalled();
      expect(comp.loading).toBeFalsy();
    });

  });

  describe('getChartData private method', () => {

    let data,
      chartData;

    beforeEach(() => {
      data = [{ foo: 'foo' }];
      chartData = [['x', 1], ['y', 2]];
      spyOn(<any>comp, 'getLineChartData').and.returnValue(chartData);
      spyOn(<any>comp, 'getPieChartData').and.returnValue(chartData);
    });

    it('if chartType is line, calls and returns getLineChartData', () => {
      comp.chartType = 'line';

      expect((comp as any).getChartData(data)).toBe(chartData);
      expect((comp as any).getLineChartData).toHaveBeenCalledWith(data);
    });

    it('if chartType is bar, calls and returns getLineChartData', () => {
      comp.chartType = 'bar';

      expect((comp as any).getChartData(data)).toBe(chartData);
      expect((comp as any).getLineChartData).toHaveBeenCalledWith(data);
    });

    it('if chartType is pie, calls and returns getPieChartData', () => {
      comp.chartType = 'pie';

      expect((comp as any).getChartData(data)).toBe(chartData);
      expect((comp as any).getPieChartData).toHaveBeenCalledWith(data);
    });

  });

  describe('getLineChartData private method', () => {

    let data;

    beforeEach(() => {
      data = [
        { x: 0, y: 1 },
        { x: 1, y: 2 }
      ];

      spyOn(<any>comp, 'getXCategoryFormater').and.returnValue((x) => x + 'formatted');

      comp.field = 'testField';
    });

    it('returns an array with 2 arrays, [x, item.x formatted, ...] [field, item.y, ...]', () => {
      expect((comp as any).getLineChartData(data)).toEqual([
        ['x', '0formatted', '1formatted'],
        ['testField', 1, 2]
      ]);
    });

  });

  describe('getPieChartData private method', () => {

    let data;

    beforeEach(() => {
      data = [
        { x: 0, y: 1 },
        { x: 1, y: 2 },
        { x: 2, y: 3 }
      ];

      spyOn(<any>comp, 'getXCategoryFormater').and.returnValue((x) => x + 'formatted');
    });

    it('returns an array with data.length arrays like [item.x formatted, item.y]', () => {
      expect((comp as any).getPieChartData(data)).toEqual([
        ['0formatted', 1],
        ['1formatted', 2],
        ['2formatted', 3],
      ]);
    });

  });

  describe('getXCategoryFormater private method', () => {

    it('if path is months, returns a function to parse value using moment(x).format(MMM YY)', () => {
      comp.path = 'months';
      const xFormater = (comp as any).getXCategoryFormater();
      const x = '2020-01-01';

      expect(xFormater(x)).toBe(moment(x).format('MMM YY'));
    });

    it('if path is daysOfWeek, returns a function to parse value using moment.day(x).format(ddd)', () => {
      comp.path = 'daysOfWeek';
      const xFormater = (comp as any).getXCategoryFormater();
      const x = 0;

      expect(xFormater(x)).toBe(moment().day(x - 1).format('ddd'));
    });

    it('if path is hour, returns a function to parse value using moment().hour(x).format(HH)', () => {
      comp.path = 'hour';
      const xFormater = (comp as any).getXCategoryFormater();
      const x = 20;

      expect(xFormater(x)).toBe(moment().hour(x).format('HH'));
    });

    it('if path is another, returns a function that returns the same value', () => {
      comp.path = 'other';
      const xFormater = (comp as any).getXCategoryFormater();
      const x = '2020-01-01';

      expect(xFormater(x)).toBe(x);
    });

  });

  describe('createChart private method', () => {

    beforeEach(() => {
      spyOn(<any>comp, 'createLineChart').and.stub();
      spyOn(<any>comp, 'createPieChart').and.stub();

      comp.chartData = [['x', 1], ['y', 2]];
    });

    it('if !chartData, not calls createLineChart nin createPieChart', () => {
      comp.chartData = null;
      (comp as any).createChart();

      expect((comp as any).createLineChart).not.toHaveBeenCalled();
      expect((comp as any).createLineChart).not.toHaveBeenCalled();
    });

    it('if chartType is line, calls createLineChart', () => {
      comp.chartType = 'line';

      (comp as any).createChart();
      expect((comp as any).createLineChart).toHaveBeenCalled();
    });

    it('if chartType is bar, calls createLineChart', () => {
      comp.chartType = 'bar';

      (comp as any).createChart();
      expect((comp as any).createLineChart).toHaveBeenCalled();
    });

    it('if chartType is pie, calls createPieChart', () => {
      comp.chartType = 'pie';

      (comp as any).createChart();
      expect((comp as any).createPieChart).toHaveBeenCalled();
    });

  });

  describe('createLineChart private method', () => {

    beforeEach(() => {
      spyOn(c3, 'generate').and.stub();

      comp.containerId = 'testContainer';
      comp.chartWidth = 300;
      comp.chartHeight = 200;
      comp.chartData = [
        ['x', '0formatted', '1formatted'],
        ['testField', 1, 2]
      ];
      comp.chartType = 'line';
      comp.yLabel = 'testYLabel';
    });

    it('calls c3.generate with the correct configuration', () => {
      (comp as any).createLineChart();

      expect(c3.generate).toHaveBeenCalled();

      const callArgs = c3.generate.calls.argsFor(0)[0];
      expect(callArgs.bindto).toBe('#testContainer');
      expect(callArgs.size.width).toBe(300);
      expect(callArgs.size.height).toBe(200);
      expect(callArgs.data.columns).toBe(comp.chartData);
      expect(callArgs.data.type).toBe('line');
      expect(callArgs.axis.y.label).toBe('testYLabel');
    });

  });

  describe('createPieChart private method', () => {

    beforeEach(() => {
      spyOn(c3, 'generate').and.stub();

      comp.containerId = 'testContainer';
      comp.chartWidth = 300;
      comp.chartHeight = 200;
      comp.chartData = [
        ['0formatted', 1],
        ['1formatted', 2],
        ['2formatted', 3],
      ];
      comp.chartType = 'pie';
      comp.yLabel = 'testYLabel';
    });

    it('calls c3.generate with the correct configuration', () => {
      (comp as any).createPieChart();

      expect(c3.generate).toHaveBeenCalled();

      const callArgs = c3.generate.calls.argsFor(0)[0];
      expect(callArgs.bindto).toBe('#testContainer');
      expect(callArgs.size.width).toBe(300);
      expect(callArgs.size.height).toBe(200);
      expect(callArgs.data.columns).toBe(comp.chartData);
      expect(callArgs.data.type).toBe('pie');
    });

  });

  describe('onResize method, after 500 ms', () => {

    beforeEach(() => {
      spyOn(comp as any, 'createChart').and.stub();

      comp.elementView = {
        nativeElement: {
          offsetWidth: 200
        }
      };
      comp.chartWidth = 5000;
      comp.chartHeight = 2500;
      comp.heightRatio = .8;
    })

    it('set chartWidth and chartHeight', fakeAsync(() => {
      comp.onResize();
      tick(500);
      expect(comp.chartWidth).toBe(200);
      expect(comp.chartHeight).toBe((200 * comp.heightRatio));
    }));

    it('calls createChart', fakeAsync(() => {
      comp.onResize();
      tick(500);
      expect((comp as any).createChart).toHaveBeenCalledWith();
    }));

  });

});