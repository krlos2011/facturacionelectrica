import { Component, AfterViewInit, ViewChild, Input, OnChanges, SimpleChanges, OnDestroy } from '@angular/core';
import * as c3 from 'c3';
import * as moment from 'moment-timezone';
import * as rxjs from 'rxjs';

import { ApiService } from 'app/services';

export type ChartType = 'pie' | 'bar' | 'line';

@Component({
  selector: 'app-chart',
  templateUrl: 'chart.component.html'
})
export class ChartComponent implements OnChanges, AfterViewInit, OnDestroy {

  static nextId = 0;

  private statsSub: rxjs.Subscription;
  private resizeTimer = null;

  @Input() chartType: ChartType;

  @Input() path: string;
  @Input() field: string;
  @Input() operation: string;
  @Input() yLabel?: string = '';

  @Input() heightRatio?: number = .6;

  public loading: boolean = true;
  public message: string;

  public containerId: string = `graph-${ChartComponent.nextId++}`;
  public chartWidth: number;
  public chartHeight: number;
  public chartData: Array<Array<any>>;

  @ViewChild('graph') elementView;

  constructor(
    private apiService: ApiService,
  ) { }

  ngOnChanges(changes: SimpleChanges) {
    if (
      (changes.path && !changes.path.firstChange) ||
      (changes.field && !changes.field.firstChange) ||
      (changes.operation && !changes.operation.firstChange)
    ) {
      this.getGraphData();
    }

    if (
      (changes.chartType && !changes.chartType.firstChange) ||
      (changes.yLabel && !changes.yLabel.firstChange) ||
      (changes.heightRatio && !changes.heightRatio.firstChange)
    ) {
      this.onResize();
    }
  }

  ngAfterViewInit(): void {
    this.onResize();
    this.getGraphData();

    this.statsSub = this.apiService.getStatsSubject()
      .subscribe(
        () => this.getGraphData()
      );

  }

  ngOnDestroy() {
    if (this.statsSub) {
      this.statsSub.unsubscribe();
    }
  }

  private getGraphData() {

    this.apiService.getStats([this.path, this.field, this.operation].join('/'))
      .subscribe(
        data => this.parseAndCreateChart(data),
        error => {
          this.message = error;
          this.loading = false;
        }
      );

  }

  private parseAndCreateChart(data: any) {
    this.chartData = this.getChartData(data);
    this.createChart();

    this.loading = false;
  }

  private getChartData(data: any): Array<Array<any>> {

    switch (this.chartType) {
      case 'line':
      case 'bar':
        return this.getLineChartData(data);
      case 'pie':
        return this.getPieChartData(data);
    }

  }

  private getLineChartData(data: any): Array<Array<any>> {
    const xColumn = ['x'];
    const yColumn = [this.field];
    const xCategoryFormater = this.getXCategoryFormater();

    const columns = [
      xColumn,
      yColumn,
    ];

    (data || []).forEach(item => {
      xColumn.push(xCategoryFormater(item.x));
      yColumn.push(item.y);
    });

    return columns;
  }

  private getPieChartData(data: any): Array<Array<any>> {
    const xCategoryFormater = this.getXCategoryFormater();

    return (data || []).map(item => {
      return [xCategoryFormater(item.x), item.y];
    });
  }

  private getXCategoryFormater() {
    switch (this.path) {
      case 'months':
        return (x) => moment(x).format('MMM YY');
      case 'daysOfWeek':
        return (x) => moment().day(x - 1).format('ddd');
      case 'hour':
        return (x) => moment().hour(x).format('HH');
      default:
        return (x) => x;
    }
  }

  private createChart() {
    if (this.chartData) {
      switch (this.chartType) {
        case 'line':
        case 'bar':
          this.createLineChart();
          break;
        case 'pie':
          this.createPieChart();
          break;
      }
    }
  }

  private createLineChart() {

    let chartConf: c3.ChartConfiguration = {
      bindto: '#' + this.containerId,
      size: {
        width: this.chartWidth,
        height: this.chartHeight,
      },
      data: {
        columns: this.chartData,
        x: 'x',
        type: this.chartType,
      },
      axis: {
        x: {
          type: 'category',
          tick: {
            multiline: true
          }
        },
        y: {
          label: this.yLabel
        },
      },
      legend: {
        show: false,
      },
      tooltip: {
        format: {
          value: (value) => value + this.yLabel
        }
      }
    };

    c3.generate(chartConf);
  }

  private createPieChart() {

    c3.generate({
      bindto: '#' + this.containerId,
      size: {
        width: this.chartWidth,
        height: this.chartHeight
      },
      data: {
        columns: this.chartData,
        type: 'pie',
      },
      legend: {
        position: 'right'
      },
      tooltip: {
        format: {
          value: (value: number, ratio: number) => value + this.yLabel + ' (' + (+ratio * 100).toFixed(2) + '%)'
        }
      }
    });

  }

  public onResize() {
    clearTimeout(this.resizeTimer);
    this.resizeTimer = setTimeout(() => {
      this.chartWidth = this.elementView.nativeElement.offsetWidth;
      this.chartHeight = this.chartWidth * this.heightRatio;

      this.createChart();
    }, 500);
  }

};