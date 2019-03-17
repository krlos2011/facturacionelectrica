import { Component, OnInit, OnDestroy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { NgbModal } from '@ng-bootstrap/ng-bootstrap';
import * as rxjs from 'rxjs';
import * as rxjsOperators from 'rxjs/operators';

import { Hour } from 'app/models';
import { ApiService, ApiList, DialogService } from 'app/services';

import { HourEditModal } from './hour-edit.modal';
import { HourImportModal } from './hour-import.modal';

@Component({
  selector: 'app-hour-table',
  templateUrl: 'hour-table.component.html'
})
export class HourTableComponent implements OnInit, OnDestroy {

  private statsSub: rxjs.Subscription;

  public items: ApiList<Hour>;
  public loading: boolean = false;
  public currentPage: number = 1;
  public itemsPerPage: Array<number> = [20, 50, 100];
  public pageSize: number = this.itemsPerPage[0];
  public currentSort: {
    field: string,
    order: 'asc' | 'desc'
  } = {
      field: 'date',
      order: 'desc'
    };

  constructor(
    private datePipe: DatePipe,
    private ngbModal: NgbModal,
    private apiService: ApiService,
    private dialogService: DialogService,
  ) {
  }

  ngOnInit() {
    this.getItems();
    this.statsSub = this.apiService.getStatsSubject()
    .subscribe(
      () => this.getItems()
    );
  }

  ngOnDestroy() {
    if(this.statsSub){
      this.statsSub.unsubscribe();
    }
  }

  private getList(): rxjs.Observable<ApiList<Hour>> {
    this.loading = true;
    let params = {
      limit: this.pageSize,
      page: this.currentPage,
      sort: this.currentSort.field,
      order: this.currentSort.order
    };

    return this.apiService.getList<Hour>(Hour, params).pipe(
      rxjsOperators.map(result => {
        this.loading = false;
        return result;
      }),
      rxjsOperators.catchError(error => {
        this.loading = false;
        return rxjs.throwError(error);
      })
    );
  }

  public getItems() {
    this.getList()
      .subscribe(
        list => {
          this.items = list;
        }
      );
  }

  public setOrder(fieldName: string) {
    if (this.currentSort && this.currentSort.field === fieldName) {
      this.currentSort.order = this.currentSort.order === 'asc' ? 'desc' : 'asc';
    }
    else {
      this.currentSort = {
        field: fieldName,
        order: 'asc'
      };
    }
    this.currentPage = 1;
    this.getItems();
  }

  public setPageSize(num: number) {
    this.pageSize = num;
    this.currentPage = 1;
    this.getItems();
  }

  public editItem(item: Hour) {
    const modalRef = this.ngbModal.open(HourEditModal);
    modalRef.componentInstance.item = item;

    modalRef.result
      .then(editedItem => {
        this.apiService.put<Hour>(Hour, item, editedItem).subscribe(
          null,
          error => console.error(error)
        );
      })
      .catch(() => { });
  }

  public deleteItem(item: Hour) {

    this.dialogService.confirm('Do you want to delete the item for ' + this.datePipe.transform(item.date, 'short'))
      .then(() => {
        this.apiService.delete<Hour>(Hour, item)
          .subscribe(
            null,
            error => console.error(error),
          )
      })
      .catch(() => { });

  }

};