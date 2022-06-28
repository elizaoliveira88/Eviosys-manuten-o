import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor, HttpResponse, } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ToastService } from '@shared/services/toast.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { TextPopup } from '@shared/components/text-popup/text-popup.component';
import { PersistenceService } from '@shared/services/database/persistence.service';

@Injectable()
export class KIMHeaderMessagesInterceptor implements HttpInterceptor {
    constructor(
        public toast: ToastService,
        private dialog: MatDialog,
        private database: PersistenceService,
    ) {}

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            map((event: HttpResponse<any>) => {
                if (event instanceof HttpResponse) {
                    const k = event.headers.get('mip-message');
                    if (k != null) {
                        const resp = this._showKimMessage(k, request);
                        if (resp.length > 0) {
                            event = event.clone({
                                headers: event.headers.set('kim-message-formated', resp),
                            });
                        }
                    }
                }
                return event;
            }),
        );
    }

    _fnDecode(text) {
        const div = document.createElement('div');
        div.innerHTML = text;
        text = div.innerHTML;

        text = text.replace(/&amp;/g, '&');
        text = text.replace(/&gt;/g, '>');
        text = text.replace(/&lt;/g, '<');
        text = text.replace(/&quot;/g, '"');
        text = text.replace(/&#39;/g, "'");

        return text;
    }

    _showKimMessage(kimMessageJson, request) {
        const resp = [];
        const msg = JSON.parse(kimMessageJson);
        if (msg && msg.DETAIL) {
            let msgs = [];
            let popup = false;
            if (Array.isArray(msg.DETAIL)) {
                msgs = msg.DETAIL;
            } else if (msg.DETAIL.MESSAGE && Array.isArray(msg.DETAIL.MESSAGE)) {
                if (msg.DETAIL.POPUP && msg.DETAIL.POPUP == 'X') {
                    popup = true;
                }
                msgs = msg.DETAIL.MESSAGE;
            }
            const txt = [];
            msgs.forEach(
                function (d, i) {
                    if (!d.MESSAGE) return;
                    d.MESSAGE = this._fnDecode(d.MESSAGE);

                    txt.push(d.MESSAGE);
                    resp.push({
                        type: d.SEVERITY,
                        message: d.MESSAGE,
                    });
                    switch (d.SEVERITY) {
                        case 'I':
                            this.toast.info(d.MESSAGE);
                            this.database.addKimHeaderLogEntry({
                                url: request.urlWithParams,
                                method: request.method,
                                type: 'info',
                                message: d.MESSAGE,
                            });
                            break;
                        case 'E':
                            this.toast.error(d.MESSAGE);
                            this.database.addKimHeaderLogEntry({
                                url: request.urlWithParams,
                                method: request.method,
                                type: 'error',
                                message: d.MESSAGE,
                            });
                            break;
                        case 'W':
                            this.toast.warning(d.MESSAGE);
                            this.database.addKimHeaderLogEntry({
                                url: request.urlWithParams,
                                method: request.method,
                                type: 'warning',
                                message: d.MESSAGE,
                            });
                            break;
                    }
                }.bind(this),
            );

            if (popup) {
                const dialogConfig = new MatDialogConfig();
                dialogConfig.disableClose = false;
                dialogConfig.autoFocus = true;
                dialogConfig.data = { text: txt.join('\r\n\r\n'), title: 'INFORMATION' };
                dialogConfig.panelClass = 'paddingLessPopup';
                this.dialog.open(TextPopup, dialogConfig);
            }
        }

        return resp;
    }
}
