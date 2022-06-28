import {Component, ElementRef, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Observable, Subject} from "rxjs";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {TranslateService} from "@ngx-translate/core";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {MatChipInputEvent} from "@angular/material/chips";
import {FormControl} from "@angular/forms";
import {MatAutocompleteSelectedEvent} from "@angular/material/autocomplete";
import {startWith, takeUntil, map} from "rxjs/operators";
import {SimpleTruck_DATA} from "@shared/models/SimpleTruck";
import {MatTableDataSource} from "@angular/material/table";
import {TrucksService} from "@app/project/trucks/trucks.service";
import {Sort} from "@angular/material/sort";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "@shared/components/dialogs/confirm-dialog/confirm-dialog.component";
import {
    ProjectTruckDetailsDialogComponent
} from "@app/project/trucks/dialogs/project-truck-details.dialog/project-truck-details.dialog.component";
import {SimpleTrailer_DATA} from "@shared/models/SimpleTrailer";

@Component({
    selector: 'app-trucks',
    templateUrl: './trucks.component.html',
    styleUrls: ['./trucks.component.css']
})
export class TrucksComponent implements OnInit, OnDestroy {
    private ngUnsubscribe = new Subject();
    readonly separatorKeysCodes = [ENTER, COMMA] as const;
    filteredTruckTypes: Observable<string[]>;
    @ViewChild('typeInput') typeInput: ElementRef<HTMLInputElement>;
    truckTypeSelectionForm = new FormControl();
    storage = {
        allTrucks: <any>[],
        allTruckTypes: <string[]>[],
        allTruckClasses: <string[]>[],
        displayedTruckClasses: <string[]>[],
        displayedTrailerClasses: <string[]>[],
        truckClassImages: {},
        selectedTruckTypes: ['counterbalanced'],
        selectedTruckClasses: [],
        selectedProjectId: null,
        selectableTrucks: [],
        selectedTrucks: [],
        selectedTrailers: [],
        selectedTrucksStrings: [],
        selectedTrailerStrings: []
    }
    loaded = 0;
    dataSource = new MatTableDataSource([]);
    dataSourceSelectedTrucks = new MatTableDataSource([]);
    dataSourceSelectedTrailers = new MatTableDataSource([]);
    displayedColumns: string[] = ['IMG', 'identification', 'model', 'classification', 'class', 'BTN_ADD'];
    displayedColumnsSelected: string[] = ['BTN_ACTIVE', 'IMG', 'identification', 'model', 'classification', 'class', 'BTN_REMOVE'];


    constructor(private masterDataStore: MasterDataStore,
                private translateService: TranslateService,
                private service: TrucksService,
                private dialog: MatDialog) {

        this.storage.selectedProjectId = masterDataStore.selectedProjectId;
        this.masterDataStore.trucks_changed.pipe(
            takeUntil(this.ngUnsubscribe)
        ).subscribe(trucks=>{
            if(trucks){
                trucks.forEach(truck=>{
                    truck['type'] = 'truck';
                });
                this.storage.allTrucks = this.storage.allTrucks.concat(trucks);
                this.loadingFinished();
            }
        });

        this.masterDataStore.trailers_changed.pipe(
            takeUntil(this.ngUnsubscribe)
        ).subscribe(trailers=> {
            if (trailers) {
                trailers.forEach(trailer=>{
                    trailer['type'] = 'trailer';
                });
                this.storage.allTrucks =  this.storage.allTrucks.concat(trailers);
                this.loaded++;
                this.loadingFinished();
            }
        });
    }

    loadingFinished(){
        if(this.loaded>0){
            this.filteredTruckTypes = this.truckTypeSelectionForm.valueChanges.pipe(
                startWith(null),
                map((truck: string | null) => (truck ? this._filter(truck) : this.storage.allTruckTypes.slice()))
            );

            this.extractTruckTypesAndSeries();
            this.fillDisplayedTruckCLasses();
            this.refreshData();
        }
    }

    ngOnInit(): void {
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next(true);
        this.ngUnsubscribe.complete();
    }

