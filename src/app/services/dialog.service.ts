import { Injectable, Component, Input } from '@angular/core';
import { NgbModal, NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Injectable()
export class DialogService {

  constructor(
    private ngbModal: NgbModal,
  ) {}

  public confirm(message:string, acceptLabel:string = 'OK', acceptBtnClass:string = 'btn-primary'):Promise<any>{
    const modalRef = this.ngbModal.open(ConfirmDialogModal);
    modalRef.componentInstance.message = message;
    modalRef.componentInstance.acceptLabel = acceptLabel;
    modalRef.componentInstance.acceptBtnClass = acceptBtnClass;

    return modalRef.result;
  }

}

@Component({
  selector: 'ngbd-modal-content',
  template: `
    <div class="modal-header">
      <h4 class="modal-title">Please Confirm</h4>
      <button type="button" class="close" aria-label="Close" (click)="activeModal.dismiss()">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
    <div class="modal-body">
      <div [innerHtml]="message"></div>
    </div>
    <div class="modal-footer d-flex justify-content-around">
      <button type="button" class="btn {{acceptBtnClass}}" (click)="activeModal.close()">{{acceptLabel}}</button>
      <button type="button" class="btn btn-secondary" (click)="activeModal.dismiss()">Cancel</button>
    </div>
  `
})
export class ConfirmDialogModal {

  @Input() message:string;
  @Input() acceptLabel:string;
  @Input() acceptBtnClass:string;

  constructor(public activeModal: NgbActiveModal) {}

}
