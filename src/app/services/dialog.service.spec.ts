import { DialogService, ConfirmDialogModal } from './dialog.service'

describe('DialogService', () => {

  let dialogServ: DialogService,
      ngbModalRef,
      ngbModal;

  beforeEach(() => {

    ngbModalRef = {
      componentInstance: {},
      result: new Promise(() => {})
    };

    ngbModal = {
      open: jasmine.createSpy('ngbModal.open').and.returnValue(ngbModalRef)
    };

    dialogServ = new DialogService(ngbModal);
  });

  it('confirm calls to ngbModal.open, set message, acceptLabel and acceptBtnClass to modalRef.componentInstance; and returns modalRef.result', () => {
    expect(dialogServ.confirm('testMessage', 'testAcceptLabel', 'testAcceptBtnClass')).toBe(ngbModalRef.result);
    expect(ngbModal.open).toHaveBeenCalledWith(ConfirmDialogModal);
    expect(ngbModalRef.componentInstance.message).toBe('testMessage');
    expect(ngbModalRef.componentInstance.acceptLabel).toBe('testAcceptLabel');
    expect(ngbModalRef.componentInstance.acceptBtnClass).toBe('testAcceptBtnClass');
  });

});