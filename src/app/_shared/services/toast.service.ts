import { ErrorHandler, Injectable, Inject, Injector } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { ToastrService } from 'ngx-toastr';

@Injectable({
    providedIn: 'root',
})
export class ToastService {

    constructor(
        @Inject(Injector) private injector: Injector,
        private translate: TranslateService
    ) {

    }

    private get toastr(): ToastrService {
        return this.injector.get(ToastrService);
    }

    public error(text, options?): void {
        this.toastr.error(this.translate.instant(text, options || {}), null, { timeOut: 3000, enableHtml: true, toastClass: 'LMH-toast', positionClass: 'LMH-toast-container' });
    }

    public success(text, options?): void {
        this.toastr.success(this.translate.instant(text, options || {}), null, { timeOut: 3000, enableHtml: true, toastClass: 'LMH-toast', positionClass: 'LMH-toast-container' });
    }

    public warning(text, options?): void {
        this.toastr.warning(this.translate.instant(text, options || {}), null, { timeOut: 3000, enableHtml: true, toastClass: 'LMH-toast', positionClass: 'LMH-toast-container' });
    }

    public info(text, options?): void {
        this.toastr.info(this.translate.instant(text, options || {}), null, { timeOut: 3000, enableHtml: true, toastClass: 'LMH-toast', positionClass: 'LMH-toast-container' });
    }

    public offline(text?, options?): void {
        if(!text) {
            text = 'OFFLINE_DATA_FETCHED';
        }
        this.toastr.info(this.translate.instant('ERROR_MSG_UNABLE_TO_READ_SERVICE_OFFLINE'), this.translate.instant(text, options || {}), { timeOut: 3000, enableHtml: true, progressBar: true });
    }

}
