import { Component, ElementRef } from '@angular/core';
import { PullToReloadService } from './pull-to-reload.service';
import { fromEvent, timer, merge, defer } from 'rxjs';
import { map, repeat, takeWhile, take, concat, startWith, switchMap, takeUntil, tap } from 'rxjs/operators';

@Component({
    selector: 'pull-to-reload',
    template: `
        <div style="position: relative; height: 0; z-index: 10000;">
            <div fxLayout="column" fxLayoutAlign="center center" [style.transform]="positionTranslate3d$ | async">
                <mat-progress-spinner class="_mat-animation-noopable" *ngIf="percentage !== 0" mode="{{ percentage < 100 ? 'determinate': 'indeterminate'}}" [value]="percentage"></mat-progress-spinner>
            </div>
        </div>`,
    styleUrls: ['./pull-to-reload.component.css']
})

export class PullToReloadComponent {
    currentPos = 0;
    percentage = 0;
    scrollLength = 100;
    returnPosition$ = timer(0, 10).pipe(take(20));
    completeAnimation$ = this.ptrService.complete$.pipe(
        map(() => {
            this.percentage = 0;
            return this.currentPos;
        }),
        switchMap(currentPos => this.tweenObservable(currentPos, 0 , 200))
    );

    touchstart$ = fromEvent<TouchEvent>(document, 'touchstart')
    touchend$ = fromEvent<TouchEvent>(document, 'touchend')
    touchmove$ = fromEvent<TouchEvent>(document, 'touchmove')

    filteredTouchStart$ = this.touchstart$.pipe(takeWhile(x => {
        if(this.ptrService.onRefresh$.observers.length == 0) {
            return false;
        }
        if(this.el.nativeElement.parentNode.scrollTop > 0) {
            return false;
        }
        return true
    }));

    drag$ = this.filteredTouchStart$.pipe(
        switchMap(start => {
            let pos = 0;
            return this.touchmove$.pipe(
                map(move => move.touches[0].pageY - start.touches[0].pageY),
                tap(p => pos = p),
                takeUntil(this.touchend$),
                concat(defer(() => this.tweenObservable(pos, 0, 200)))
            );
        }),
        tap(p => {
            this.percentage = p * 100 / this.scrollLength;
            if (p >= this.scrollLength) {
                this.ptrService.onRefresh$.next(Date.now());
            }
        }),
        takeWhile(p => p <= this.scrollLength),
        repeat()
    )

    position$ = merge(this.completeAnimation$, this.drag$.pipe(
        startWith(0),
        tap(pos => {
            this.currentPos = pos;
        })
    ));

    positionTranslate3d$ = this.position$.pipe(map(p => `translate3d(0, ${p}px, 0)`));

    constructor(
        private el: ElementRef,
        public ptrService: PullToReloadService
    ) {
    }

    private tweenObservable(start, end, time) {
        const emissions = time / 10
        const step = (start - end) / emissions

        return timer(0, 10).pipe(
            map(x => start - step * (x + 1)),
            take(emissions)
        );
    }
}
