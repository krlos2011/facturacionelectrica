import { Component, OnInit, OnDestroy } from '@angular/core';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as rxjs from 'rxjs';

import { ApiService } from 'app/services';
import { Hour } from 'app/models';
import { HourImportModal, HourEditModal } from 'app/components';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html'
})
export class AppComponent implements OnInit, OnDestroy {

  private statsSub: rxjs.Subscription;

  private consumptionField = {
    key: 'consumption',
    label: 'Consumption',
    yLabel: 'Wh'
  };
  private priceField = {
    key: 'price',
    label: 'Price',
    yLabel: '€/kWh'
  };
  private costField = {
    key: 'cost',
    label: 'Cost',
    yLabel: '€'
  };

  public graphs = [
    {
      chartType: 'line',
      path: {
        key: 'months',
        label: 'by months'
      },
      fields: [
        this.consumptionField,
        this.costField,
      ],
      selectedField: null,
      operation: {
        key: 'sum',
        label: 'Total'
      }
    },
    {
      chartType: 'pie',
      path: {
        key: 'daysOfWeek',
        label: 'by day of week'
      },
      fields: [
        this.costField,
        this.consumptionField,
      ],
      selectedField: null,
      operation: {
        key: 'avg',
        label: 'Average'
      }
    },
    {
      chartType: 'bar',
      path: {
        key: 'hour',
        label: 'by hour'
      },
      fields: [
        this.priceField,
        this.costField,
        this.consumptionField,
      ],
      selectedField: null,
      operation: {
        key: 'avg',
        label: 'Average'
      }
    },
  ]

  public statsSummary: any;

  constructor(
    private ngbModal: NgbModal,
    private apiService: ApiService,
  ) {

    // Set selected field for each graph
    this.graphs.forEach(graph => graph.selectedField = graph.fields[0]);

  }

  ngOnInit() {

    this.getStatsSummary();
    this.statsSub = this.apiService.getStatsSubject()
      .subscribe(
        () => this.getStatsSummary()
      );

  }

  ngOnDestroy() {
    if (this.statsSub) {
      this.statsSub.unsubscribe();
    }
  }

  private getStatsSummary() {
    this.apiService.getStats<any>('summary')
      .subscribe(
        result => this.statsSummary = result,
      );
  }

  public import() {
    const modalRef = this.ngbModal.open(HourImportModal);

    modalRef.result
      .then(result => {
        if (result && result.file) {
          this.apiService.import<Hour>(Hour, result.file)
            .subscribe(
              null,
              error => console.error(error)
            )
        }
      })
      .catch(() => { });
  }

  public addItem() {
    const modalRef = this.ngbModal.open(HourEditModal);

    modalRef.result
      .then(editedItem => {
        editedItem.date = (new Date(editedItem.date)).toISOString();

        this.apiService.post<Hour>(Hour, null, editedItem).subscribe(
          null,
          error => console.error(error)
        );

      })
      .catch(() => { });
  }

}
