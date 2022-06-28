import {Component, Inject} from '@angular/core';
import {MatDialogRef, MAT_DIALOG_DATA} from '@angular/material/dialog';
import {MasterDataProvider} from "@shared/provider/MasterData.provider";
import { PersistenceService } from '@services/database/persistence.service';

@Component({
    selector: 'release-notes-popup',
    templateUrl: 'release-notes-popup.component.html',
    styleUrls: ['./release-notes-popup.component.css'],
})
export class ReleaseNotesPopup {
    notes;
    noteKeys = [];
    knownReleases = [];
    constructor(
        public dialogRef: MatDialogRef<ReleaseNotesPopup>,
        @Inject(MAT_DIALOG_DATA) public dialogData,
        private masterData: MasterDataProvider,
        public database: PersistenceService,
    ) {
        this.dialogData = Object.assign(
            {
                limitToNewEntries: false,
            },
            dialogData || {},
        );

        if (this.dialogData.limitToNewEntries == true) {
            this.knownReleases = this.database.loadLocalSetting('app.known-release-notes');
            this.notes = this._parseNotes(this.masterData.getReleaseNotes(), false);
            if (this.masterData.isDeveloper) {
                this.notes = this.notes.concat(
                    this._parseNotes(this.masterData.getDevelopmentNotes(), true),
                );
            }
            this.notes.sort(function (a, b) {
                return a.date < b.date;
            });
        } else {
            this.notes = this._parseNotes(this.masterData.getReleaseNotes(), false);
            if (this.masterData.isDeveloper) {
                this.notes = this.notes.concat(
                    this._parseNotes(this.masterData.getDevelopmentNotes(), true),
                );
            }
            this.notes.sort((a, b) => (a.date < b.date ? 1 : -1));
        }
    }

    _parseNotes(notes, developmentTag) {
        const text = [];
        const nKeys = Object.keys(notes);
        this.noteKeys = this.noteKeys.concat(nKeys);

        let releases = JSON.parse(JSON.stringify(nKeys));

        if (this.dialogData.limitToNewEntries == true) {
            releases = releases.filter(item => !this.knownReleases.includes(item));
        }

        releases.forEach(key => {
            const row = notes[key];
            const content = row.hasOwnProperty(this.masterData.getCurrentLanguage())
                ? row[this.masterData.getCurrentLanguage()]
                : row['en'];
            const releaeNote = {
                isDevelopment: developmentTag,
                title: content.t,
                date: row.d,
                version: row.v,
                CHANGES: [],
            };
            if (content.hasOwnProperty('CHANGE')) {
                content.CHANGE.forEach(change => {
                    releaeNote.CHANGES.push(change);
                });
            }
            text.push(releaeNote);
        });

        return text;
    }

    closePopup(): void {
        if (this.dialogData.limitToNewEntries == true) {
            this.database.storeLocalSetting('app.known-release-notes', this.noteKeys);
        }
        this.dialogRef.close();
    }
}
