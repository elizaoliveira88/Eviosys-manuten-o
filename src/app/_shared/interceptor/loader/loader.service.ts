import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';
import { distinctUntilChanged } from 'rxjs/operators';

export interface LoaderState {
    show: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class LoaderService {

  private loaderSubject = new Subject<LoaderState>();

  loaderState = this.loaderSubject.asObservable().pipe(distinctUntilChanged((p: LoaderState, q: LoaderState) => p.show === q.show));
  runningRequests = 0;

  show() {
      this.runningRequests++;
      this.loaderSubject.next(<LoaderState>{ show: true });
  }

  hide() {
      this.runningRequests--;
      if(this.runningRequests > 0) return;
      this.loaderSubject.next(<LoaderState>{ show: false });
  }

}
