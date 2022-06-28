import {
    Component,
    Input,
    AfterViewInit,
    ViewChild,
    OnChanges,
    SimpleChanges,
    Output,
    EventEmitter,
    TemplateRef, ContentChild
} from '@angular/core';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { animate, state, style, transition, trigger } from '@angular/animations';

@Component({
    selector: 'ito-flex-table',
    templateUrl: './flexible-table.component.html',
    styleUrls: ['./flexible-table.component.css'],
    animations: [
        trigger('detailExpand', [
            state('collapsed', style({height: '0px', minHeight: '0', overflow: 'hidden'})),
            state('expanded', style({height: '*'})),
            transition('expanded <=> collapsed', animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')),
        ]),
        trigger('iconAnimation', [
            state('open', style({
                transform: 'rotate(180deg)'
            })),
            state('closed', style({
                transform: 'rotate(0deg)'
            })),
            transition('open => closed', [
                animate('0.5s')
            ]),
            transition('closed => open', [
                animate('0.5s')
            ]),
        ])
    ]
})
export class FlexibleTableComponent implements AfterViewInit, OnChanges {
    visibility = {
        rowSelection: false,
        downloadButton: false,
        deleteButton: false,
        expandButton: false,
        addButton: false,
        editButton: false,
        switchButton: false,
        detailsButton: false,
        editableFiled: false,
        statusIcon: false
    };
    selection = {
        numSelected: 0,
        allSelected: false
    };
    displayedColumnsKeys: string[];
    displayedColumns: any[];
    displayedColumnsMobile: any[];
    _tableDefinition = [];
    deviceImage = false;

    @Input('dataSource') dataSource: MatTableDataSource<any>;
    get tableDefinition() {
        return this._tableDefinition;
    }
    @Input('maxHeight') maxHeight: number = null;
    @Input('tableDefinition') set tableDefinition(data) {
        this._tableDefinition = data;
        this.displayedColumns = [];
        this.displayedColumnsKeys = [];
        this.displayedColumnsMobile = [];
        if(!data) return;
        data.forEach(element => {
            if(!element.hasOwnProperty('key')) return;
            if(this.displayedColumnsKeys.indexOf(element.key) > -1) return;

            var curCol = Object.assign({
                key: '',
                type: '',
                label: '',
                filter: '',
                filterParams: null,
                hidden: false
            }, element || {});

            this.displayedColumns.push(curCol);
            this.displayedColumnsKeys.push(curCol.key);
            if(curCol.type != '') {
                switch(curCol.type) {
                    case 'rowSelection': this.visibility.rowSelection = true; break;
                    case 'downloadButton': this.visibility.downloadButton = true; break;
                    case 'deleteButton': this.visibility.deleteButton = true; break;
                    case 'expandButton': this.visibility.expandButton = true; break;
                    case 'addButton': this.visibility.addButton = true; break;
                    case 'editButton': this.visibility.editButton = true; break;
                    case 'switchButton': this.visibility.editButton = true; break;
                    case 'detailsButton': this.visibility.detailsButton = true; break;
                    case 'status': this.visibility.statusIcon = true; break;
                    case 'toggle': this.displayedColumnsMobile.push(curCol); break;
                    case 'deviceImage': this.deviceImage = true; break;
                    case 'editableFiled':
                        this.visibility.editableFiled = true;
                        this.displayedColumnsMobile.push(curCol);
                    break;
                };
            } else {
                this.displayedColumnsMobile.push(curCol);
            }
        });
    }
    @Input('refreshPromise') refreshPromise: Promise<any>;
    @Output('onClick') onClickCallback: EventEmitter<any> = new EventEmitter();
    @ContentChild(TemplateRef) template: TemplateRef<any>;
    @Input('sort') sortObj?: any;
    @ViewChild(MatSort, {static: true})  sort: MatSort;
    @Input('small') isSmall: boolean = false;

    _setData() {
        this.dataSource.sort = this.sort;
        this.calcIsAllSelected();
    }

    ngAfterViewInit(): void {
        this._setData();
    }

    ngOnChanges(changes: SimpleChanges) {
        this._setData();
    }

    onClick($event, row, source, index) {
        switch(source) {
            case 'expandButton':
                if($event) {
                    $event.stopPropagation();
                }
                if(!row.hasOwnProperty('expanded') || row.expanded == false) {
                    row.expanded = true;
                } else {
                    row.expanded = false;
                }
                source += row.expanded ? ':OPEN':':CLOSED';
                break;
            case 'deleteButton':
            case 'editButton':
            case 'addButton':
            case 'detailsButton':
                if($event) {
                    $event.stopPropagation();
                }
                if(row.hasOwnProperty('deleted') && row.deleted == true) {
                    return;
                }
                break;

            case 'rowSelection':
                if($event) {
                    $event.stopPropagation();
                }
                break;
            case 'editableFiled':
        };

        this.onClickCallback.emit({
            $event: $event,
            row: row,
            source: source,
            index: index
        });
    }

    /** Whether the number of selected elements matches the total number of rows. */
    calcIsAllSelected() {
        this.selection.numSelected = this.dataSource.data.filter(row => {
            if(!row.hasOwnProperty('_selected')) { return false; }
            if(!row.hasOwnProperty('_editable') || row._editable == true) {
                return row._selected === true;
            }
            return false;
        }).length;
        const numRows = this.dataSource.data.filter(row => { return (!row.hasOwnProperty('_editable') || row._editable == true); }).length;
        this.selection.allSelected = (this.selection.numSelected === numRows);
    }

    masterToggle(event) {
        this.dataSource.data.forEach(row => {
            if(!row.hasOwnProperty('_editable') || row._editable == true) {
                row._selected = !this.selection.allSelected;
            }
        });

        this.calcIsAllSelected();

        if(!event.hasOwnProperty('stopPropagation')) {
            event.stopPropagation();
        }
        this.onClick(event, null, 'rowSelection', -1);
    }

    stopEvent($event) {
        $event.stopPropagation();
    }

    singleToggle(row, type, index) {
        row._selected = !row._selected;
        this.calcIsAllSelected();
        this.onClick(null, row, type, index);
    }

    checkboxLabel(row?): string {
        if (!row) {
            return `${this.selection.allSelected ? 'select' : 'deselect'} all`;
        }
        return `${row._selected ? 'deselect' : 'select'} row`;
    }

    editAttribute(element){
        element.isEditing = true;
    }

    stopEditAttribute(element){
        element.isEditing = false;
    }
}
