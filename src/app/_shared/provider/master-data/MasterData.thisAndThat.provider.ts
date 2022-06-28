import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { GatewayService } from '@services/gateway-service/gateway.service';
import { TranslateService, LangChangeEvent } from '@ngx-translate/core';
import { MasterDataCachesProvider } from './MasterData.caches.provider';
import { ToastService } from '@shared/services/toast.service';
import { PersistenceService } from '@shared/services/database/persistence.service';
import { BehaviorSubject, Observable, Observer, fromEvent, merge, pipe } from 'rxjs';
import { distinctUntilChanged, map } from 'rxjs/operators';
import { MasterDataStore } from '@app/_shared/provider/MasterData.store';

@Injectable({
    providedIn: 'root'
})
export class MasterDataThisAndThatProvider extends MasterDataCachesProvider {

    private _onlineStatus = new BehaviorSubject<boolean>(window.navigator.onLine);
    public onlineStatus$;
    private applicationIsOnline: boolean = true;

    constructor(
        public gatewayService: GatewayService,
        public translate: TranslateService,
        public toast: ToastService,
        public dialog: MatDialog,
        public dataStore: MasterDataStore
    ) {
        super(gatewayService, translate, toast, dialog, dataStore);

        this.onlineStatus$ = merge(
            fromEvent(window, 'offline').pipe(map(() => false)),
            fromEvent(window, 'online').pipe(map(() => true)),
            new Observable((sub: Observer<boolean>) => {
                sub.next(navigator.onLine);
                sub.complete();
            }),
            this._onlineStatus // source: interceptor that checks if status is 0
        ); // The purpose of this is to prevent leaking the "observer side" of the Subject out of an API. Basically to prevent a leaky abstraction when you don't want people to be able to "next" into the resulting observable.

        this.observablesToUnsubscribe.push(this.onlineStatus$.subscribe(function(isOnline) {
            this.applicationIsOnline = isOnline;
        }.bind(this)));
    }

    public setOnlineStatus(status): void {
        this._onlineStatus.next(status === true);
    }

    public getOnlineStatus(): boolean {
        return this.applicationIsOnline !== false;
    }

}
