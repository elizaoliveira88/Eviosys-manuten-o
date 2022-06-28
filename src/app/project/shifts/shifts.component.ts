import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ShiftsService } from '@app/project/shifts/shifts.service';
import { MasterDataStore } from '@shared/provider/MasterData.store';
import { InfoService } from '@app/project/info/info.service';
import { ToastService } from '@services/toast.service';
import { ApplicationsService } from '@app/project/applications/applications.service';
import { MatDialog, MatDialogConfig } from '@angular/material/dialog';
import { SegmentsInitDialogComponent } from '@shared/components/dialogs/segments-dialog/segments-init-dialog.component';

export interface ShiftData {
    id?: string;
    name: string;
    fromTime?: string;
    toTime?: string;
    fromDate?: Date;
    toDate?: Date;
    segments?: [];
    inputValues?: object;
    minutes: number;
    minutesAfterBreak: number;
}

@Component({
    selector: 'app-shifts',
    templateUrl: './shifts.component.html',
    styleUrls: ['./shifts.component.css'],
})
export class ShiftsComponent implements OnInit {
    shiftFormGroup: FormGroup;
    shifts: ShiftData[] = [];
    shiftsToDelete = [];
    siftsQtyInBackend = 0;
    defaultShiftLength = 8;
    defaultObservationTime = {
        hour: 1,
        minute: 0,
    };
    defaultFromTime = '06:00';
    defaultBreakTime = 0;
    shiftMode = false;
    totalShiftHrs = 0;
    blockView = false;
    observationTimeAlert = false;
    breakTime = [
        { value: 0 },
        { value: 15 },
        { value: 30 },
        { value: 45 },
        { value: 60 },
        { value: 75 },
        { value: 90 },
        { value: 105 },
        { value: 120 },
    ];

    constructor(
        private _formBuilder: FormBuilder,
        private service: ShiftsService,
        private InfoService: InfoService,
        private ApplicationsService: ApplicationsService,
        private masterDataStore: MasterDataStore,
        private toast: ToastService,
        private dialog: MatDialog,
    ) {
        this.shiftFormGroup = this._formBuilder.group({
            observationTimeH: [this.defaultObservationTime.hour],
            observationTimeM: [this.defaultObservationTime.minute],
            breakTime: [this.defaultBreakTime],
        });
    }

    ngOnInit(): void {
        this.InfoService.getInfo(this.masterDataStore.selectedProjectId).then(
            res => {
                if (res.processDurationAfterBreak) {
                    const observationTimeH = Math.floor(res.processDurationAfterBreak / 60);
                    const observationTimeM = res.processDurationAfterBreak % 60;
                    this.shiftFormGroup.controls.observationTimeH.patchValue(observationTimeH);
                    this.shiftFormGroup.controls.observationTimeM.patchValue(observationTimeM);
                }
            },
            err => {
                this.toast.error('GLOBAL.NO_DATA_FOUND');
            },
        );
        this.ApplicationsService.getAllApplications(this.masterDataStore.selectedProjectId).then(
            res => {
                this.blockView = res && res.length > 0;
            },
            err => {
                this.toast.error('GLOBAL.NO_DATA_FOUND');
            },
        );
        this.refreshData();
    }

    refreshData() {
        this.shiftsToDelete = [];
        this.service.getShifts(this.masterDataStore.selectedProjectId).then(
            res => {
                if (res) {
                    this.shifts = res;
                    this.shifts.forEach(shift => {
                        if (!shift.fromDate || !shift.toDate) return;
                        const startDate = new Date(shift.fromDate || '');
                        const endDate = new Date(shift.toDate || '');
                        shift.fromTime = this.formatTime(
                            startDate.getHours(),
                            startDate.getMinutes(),
                        );
                        shift.toTime = this.formatTime(endDate.getHours(), endDate.getMinutes());
                    });
                } else {
                    this.shifts = [];
                }

                this.shiftMode = this.shifts.length > 0;
                this.siftsQtyInBackend = this.shifts.length;
            },
            err => {
                this.shifts = [];
                this.shiftMode = this.shifts.length > 0;
                this.siftsQtyInBackend = this.shifts.length;
                this.toast.error('GLOBAL.NO_DATA_FOUND');
            },
        );
    }

    formatTime(hours: number, minutes: number) {
        return this.formatTwoDigitStyle(hours) + ':' + this.formatTwoDigitStyle(minutes);
    }

    formatTwoDigitStyle(time: number) {
        if (time < 10) return '0' + time;
        else return time;
    }

    addShift() {
        const shiftNumber = this.shifts.length + 1;
        const newShift = {
            name: 'Shift ' + shiftNumber,
            fromTime: this.defaultFromTime,
            toTime: this.getTimeWithAddedHours(this.defaultFromTime, this.defaultShiftLength),
            minutes: this.defaultShiftLength * 60,
            minutesAfterBreak:
                this.defaultShiftLength * 60 - this.shiftFormGroup.get('breakTime')?.value,
        };

        if (this.shifts.length > 0) {
            newShift.fromTime = this.shifts[this.shifts.length - 1].toTime;
            newShift.toTime = this.getTimeWithAddedHours(
                newShift.fromTime,
                this.defaultShiftLength,
            );
        }

        this.shifts.push(newShift);
        this.checkConstraints();
    }