    refreshData() {
        const filterSelectedTrucks = this.dataSourceSelectedTrucks.filter;
        const filterSelectedTrailers = this.dataSourceSelectedTrailers.filter;
        this.storage.selectedTrucksStrings = [];
        this.storage.selectedTrailerStrings = [];
        this.service.getProjectTrucks(this.storage.selectedProjectId).then(res=>{
            if(res){
                this.storage.selectedTrucks = [];
                this.storage.selectedTrailers = [];
                res.forEach(el=>{
                    if(el.truckId){
                        this.storage.selectedTrucks.push(el);
                    } else if(el.trailerId){
                        this.storage.selectedTrailers.push(el);
                    }
                });
                this.storage.selectedTrucks.forEach(prTr=>{
                    if(this.storage.allTrucks){
                        this.storage.allTrucks.forEach(tr=>{
                            if(prTr.truckId === tr.id) {
                                prTr.classification = tr.classification;
                                prTr.identification = tr.identification;
                                prTr.model = tr.model;
                                prTr.palletsPerDrive = tr.palletsPerDrive;
                                prTr.possibleApplications = tr.possibleApplications;
                                prTr.truckClass = tr.truckClass;
                                prTr.truckPicId = tr.truckPicId;
                                this.storage.selectedTrucksStrings.push(prTr.truckId);
                            }
                        })
                    }
                });
                this.storage.selectedTrailers.forEach(prTr=>{
                    if(this.storage.allTrucks){
                        this.storage.allTrucks.forEach(tr=>{
                            if(prTr.trailerId === tr.id) {
                                prTr.classification = tr.classification;
                                prTr.identification = tr.identification;
                                prTr.model = tr.model;
                                prTr.palletsPerDrive = tr.palletsPerDrive;
                                prTr.possibleApplications = tr.possibleApplications;
                                prTr.trailerClass = tr.trailerClass;
                                prTr.trailerPicId = tr.trailerPicId;
                                this.storage.selectedTrailerStrings.push(prTr.trailerId);
                            }
                        })
                    }
                });
                this.dataSourceSelectedTrucks.data = this.storage.selectedTrucks;
                this.dataSourceSelectedTrucks.filter = filterSelectedTrucks;

                this.dataSourceSelectedTrailers.data = this.storage.selectedTrailers;
                this.dataSourceSelectedTrailers.filter = filterSelectedTrailers;
            }
        },err=>{

        });
    }

    typeSelected(event: MatAutocompleteSelectedEvent): void {
        if(this.storage.selectedTruckTypes.indexOf(event.option.value)===-1) this.storage.selectedTruckTypes.push(event.option.value);
        this.typeInput.nativeElement.value = '';
        this.truckTypeSelectionForm.setValue(null);
        this.fillDisplayedTruckCLasses();
    }

    fillDisplayedTruckCLasses() {
        this.storage.displayedTruckClasses = [];
        this.storage.displayedTrailerClasses = [];
        this.storage.allTrucks.forEach(entity=>{
            this.storage.selectedTruckTypes.forEach(type=>{
                if(entity.classification === type){
                    if(entity.type === 'truck'){
                        if(this.storage.displayedTruckClasses.indexOf(entity.truckClass)===-1){
                            this.storage.displayedTruckClasses.push(entity.truckClass);
                            this.storage.truckClassImages[entity.truckClass] = entity.truckPicId;
                        }
                    } else if(entity.type === 'trailer'){
                        if(this.storage.displayedTrailerClasses.indexOf(entity.trailerClass)===-1){
                            this.storage.displayedTrailerClasses.push(entity.trailerClass);
                            this.storage.truckClassImages[entity.trailerClass] = entity.trailerPicId;
                        }
                    }
                }
            })
        });
        this.filterSelectableTrucks();
    }

    removeType(fruit: any): void {
        const index = this.storage.selectedTruckTypes.indexOf(fruit);

        if (index >= 0) {
            this.storage.selectedTruckTypes.splice(index, 1);
        }

        this.fillDisplayedTruckCLasses();
    }

