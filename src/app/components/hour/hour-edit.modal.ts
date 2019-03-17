import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

import { Hour } from 'app/models';

@Component({
  selector: 'ngbd-modal-content',
  templateUrl: 'hour-edit.modal.html',
})
export class HourEditModal implements OnInit {
  
  @Input() item?: Hour;

  public model: Hour;

  constructor(
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.model = Object.assign({}, this.item);

    if(!this.model.date){
      const today = new Date();
      today.setMinutes(0, 0, 0);
      this.model.date = today.toISOString().split('.')[0];
    }

    this.setModelCost();
  }

  public setModelCost(){
    this.model.cost =  +((this.model.consumption || 0) * (this.model.price || 0) / 1000).toFixed(12);
  }
}