    changeShiftTime(index: number, event: Event, shiftTime: string) {
        if (shiftTime == 'start') {
            this.shifts[index].fromTime = (<HTMLInputElement>event.target).value;
        } else {
            this.shifts[index].toTime = (<HTMLInputElement>event.target).value;
        }

        this.shifts[index].minutes = this.getTimeIntervalInMinutes(
            this.shifts[index].fromTime,
            this.shifts[index].toTime,
        );
        this.shifts[index].minutesAfterBreak =
            this.shifts[index].minutes - this.shiftFormGroup.get('breakTime')?.value;

        this.checkConstraints();
    }

    removeShift(index: number) {
        if (this.shifts[index].id) {
            this.shiftsToDelete.push(this.shifts[index].id);
        }
        this.shifts.splice(index, 1);
        this.checkConstraints();
    }

    getTimeWithAddedHours(time: string, hoursToAdd: number) {
        let hour = parseInt(time.split(':')[0]) + hoursToAdd;
        if (hour > 23) hour = hour - 24;
        return this.formatTwoDigitStyle(hour) + ':' + time.split(':')[1];
    }

    getTimeIntervalInMinutes(fromTime: string, toTime: string) {
        const start = new Date();
        const startH = parseInt(fromTime.split(':')[0]);
        const startM = parseInt(fromTime.split(':')[1]);
        start.setHours(startH);
        start.setMinutes(startM);
        const end = new Date();
        const endH = parseInt(toTime.split(':')[0]);
        const endM = parseInt(toTime.split(':')[1]);
        end.setHours(endH);
        end.setMinutes(endM);
        let diffTime = (end.valueOf() - start.valueOf()) / 36e5;
        if (diffTime < 0) {
            diffTime = diffTime + 24;
        }
        return diffTime * 60;
    }

    checkConstraints() {
        this.checkObservationTime();
        this.check24hShiftLimit();
    }

    check24hShiftLimit() {
        let totalMinutes = 0;
        this.shifts.forEach(shift => {
            totalMinutes = totalMinutes + shift.minutes;
        });
        this.totalShiftHrs = totalMinutes / 60;
    }

    checkObservationTime() {
        const observationTimeInMinutes = this.getObservationTimeInMinutes();
        let constrainFound = false;
        for (let i = 0; i < this.shifts.length; i++) {
            const restCalculation = this.shifts[i].minutes % observationTimeInMinutes;
            this.observationTimeAlert = restCalculation > 0;

            if (restCalculation > 0) {
                constrainFound = true;
                break;
            }
        }
        this.observationTimeAlert = constrainFound;
    }

    getObservationTimeInMinutes() {
        return (
            this.shiftFormGroup.get('observationTimeH')?.value * 60 +
            this.shiftFormGroup.get('observationTimeM')?.value
        );
    }

    saveShifts() {
        const request = [];

        request.push(
            this.InfoService.patchProject(
                { processDurationAfterBreak: this.getObservationTimeInMinutes() },
                this.masterDataStore.selectedProjectId,
            ),
        );

        if (this.shiftMode) {
            this.shiftsToDelete.forEach(id => {
                request.push(this.service.deleteShift(id));
            });

            this.shifts.forEach(shift => {
                const shiftDto = {
                    fromDate: this.setShiftTimeToDate(shift.fromTime),
                    toDate: this.setShiftTimeToDate(shift.toTime),
                    minutes: shift.minutes,
                    minutesAfterBreak: shift.minutesAfterBreak,
                    name: shift.name,
                };

                if (shift.id) {
                    request.push(this.service.patchShift(shift.id, shiftDto));
                } else {
                    request.push(
                        this.service.addShifts(this.masterDataStore.selectedProjectId, shiftDto),
                    );
                }
            });
        }

        Promise.all(request).then(
            () => {
                this.toast.success('PROJECTS.SHIFTS.SHIFT_UPDATE_SCC');
                this.refreshData();
            },
            err => {
                this.toast.error('PROJECTS.SHIFTS.SHIFT_UPDATE_ERROR');
                this.refreshData();
            },
        );
    }

    setShiftTimeToDate(shiftTime: string) {
        const date = new Date(0);
        date.setHours(parseInt(shiftTime.split(':')[0]));
        date.setMinutes(parseInt(shiftTime.split(':')[1]));
        return date;
    }

    openSegments(shift: ShiftData) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: 'PROJECTS.SHIFTS.SHIFT_SEGMENTS'
            },
            shift: shift
        };

        const dialogRef = this.dialog.open(SegmentsInitDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {

            }
        });
    }
}
