import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subscription } from 'rxjs';
import { LoaderService, LoaderState } from '../loader.service';
import { MatDialog, MatDialogRef } from '@angular/material/dialog';

@Component({
    selector: 'app-loader',
    template: ''
})
export class LoaderComponent implements OnInit, OnDestroy {
    private subscription: Subscription;
    private dialog: MatDialogRef<DialogSpinnerComponent>;

    constructor(
        private loaderService: LoaderService,
        private matDialog: MatDialog
    ) { }

    ngOnInit() {
        this.subscription = this.loaderService.loaderState.subscribe((state: LoaderState) => {
            setTimeout(() => {
                if(state.show) {
                    this.dialog = this.matDialog.open(DialogSpinnerComponent, {
                        disableClose: true,
                        hasBackdrop: false,
                        panelClass: 'lssActionSpinner'
                    });
                } else {
                    this.dialog.close();
                }
            });

        });
    }

    ngOnDestroy() {
        this.subscription.unsubscribe();
        setTimeout(() => {
          this.dialog.close();
        });
    }

}

@Component({
  selector: 'app-dialog-spinner',
  templateUrl: './loader.component.html',
  styleUrls: ['./loader.component.css']
})
export class DialogSpinnerComponent {}
