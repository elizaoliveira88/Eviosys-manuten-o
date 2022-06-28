import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ToastService} from "@services/toast.service";

@Component({
    selector: 'app-create-missions-from-multiple-elements.dialog',
    templateUrl: './create-missions-from-multiple-elements.dialog.component.html',
    styleUrls: ['./create-missions-from-multiple-elements.dialog.component.css']
})
export class CreateMissionsFromMultipleElementsDialogComponent {
    stopPoints = [];
    selectedElements = null;
    missionElements = {
        source: null,
        destination: null,
        elements: []
    };
    options = {
        opts: [],
        bool: null,
        flow: 0
    };
    bothDirPossible = null;
    bothDir = null;
    color = null;
    newName = null;
    inputsRequired = false;

    constructor(@Inject(MAT_DIALOG_DATA) public data: any,
                public dialogRef: MatDialogRef<CreateMissionsFromMultipleElementsDialogComponent>,
                private toast: ToastService) {

        this.bothDirPossible = JSON.parse(JSON.stringify(this.data.bothDir));
        this.bothDir = this.data.bothDir;
        this.selectedElements = this.data.selectedElements;
        this.color = this.getRandomColor();

        for (let k = 0; k < this.selectedElements.length; k++) {
            let el = this.selectedElements[k];
            if (el.type === 'S:S') this.missionElements.source = el.id;
            else if (el.type === 'S:D') this.missionElements.destination = el.id;
        }
        for (let t = 0; t < this.selectedElements.length; t++) {
            let el = this.selectedElements[t];
            if (el.type === 'S:SD') {
                if (this.missionElements.source !== null && this.missionElements.destination === null) {
                    this.missionElements.destination = el.id;
                } else if (this.missionElements.source === null && this.missionElements.destination !== null) {
                    this.missionElements.source = el.id;
                } else {
                    // case: 2x SD type
                    this.options.opts.push(el);
                }
            } else if (el.type !== 'S:S' && el.type !== 'S:D' && el.type !== 'S:TSP') {
                this.missionElements.elements.push(el.id);
            }
        }
    }

    changeColor() {
        this.color = this.getRandomColor();
    };

    uuidv4(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        color = this.ColorLuminance(color, 0.1);
        return color;
    }

    ColorLuminance(hex, lum) {
        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        let rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i * 2, 2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00" + c).substr(c.length);
        }
        return rgb;
    }

    cancel() {
        this.dialogRef.close();
    };

    save() {
        if (this.options.opts.length > 0) {
            if (this.options.bool !== null) {
                this.inputsRequired = false;
                if (this.options.bool === 'true') {
                    this.missionElements.source = this.options.opts[0].id;
                    if (this.options.opts.length > 1) this.missionElements.destination = this.options.opts[1].id;
                } else if (this.options.bool === 'false') {
                    if (this.options.opts.length > 1) this.missionElements.source = this.options.opts[1].id;
                    this.missionElements.destination = this.options.opts[0].id;
                }
            } else {
                this.inputsRequired = true;
            }
        } else {
            this.inputsRequired = this.newName === null;
        }

        if (!this.inputsRequired) {
            let addOptions = {
                id: this.uuidv4(),
                type: 'normal', // (!this.isTugger ? 'normal' : 'tugger'),
                name: this.newName,
                elements: this.missionElements.elements,
                stopPoints: this.stopPoints,
                source: this.missionElements.source,
                destination: this.missionElements.destination,
                flow: (this.options.flow !== null) ? this.options.flow : 0,
                color: this.color,
                missionErrors: {
                    missingFlow: false,
                    missingPath: false
                },
                bothDirections: this.bothDir,
                isLoaded: (this.bothDir ? null : true),
                /*  stopsPerCycle: 0,*/
                additionalTime: 0
            };
            this.dialogRef.close(addOptions);
        }
    };

}
