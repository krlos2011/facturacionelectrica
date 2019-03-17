import { Component, Input, OnInit } from '@angular/core';
import { NgbActiveModal } from '@ng-bootstrap/ng-bootstrap';

@Component({
  selector: 'ngbd-modal-content',
  templateUrl: 'hour-import.modal.html',
})
export class HourImportModal implements OnInit {

  public model: {
    file: File
  };

  constructor(
    public activeModal: NgbActiveModal
  ) { }

  ngOnInit() {
    this.model = {
      file: null
    };
  }

  public selectedFile(event){
    const fileList:FileList = event.target.files;
    this.model.file = fileList[0] || null;
  }

}