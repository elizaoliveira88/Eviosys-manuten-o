import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable({
    providedIn: 'root',
})
export class PullToReloadService {
    onRefresh$ = new Subject<any>();
    complete$ = new Subject<any>();

    // call after refresh donw to deactivate spinner
    stop() {
        this.complete$.next(Date.now());
    }

    // call to subscribe to refresh event
    subscribe(fn) {
        return this.onRefresh$.subscribe(fn);
    }

    // call to subscribe to refresh event with automatic spinner deactivation
    subscribeRefresh(fn) {
        return this.onRefresh$.subscribe(x => {
            fn(x);
            this.complete$.next(Date.now());
        });
    }
}