    extractTruckTypesAndSeries(){
        if(this.storage.allTrucks){
            this.storage.allTrucks.forEach(truck=>{
                if(this.storage.allTruckTypes.indexOf(truck.classification)===-1){
                    this.storage.allTruckTypes.push(truck.classification);
                }

            });
        }
    }

    private _filter(value: string): string[] {
        const filterValue = value ? value.toLowerCase() : null;
        let result = [];
        this.storage.allTrucks.forEach(tr=>{
            if(!filterValue || tr.classification.toLowerCase().indexOf(filterValue)>-1){
                if(result.indexOf(tr.classification)===-1) result.push(tr.classification);
            }
        });
        return result;
    }

    selectTruckClass(truckClass: string) {
        if(this.storage.selectedTruckClasses.indexOf(truckClass)>-1){
            for(let k=0; k<this.storage.selectedTruckClasses.length; k++){
                if(this.storage.selectedTruckClasses[k]===truckClass){
                    this.storage.selectedTruckClasses.splice(k,1);
                    this.filterSelectableTrucks();
                    return;
                }
            }
        } else {
            this.storage.selectedTruckClasses.push(truckClass);
            this.filterSelectableTrucks();
        }
    }

    sortData(sort: Sort) {
        const data = this.dataSourceSelectedTrucks.data.slice();
        if (!sort.active || sort.direction === '') {
            this.dataSourceSelectedTrucks.data = data;
            return;
        }

        this.dataSourceSelectedTrucks.data = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            const val = sort.active;
            return this.compare(a[val], b[val], isAsc);
        });
    }

    sortDataSelected(sort: Sort) {
        const data = this.dataSourceSelectedTrucks.data.slice();
        if (!sort.active || sort.direction === '') {
            this.dataSourceSelectedTrucks.data = data;
            return;
        }

        this.dataSourceSelectedTrucks.data = data.sort((a, b) => {
            const isAsc = sort.direction === 'asc';
            const val = sort.active;
            return this.compare(a[val], b[val], isAsc);
        });
    }

    compare(a: number | string, b: number | string, isAsc: boolean) {
        return (a < b ? -1 : 1) * (isAsc ? 1 : -1);
    }

    removeProjectTruck(element) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['noHeightDialog'];
        dialogConfig.data = {
            labels: {
                title: "PROJECTS.TRUCKS.DELETEITEM_H1",
                content: "PROJECTS.TRUCKS.DELETEITEM_D1",
                save: "GLOBAL.REMOVE"
            }
        };

        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(res => {
            if (res) {
                this.service.removeProjectTruck(element.id).then(res=>{
                    this.refreshData();
                }, err=>{

                })
            }
        });
    }

    addProjectTruck(row, type: string) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['largeDialog'];

        if(type==='truck'){
            dialogConfig.data = {
                truckId: row.id
            };
        } else if(type==='trailer'){
            dialogConfig.data = {
                trailerId: row.id
            };
        }

        const dialogRef = this.dialog.open(ProjectTruckDetailsDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.refreshData();
            }
        });
    }

    filterSelectableTrucks() {
        if(this.storage.allTrucks){
            this.storage.selectableTrucks = this.storage.allTrucks.filter(el=>{
                if(el.type === 'truck'){
                    return this.storage.selectedTruckClasses.indexOf(el.truckClass) > -1 && this.storage.selectedTruckTypes.indexOf(el.classification) > -1;
                } else if(el.type === 'trailer'){
                    return this.storage.selectedTruckClasses.indexOf(el.trailerClass) > -1 && this.storage.selectedTruckTypes.indexOf(el.classification) > -1;
                }
            });
            this.dataSource = new MatTableDataSource(this.storage.selectableTrucks);
        }
    }

    openTruckDetails(row) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['largeDialog'];
        dialogConfig.data = {
            truck: row
        };
        const dialogRef = this.dialog.open(ProjectTruckDetailsDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.refreshData();
            }
        });
    }

    toggleProjectTruck(row, $event){
        this.service.patchProjectTruck({
            active: row.active
        }, row.id).then(res=>{

        }, err=>{

        })
    }
}
