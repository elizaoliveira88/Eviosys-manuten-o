import {Component, OnInit, HostListener, ViewChild, Input, ViewChildren, ElementRef} from '@angular/core';
import { MatDialog, MatDialogRef, MatDialogConfig } from '@angular/material/dialog';
import { MasterDataProvider } from '@app/_shared/provider/MasterData.provider';
import { ReleaseNotesPopup } from '@shared/components/release-notes-popup/release-notes-popup.component';
import { AccessControllService } from '@services/access-controll/access-controll.service';

@Component({
    selector: 'dialog-about',
    templateUrl: 'about-popup.html',
})
export class DialogAbout {
    public version: string;
    public isDeveloper: boolean;
    public buildTimestamp;
    private numberOfClicks = 0;

    constructor(
        public dialogRef: MatDialogRef<DialogAbout>,
        private masterData: MasterDataProvider,
        private dialog: MatDialog,
        public acs: AccessControllService
    ) {
        this.buildTimestamp = this.masterData.getDeploymentTime();
        this.version = this.masterData.getVersion();
        this.isDeveloper = this.masterData.isDeveloper;
    }

    showReleaseNotes() {
        this.dialog.open(ReleaseNotesPopup, {
            panelClass: 'paddingLess'
        });
    }

    close(): void {
        this.dialogRef.close();
    }

    cnt() {
        if(!this.isDeveloper) {
            this.numberOfClicks++;
            if(this.numberOfClicks > 20) {
                this.masterData.isDeveloper = true;
                this.isDeveloper = this.masterData.isDeveloper;
            }
        }
    }
}
