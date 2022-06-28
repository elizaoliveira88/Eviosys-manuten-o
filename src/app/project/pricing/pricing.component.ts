import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subject} from "rxjs";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {TranslateService} from "@ngx-translate/core";
import {SelectedPricingComponent} from "@shared/models/SelectedPricingComponent";
import {PricingService} from "@app/project/pricing/pricing.service";
import {PricingComponents} from "@shared/models/PricingComponents";
import {takeUntil} from "rxjs/operators";
import {SimpleTruck_DATA} from "@shared/models/SimpleTruck";
import {MatTableDataSource} from "@angular/material/table";
import {Sort} from "@angular/material/sort";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {ConfirmDialogComponent} from "@shared/components/dialogs/confirm-dialog/confirm-dialog.component";
import {DefaultServicesEnum} from "@shared/enums/default-services.enum";
import {PromptDialogComponent} from "@shared/components/dialogs/prompt-dialog/prompt-dialog.component";
import {
    ConfigureTruckDialogComponent
} from "@app/project/pricing/dialogs/configure-truck.dialog/configure-truck.dialog.component";

@Component({
    selector: 'app-pricing',
    templateUrl: './pricing.component.html',
    styleUrls: ['./pricing.component.scss']
})
export class PricingComponent implements OnInit, OnDestroy {
    private ngUnsubscribe = new Subject();
    storage = {
        currency: '€',
        selectedProjectId: null,
        selectedProject: null,
        allTrucks: <SimpleTruck_DATA[]>[],

        allComponents: <PricingComponents[]>[],
        trucks: <SimpleTruck_DATA[]>[],
        energyConcept: <PricingComponents[]>[],
        itOptions: <PricingComponents[]>[],
        otherComponents: <PricingComponents[]>[],
        services: <PricingComponents[]>[],

        allSelectedComponents: <SelectedPricingComponent[]>[],
        categoriesWithoutName: [],

        showPurchasePrice: false,
        showRetailPrice: false,
        initialDiscountsMarginsRisks: {
            discountBaseTruck: 45,
            discountCoBaseTruck: 45,
            discountAutomationPart: 30,
            discountEnergyConcept: 30,
            discountItOptions: 30,
            discountOtherComponents: 0,
            profitMargin: 20,
            profitMarginServices: 0,
            risk: 3,
            riskServices: 0
        },

        truckMapping: {},
        totals: {
            totalTrucks: 0,
            totalComponents: 0,
            totalServices: 0
        },
        totalTotals: {
            totalSum: [0,0,0],
            totalMarginRisk: 0
        }
    }

    dataSourceTrucks = new MatTableDataSource([]);
    dataSourceEnergyConcept = new MatTableDataSource([]);
    dataSourceItOptions = new MatTableDataSource([]);
    dataSourceOtherComponents = new MatTableDataSource([]);
    dataSourceServices = new MatTableDataSource([]);

    trucksTotals = new MatTableDataSource([]);
    componentsTotals = new MatTableDataSource([]);
    servicesTotals = new MatTableDataSource([]);
    totalTotals = new MatTableDataSource([]);
    totalMarginRisk = new MatTableDataSource([]);

    allBackupRows = [];
    sortTruck: Sort = {
        active: 'truck',
        direction: 'asc'
    };
    sort: Sort = {
        active: 'category',
        direction: 'asc'
    };
    displayedColumnsTrucks: string[] = ['collected', 'truck', 'description', 'comment', 'number', 'unit', 'price', 'priceTotal', 'purchasePrice', 'purchasePriceTotal', 'endCustomerPrice', 'endCustomerPriceTotal', 'BTN_RESTORE', 'BTN_SAVE'];
    displayedColumns: string[] = ['collected', 'category', 'name', 'comment', 'number', 'unit', 'price', 'priceTotal', 'BTN_REMOVE', 'BTN_DISCOUNTS', 'BTN_RESTORE', 'BTN_SAVE'];

    defaultServices = [];


    constructor(private masterDataStore: MasterDataStore,
                private translateService: TranslateService,
                private service: PricingService,
                private dialog: MatDialog) {

        this.defaultServices = Object.values(DefaultServicesEnum);
        this.storage.truckMapping = this.service.getTruckMapping();

        this.masterDataStore.trucks_changed.pipe(
            takeUntil(this.ngUnsubscribe)
        ).subscribe(trucks=>{
            if(trucks){
                this.storage.allTrucks = trucks;
                this.storage.allTrucks.forEach(tr=>{
                    if(tr.classification.toUpperCase() === 'AGV'){
                        this.storage.trucks.push(tr);
                    }
                })
            }
        });

        this.storage.selectedProjectId = this.masterDataStore.selectedProject.id;
        this.service.getProject(this.storage.selectedProjectId).then(res=>{
            if(res){
                this.storage.selectedProject = res;
                if(this.storage.selectedProject.settings && this.storage.selectedProject.settings.currency){
                    this.storage.currency = this.storage.selectedProject.settings.currency;
                }
            }
        }, err=>{

        });

        this.service.getAllPricingComponents().then(res=>{
            if(res) {
                this.storage.allComponents = res;
                this.storage.allComponents.forEach(comp => {
                    if(comp.componentGroup === 'IT'){
                        this.storage.itOptions.push(comp);
                    } else if(comp.componentGroup === 'Energy'){
                        this.storage.energyConcept.push(comp);
                    } else {
                    }
                    if(comp.name === null || comp.name=== ''){
                        this.storage.categoriesWithoutName.push(comp.category);
                    }
                })
                this.refreshData();
            }
        }, err=>{
        })

        this.adaptTableColumns();
    }

    ngOnInit(): void {
    }

    ngOnDestroy() {
        this.ngUnsubscribe.next(true);
        this.ngUnsubscribe.complete();
    }

    refreshData() {
        this.service.getSelectedPricingComponents(this.storage.selectedProjectId).then(res=>{
            let selectedEnergyConcept = [];
            let selectedItOptions = [];
            let selectedOtherComponents = [];
            let selectedServices = [];
            let selectedTrucks = [];
            if(res){
                this.storage.allSelectedComponents = res;
                this.storage.allSelectedComponents.forEach(comp=>{
                    comp.showSave = false;

                    if(comp.componentId){
                        /* trucks */

                        /* energy concept */
                        let pricingComp = this.findComponentById(this.storage.energyConcept, comp.componentId);
                        if(pricingComp){
                            let row = this.createTableRow(comp,pricingComp);
                            selectedEnergyConcept.push(row);
                        }

                        /* it options */
                        let itComp = this.findComponentById(this.storage.itOptions, comp.componentId);
                        if(itComp){
                            let row = this.createTableRow(comp,itComp);
                            selectedItOptions.push(row);
                        }


                    } else {
                        /* other of service */
                        if(comp.type === 'OTHER'){
                            /* other components */
                            let row = this.createTableRowOther(comp);
                            selectedOtherComponents.push(row);

                        } else if(comp.type === 'SERVICE'){
                            /* other components */
                            let row = this.createTableRowService(comp);
                            selectedServices.push(row);

                        } else if(comp.truckIdentification){
                            /* trucks */
                            let tr: SimpleTruck_DATA = this.findTruckById(this.storage.trucks, comp.truckIdentification);
                            let row = this.createTableRowTruck(comp, tr);
                            selectedTrucks.push(row);

                        }
                    }

                });

                let componentsTotals = {
                    componentId: null,
                    selectedPricingComponentId: null,
                    category:null,
                    name: null,
                    comment: null,
                    number: null,
                    unit: null,
                    price: 'Subtotal',
                    priceEditable: false,
                    priceEdited: false,

                    priceTotal: 0 + this.storage.currency,
                    purchasePrice: 'Subtotal',
                    purchasePriceTotal: 0 + this.storage.currency,
                    endCustomerPrice: 'Subtotal',
                    endCustomerPriceTotal: 0 + this.storage.currency
                }

                let trucksTotals = {
                    componentId: null,
                    selectedPricingComponentId: null,
                    category:null,
                    name: null,
                    comment: null,
                    number: null,
                    unit: null,
                    price: 'Subtotal',
                    priceEditable: false,
                    priceEdited: false,

                    priceTotal: 0 + this.storage.currency,
                    purchasePrice: 'Subtotal',
                    purchasePriceTotal: 0 + this.storage.currency,
                    endCustomerPrice: 'Subtotal',
                    endCustomerPriceTotal: 0 + this.storage.currency
                }

                let servicesTotals = {
                    componentId: null,
                    selectedPricingComponentId: null,
                    category:null,
                    name: null,
                    comment: null,
                    number: null,
                    unit: null,
                    price: 'Subtotal',
                    priceEditable: false,
                    priceEdited: false,

                    priceTotal: 0 + this.storage.currency,
                    purchasePrice: 'Subtotal',
                    purchasePriceTotal: 0 + this.storage.currency,
                    endCustomerPrice: 'Subtotal',
                    endCustomerPriceTotal: 0 + this.storage.currency
                }

                let totalTotals = {
                    componentId: null,
                    selectedPricingComponentId: null,
                    category:null,
                    name: null,
                    comment: null,
                    number: null,
                    unit: null,
                    price: 'Total',
                    priceEditable: false,
                    priceEdited: false,

                    priceTotal: 0 + this.storage.currency,
                    purchasePrice: null,
                    purchasePriceTotal: 0 + this.storage.currency,
                    endCustomerPrice: 'End customer price total (recommended)',
                    endCustomerPriceTotal: 0 + this.storage.currency
                }

                let totalMarginRisk = {
                    componentId: null,
                    selectedPricingComponentId: null,
                    category:null,
                    name: null,
                    comment: null,
                    number: null,
                    unit: null,
                    price: null,
                    priceEditable: false,
                    priceEdited: false,

                    priceTotal: null,
                    purchasePrice: null,
                    purchasePriceTotal: null,
                    endCustomerPrice: 'Total Margin & Risk',
                    endCustomerPriceTotal: 0 + '%'
                }



                this.dataSourceEnergyConcept = new MatTableDataSource(selectedEnergyConcept);
                this.dataSourceItOptions = new MatTableDataSource(selectedItOptions);
                this.dataSourceOtherComponents = new MatTableDataSource(selectedOtherComponents);
                this.dataSourceServices = new MatTableDataSource(selectedServices);
                this.dataSourceTrucks = new MatTableDataSource(selectedTrucks);

                this.trucksTotals = new MatTableDataSource([trucksTotals]);
                this.componentsTotals = new MatTableDataSource([componentsTotals]);
                this.servicesTotals = new MatTableDataSource([servicesTotals]);
                this.totalTotals = new MatTableDataSource([totalTotals]);
                this.totalMarginRisk = new MatTableDataSource([totalMarginRisk]);

                this.calculateSectionTotals();

                this.allBackupRows = this.allBackupRows.concat(JSON.parse(JSON.stringify(selectedEnergyConcept)));
                this.allBackupRows = this.allBackupRows.concat(JSON.parse(JSON.stringify(selectedItOptions)));
                this.allBackupRows = this.allBackupRows.concat(JSON.parse(JSON.stringify(selectedOtherComponents)));
                this.allBackupRows = this.allBackupRows.concat(JSON.parse(JSON.stringify(selectedServices)));
                this.allBackupRows = this.allBackupRows.concat(JSON.parse(JSON.stringify(selectedTrucks)));
            }
        },err=>{

        });
    }

    createTableRow(comp, pricingComp: PricingComponents, type?: string): any{
        let price = 0;
        let priceEdited = false;
        let compType = pricingComp ? pricingComp.componentGroup : type;
        if (comp.grossPriceOverwrite){
            price = comp.grossPriceOverwrite;
            priceEdited = true;
        } else {
            price = pricingComp ? pricingComp.price : 0;
        }
        let calculatedRelatedPrices = this.calculateRelatedPrices(price, compType, comp);
        return {
            componentId: comp.componentId,
            collected:true,
            selectedPricingComponentId: comp.id,
            category: pricingComp ? pricingComp.category : null,
            name: pricingComp ? pricingComp.name : null,
            comment: comp.comment,
            number: comp.number,
            unit: 'PROJECTS.PRICING.UNIT.PC',
            price: price,
            priceEditable: pricingComp ? pricingComp.customPrice : null,
            priceEdited: priceEdited,

            priceTotal: calculatedRelatedPrices.priceTotal,
            purchasePrice: calculatedRelatedPrices.purchasePrice,
            purchasePriceTotal: calculatedRelatedPrices.purchasePriceTotal,
            endCustomerPrice: calculatedRelatedPrices.endCustomerPrice,
            endCustomerPriceTotal: calculatedRelatedPrices.endCustomerPriceTotal,

            selectedConfigurationOptions: comp.selectedConfigurationOptions,
            discountBaseTruck: comp.discountBaseTruck,
            discountCoBaseTruck: comp.discountCoBaseTruck,
            discountAutomationPart: comp.discountAutomationPart,
            discountEnergyConcept: comp.discountEnergyConcept,
            discountItOptions: comp.discountItOptions,
            discountOtherComponents: comp.discountOtherComponents,
            profitMargin: comp.profitMargin,
            profitMarginServices: comp.profitMarginServices,
            risk: comp.risk,
            riskServices: comp.riskServices,
            showSave: comp.showSave
        };
    }

    createTableRowTruck(comp, truck: SimpleTruck_DATA): any {
        let price = 0;
        let priceEdited = false;
        if (comp.grossPriceOverwrite) {
            price = comp.grossPriceOverwrite;
            priceEdited = true;
        }
        let calculatedRelatedPrices = this.calculateRelatedPrices(price, 'Truck', comp);

        return {
            componentId: null,
            selectedPricingComponentId: comp.id,
            category: comp.truckIdentification,
            name: comp.description,
            comment: comp.comment,
            number: comp.number,
            unit: 'PROJECTS.PRICING.UNIT.PC',
            price: calculatedRelatedPrices.price,
            priceEditable: comp.priceEditable,
            priceEdited: priceEdited,

            priceTotal: calculatedRelatedPrices.priceTotal,
            purchasePrice: calculatedRelatedPrices.purchasePrice,
            purchasePriceTotal: calculatedRelatedPrices.purchasePriceTotal,
            endCustomerPrice: calculatedRelatedPrices.endCustomerPrice,
            endCustomerPriceTotal: calculatedRelatedPrices.endCustomerPriceTotal,

            selectedConfigurationOptions: comp.selectedConfigurationOptions,
            discountBaseTruck: comp.discountBaseTruck,
            discountCoBaseTruck: comp.discountCoBaseTruck,
            discountAutomationPart: comp.discountAutomationPart,
            discountEnergyConcept: comp.discountEnergyConcept,
            discountItOptions: comp.discountItOptions,
            discountOtherComponents: comp.discountOtherComponents,
            profitMargin: comp.profitMargin,
            profitMarginServices: comp.profitMarginServices,
            risk: comp.risk,
            riskServices: comp.riskServices,
            showSave: comp.showSave
        };
    }

    createTableRowOther(comp): any {
        let price = 0;
        let priceEdited = false;
        if (comp.grossPriceOverwrite) {
            price = comp.grossPriceOverwrite;
            priceEdited = true;
        } else {
            price = 0;
        }
        let calculatedRelatedPrices = this.calculateRelatedPrices(price, 'Other', comp);

        return {
            componentId: null,
            selectedPricingComponentId: comp.id,
            category: comp.category,
            name: comp.description,
            comment: comp.comment,
            number: comp.number,
            unit: 'PROJECTS.PRICING.UNIT.PC',
            price: price,
            priceEditable: true,
            priceEdited: priceEdited,

            priceTotal: calculatedRelatedPrices.priceTotal,
            purchasePrice: calculatedRelatedPrices.purchasePrice,
            purchasePriceTotal: calculatedRelatedPrices.purchasePriceTotal,
            endCustomerPrice: calculatedRelatedPrices.endCustomerPrice,
            endCustomerPriceTotal: calculatedRelatedPrices.endCustomerPriceTotal,

            selectedConfigurationOptions: comp.selectedConfigurationOptions,
            discountBaseTruck: comp.discountBaseTruck,
            discountCoBaseTruck: comp.discountCoBaseTruck,
            discountAutomationPart: comp.discountAutomationPart,
            discountEnergyConcept: comp.discountEnergyConcept,
            discountItOptions: comp.discountItOptions,
            discountOtherComponents: comp.discountOtherComponents,
            profitMargin: comp.profitMargin,
            profitMarginServices: comp.profitMarginServices,
            risk: comp.risk,
            riskServices: comp.riskServices,
            showSave: comp.showSave
        };
    }

    createTableRowService(comp): any {
        let price = 0;
        let priceEdited = false;
        if (comp.grossPriceOverwrite) {
            price = comp.grossPriceOverwrite;
            priceEdited = true;
        } else {
            price = 0;
        }
        let calculatedRelatedPrices = this.calculateRelatedPrices(price, 'Other', comp);

        return {
            componentId: null,
            selectedPricingComponentId: comp.id,
            category: comp.category,
            name: comp.description,
            comment: comp.comment,
            number: comp.number,
            unit: 'PROJECTS.PRICING.UNIT.MD',
            price: price,
            priceEditable: true,
            priceEdited: priceEdited,

            priceTotal: calculatedRelatedPrices.priceTotal,
            purchasePrice: calculatedRelatedPrices.purchasePrice,
            purchasePriceTotal: calculatedRelatedPrices.purchasePriceTotal,
            endCustomerPrice: calculatedRelatedPrices.endCustomerPrice,
            endCustomerPriceTotal: calculatedRelatedPrices.endCustomerPriceTotal,

            selectedConfigurationOptions: comp.selectedConfigurationOptions,
            discountBaseTruck: comp.discountBaseTruck,
            discountCoBaseTruck: comp.discountCoBaseTruck,
            discountAutomationPart: comp.discountAutomationPart,
            discountEnergyConcept: comp.discountEnergyConcept,
            discountItOptions: comp.discountItOptions,
            discountOtherComponents: comp.discountOtherComponents,
            profitMargin: comp.profitMargin,
            profitMarginServices: comp.profitMarginServices,
            risk: comp.risk,
            riskServices: comp.riskServices,
            showSave: comp.showSave
        };
    }

    calculateRelatedPrices(price, compType, comp){
        if(compType === 'Truck'){
            //calculate with all options and different discounts
            if(this.service.truckHasManualPrice(comp.truckIdentification)){
                return {
                    priceTotal: price * comp.number,
                    purchasePrice: Math.ceil((price * (100 - this.getInitialDiscount(compType, comp)) / 100)),
                    purchasePriceTotal: (Math.ceil((price * (100 - this.getInitialDiscount(compType, comp)) / 100))) * comp.number,
                    endCustomerPrice: Math.ceil(( Math.ceil((price * (100 - this.getInitialDiscount(compType, comp)) / 100))) / ((100 - (comp.profitMargin + comp.risk)) / 100)),
                    endCustomerPriceTotal: (Math.ceil(( Math.ceil((price * (100 - this.getInitialDiscount(compType, comp)) / 100))) / ((100 - (comp.profitMargin + comp.risk)) / 100))) * comp.number
                }
            } else {
                comp = this.service.calculateTruckPrices(comp).truckRow;
                return {
                    price: comp.price,
                    priceTotal: comp.priceTotal,
                    purchasePrice: comp.purchasePrice,
                    purchasePriceTotal: comp.purchasePriceTotal,
                    endCustomerPrice: comp.endCustomerPrice,
                    endCustomerPriceTotal: comp.endCustomerPriceTotal
                }
            }

        } else {
            return {
                priceTotal: price * comp.number,
                purchasePrice: Math.ceil((price * (100 - this.getInitialDiscount(compType, comp)) / 100)),
                purchasePriceTotal: (Math.ceil((price * (100 - this.getInitialDiscount(compType, comp)) / 100))) * comp.number,
                endCustomerPrice: Math.ceil(( Math.ceil((price * (100 - this.getInitialDiscount(compType, comp)) / 100))) / ((100 - (comp.profitMargin + comp.risk)) / 100)),
                endCustomerPriceTotal: (Math.ceil(( Math.ceil((price * (100 - this.getInitialDiscount(compType, comp)) / 100))) / ((100 - (comp.profitMargin + comp.risk)) / 100))) * comp.number
            }
        }
    }

    truckSelectionChanged(element) {
        let truckComp = this.getTrucksComponents(element);
        let selectedConfigurationOptions = truckComp.selectedConfigurationOptions;

        element.selectedConfigurationOptions = selectedConfigurationOptions;
        element = this.service.calculateTruckPrices(element).truckRow;
        element.priceEdited = false;
    }

    openTruckConfigurator(element) {
        let truckComp = this.getTrucksComponents(element);
        let filteredComponents = truckComp.filteredComponents;

        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['paddingLess'];
        dialogConfig.data = {
            components: filteredComponents,
            truckRow: element
        };

        const dialogRef = this.dialog.open(ConfigureTruckDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                element.selectedConfigurationOptions = result[1];
                element = this.service.calculateTruckPrices(element).truckRow;
            }
        });
    }

    getTrucksComponents (truckRow){
        let filteredComponents = [];
        let selectedConfigurationOptions = [];
        let existingOptions = [];


        if(truckRow && truckRow.hasOwnProperty('selectedConfigurationOptions') && truckRow.selectedConfigurationOptions){
            existingOptions = JSON.parse(JSON.stringify(truckRow.selectedConfigurationOptions));
        }

        let globalComponents =  JSON.parse(JSON.stringify(this.storage.allComponents));

        for(let p=0; p<globalComponents.length;p++) {
            let comp = globalComponents[p];
            if (truckRow.category === this.storage.truckMapping[comp.componentGroup]) {

                let added = false;
                for(let k=0; k<existingOptions.length; k++){
                    let existOpt = existingOptions[k];
                    if(existOpt.id === comp.id){
                        if(comp.customPrice){
                            comp.additionalInfo = existOpt.additionalInfo;
                        }
                        comp.price = existOpt.price;
                        comp.selected = existOpt.selected;
                        selectedConfigurationOptions.push(comp);
                        added = true;
                    }
                }
                filteredComponents.push(comp);

                if(!added){
                    if (this.service.compIsBasetruck(comp.category)) {
                        comp.selected = true;
                        selectedConfigurationOptions.push(comp);
                        if(comp.customPrice){
                            truckRow.priceEditable = true;
                        } else {
                            truckRow.priceEditable = false;
                        }
                    } else if (comp.hasOwnProperty('standardConfig') && comp.standardConfig === true) {
                        comp.selected = true;
                        selectedConfigurationOptions.push(comp);
                    } else if (comp.hasOwnProperty('defaultSelected') && comp.defaultSelected === true) {
                        comp.selected = true;
                        selectedConfigurationOptions.push(comp);
                    }
                }


            }
        }

        // add customOptions
        for(let k=0; k<existingOptions.length; k++){
            let existOpt = existingOptions[k];
            if(existOpt.additionalInfo === 'custom option' || existOpt.additionalInfo === 'custom option changed'){
                selectedConfigurationOptions.push(existOpt);
            }
        }


        return {
            filteredComponents : filteredComponents,
            selectedConfigurationOptions: selectedConfigurationOptions
        };
    };

    findComponentById(arr: PricingComponents[], id: string): PricingComponents{
        let retObj = null;
        if(arr && id){
            arr.forEach(el=>{
                if(el.referenceId == id) {
                    retObj = JSON.parse(JSON.stringify(el));
                }
            })
        }
        return retObj;
    }

    findTruckById(arr: SimpleTruck_DATA[], id: string): SimpleTruck_DATA{
        let retObj = null;
        if(arr && id){
            arr.forEach(el=>{
                if(el.identification == id) {
                    retObj = JSON.parse(JSON.stringify(el));
                }
            })
        }
        return retObj;
    }

    findComponentByCategoryAndName(arr: PricingComponents[], category: string, name: string): PricingComponents{
        let retObj = null;
        if(arr && category && name){
            arr.forEach(el=>{
                if(el.category == category && el.name == name) {
                    retObj = JSON.parse(JSON.stringify(el));
                }
            })
        }
        return retObj;
    }

    findComponentByCategory(arr: PricingComponents[], category: string): PricingComponents{
        let retObj = null;
        if(arr && category){
            arr.forEach(el=>{
                if(el.category == category) {
                    retObj = JSON.parse(JSON.stringify(el));
                }
            })
        }
        return retObj;
    }

    togglePurchasePrice() {
        this.storage.showPurchasePrice = !this.storage.showPurchasePrice;
        this.adaptTableColumns();
    }

    toggleRetailPrice() {
        this.storage.showRetailPrice = !this.storage.showRetailPrice;
        this.adaptTableColumns();
    }

    adaptTableColumns(){
        if(this.storage.showPurchasePrice){
            if(this.storage.showRetailPrice){
                this.displayedColumns = ['collected', 'category', 'name', 'comment', 'number', 'unit', 'price', 'priceTotal', 'purchasePrice', 'purchasePriceTotal', 'endCustomerPrice', 'endCustomerPriceTotal', 'BTN_REMOVE', 'BTN_DISCOUNTS', 'BTN_RESTORE', 'BTN_SAVE'];
            } else {
                this.displayedColumns = ['collected', 'category', 'name', 'comment', 'number', 'unit', 'price', 'priceTotal', 'purchasePrice', 'purchasePriceTotal', 'BTN_REMOVE', 'BTN_DISCOUNTS', 'BTN_RESTORE', 'BTN_SAVE'];
            }
        } else {
            if(this.storage.showRetailPrice){
                this.displayedColumns = ['collected', 'category', 'name', 'comment', 'number', 'unit', 'price', 'priceTotal', 'endCustomerPrice', 'endCustomerPriceTotal', 'BTN_REMOVE', 'BTN_DISCOUNTS', 'BTN_RESTORE' ,'BTN_SAVE'];
            } else {
                this.displayedColumns = ['collected', 'category', 'name', 'comment', 'number', 'unit', 'price', 'priceTotal', 'BTN_REMOVE', 'BTN_DISCOUNTS', 'BTN_RESTORE', 'BTN_SAVE'];
            }
        }
    }

    editElementPrice(element) {
        element.priceEdited = true;
        element.showSave = true;
    }

    nameChanged(element, category) {
        let pricingComp = this.findComponentByCategoryAndName(this.storage.allComponents, element.category, element.name);
        let dummyEmptyRow = {
            componentId: pricingComp.referenceId,
            id: element.selectedPricingComponentId,
            comment: element.comment,
            number: element.number,
            discountBaseTruck: this.storage.initialDiscountsMarginsRisks.discountBaseTruck,
            discountCoBaseTruck: this.storage.initialDiscountsMarginsRisks.discountCoBaseTruck,
            discountAutomationPart: this.storage.initialDiscountsMarginsRisks.discountAutomationPart,
            discountEnergyConcept: this.storage.initialDiscountsMarginsRisks.discountEnergyConcept,
            discountItOptions:this.storage.initialDiscountsMarginsRisks.discountItOptions,
            discountOtherComponents: this.storage.initialDiscountsMarginsRisks.discountOtherComponents,
            profitMargin: this.storage.initialDiscountsMarginsRisks.profitMargin,
            profitMarginServices:  this.storage.initialDiscountsMarginsRisks.profitMarginServices,
            risk:  this.storage.initialDiscountsMarginsRisks.risk,
            riskServices: this.storage.initialDiscountsMarginsRisks.riskServices,
            selectedConfigurationOptions: [],
            showSave: true
        }
        let newEl = this.createTableRow(dummyEmptyRow, pricingComp);
        this.replaceRow(pricingComp.componentGroup, newEl);
    }

    categoryChanged(element, category) {
        if(this.storage.categoriesWithoutName.indexOf(element.category)>-1){
            let pricingComp = this.findComponentByCategory(this.storage.allComponents, element.category);
            let dummyEmptyRow = {
                componentId: pricingComp.referenceId,
                id: element.selectedPricingComponentId,
                comment: element.comment,
                number: element.number,
                discountBaseTruck: this.storage.initialDiscountsMarginsRisks.discountBaseTruck,
                discountCoBaseTruck: this.storage.initialDiscountsMarginsRisks.discountCoBaseTruck,
                discountAutomationPart: this.storage.initialDiscountsMarginsRisks.discountAutomationPart,
                discountEnergyConcept: this.storage.initialDiscountsMarginsRisks.discountEnergyConcept,
                discountItOptions:this.storage.initialDiscountsMarginsRisks.discountItOptions,
                discountOtherComponents: this.storage.initialDiscountsMarginsRisks.discountOtherComponents,
                profitMargin: this.storage.initialDiscountsMarginsRisks.profitMargin,
                profitMarginServices:  this.storage.initialDiscountsMarginsRisks.profitMarginServices,
                risk:  this.storage.initialDiscountsMarginsRisks.risk,
                riskServices: this.storage.initialDiscountsMarginsRisks.riskServices,
                selectedConfigurationOptions: [],
                showSave: true
            }
            let newEl = this.createTableRow(dummyEmptyRow, pricingComp);
            this.replaceRow(pricingComp.componentGroup, newEl);
        } else {
            element.componentId = null;
            element.name = null;
            element.price = 0;
            element.priceTotal = 0;
            element.purchasePrice = 0;
            element.purchasePriceTotal = 0;
            element.endCustomerPrice = 0;
            element.endCustomerPriceTotal = 0;
            element.showSave = true;

            if(category === 'Truck' ){
                this.truckSelectionChanged(element);
            }

            this.replaceRow(category, element);
        }
    }

    categoryTextInputChanged(element){
        element.showSave = true;
    }

    commentChanged(element) {
        element.showSave = true;
    }

    numberChanged(type, element) {
        element.showSave = true;
        let calculatedRelatedPrices = this.calculateRelatedPrices(element.price, type, element);
        element = Object.assign(element, calculatedRelatedPrices);

        this.calculateSectionTotals();
    }

    priceChanged(type, element) {
        element.showSave = true;
        let calculatedRelatedPrices = this.calculateRelatedPrices(element.price, type, element);
        element = Object.assign(element, calculatedRelatedPrices);

        this.calculateSectionTotals();
    }

    calculateSectionTotals() {
        let data = {
            dataSourceEnergyConcept: this.dataSourceEnergyConcept.data,
            dataSourceItOptions: this.dataSourceItOptions.data,
            dataSourceOtherComponents: this.dataSourceOtherComponents.data,
            dataSourceServices: this.dataSourceServices.data,
            dataSourceTrucks: this.dataSourceTrucks.data
        }
        this.storage.totals = this.service.calculateAllSectionTotals(this.storage.totals,data);
        this.storage.totalTotals = this.service.calculateTotals(this.storage.totals);

        let trucksTotals = this.trucksTotals.data;
        trucksTotals[0].priceTotal = this.storage.totals.totalTrucks[0] + this.storage.currency;
        trucksTotals[0].purchasePriceTotal = this.storage.totals.totalTrucks[1] + this.storage.currency;
        trucksTotals[0].endCustomerPriceTotal = this.storage.totals.totalTrucks[2] + this.storage.currency;

        let componentsTotals = this.componentsTotals.data;
        componentsTotals[0].priceTotal = this.storage.totals.totalComponents[0] + this.storage.currency;
        componentsTotals[0].purchasePriceTotal = this.storage.totals.totalComponents[1] + this.storage.currency;
        componentsTotals[0].endCustomerPriceTotal = this.storage.totals.totalComponents[2] + this.storage.currency;

        let servicesTotals = this.servicesTotals.data;
        servicesTotals[0].priceTotal = this.storage.totals.totalServices[0] + this.storage.currency;
        servicesTotals[0].purchasePriceTotal = this.storage.totals.totalServices[1] + this.storage.currency;
        servicesTotals[0].endCustomerPriceTotal = this.storage.totals.totalServices[2] + this.storage.currency;

        let totalTotals = this.totalTotals.data;
        totalTotals[0].priceTotal = this.storage.totalTotals.totalSum[0] + this.storage.currency;
        totalTotals[0].purchasePriceTotal = this.storage.totalTotals.totalSum[1] + this.storage.currency;
        totalTotals[0].endCustomerPriceTotal = this.storage.totalTotals.totalSum[2] + this.storage.currency;

        let totalMarginRisk = this.totalMarginRisk.data;
        totalMarginRisk[0].endCustomerPriceTotal = this.storage.totalTotals.totalMarginRisk;

    }

    discountsChanged(element) {
        element.showSave = true;
    }

    replaceRow(type, newEl){
        let newData = [];
        switch (type){
            case 'Energy': {
                for(let k=0; k<this.dataSourceEnergyConcept.data.length; k++){
                    if(this.dataSourceEnergyConcept.data[k].selectedPricingComponentId === newEl.selectedPricingComponentId){
                        newData.push(newEl);
                    } else {
                        newData.push(this.dataSourceEnergyConcept.data[k]);
                    }
                }
                this.dataSourceEnergyConcept.data = newData;
            }break;
            case 'Automation': {

            }break;
            case 'IT': {
                for(let k=0; k<this.dataSourceItOptions.data.length; k++){
                    if(this.dataSourceItOptions.data[k].selectedPricingComponentId === newEl.selectedPricingComponentId){
                        newData.push(newEl);
                    } else {
                        newData.push(this.dataSourceItOptions.data[k]);
                    }
                }
                this.dataSourceItOptions.data = newData;
            }break;
            case 'Basetruck':{

            }break;
            case 'CO basetruck':{

            }break;
            case 'Other':{
                for(let k=0; k<this.dataSourceOtherComponents.data.length; k++){
                    if(this.dataSourceOtherComponents.data[k].selectedPricingComponentId === newEl.selectedPricingComponentId){
                        newData.push(newEl);
                    } else {
                        newData.push(this.dataSourceOtherComponents.data[k]);
                    }
                }
                this.dataSourceOtherComponents.data = newData;
            }break;
        }

        this.calculateSectionTotals();
    }

    addEmptyRow(type){

        let dummyEmptyRow = {
            componentId: null,
            id: null,
            comment: null,
            number: 1,
            discountBaseTruck: this.storage.initialDiscountsMarginsRisks.discountBaseTruck,
            discountCoBaseTruck: this.storage.initialDiscountsMarginsRisks.discountCoBaseTruck,
            discountAutomationPart: this.storage.initialDiscountsMarginsRisks.discountAutomationPart,
            discountEnergyConcept: this.storage.initialDiscountsMarginsRisks.discountEnergyConcept,
            discountItOptions:this.storage.initialDiscountsMarginsRisks.discountItOptions,
            discountOtherComponents: this.storage.initialDiscountsMarginsRisks.discountOtherComponents,
            profitMargin: this.storage.initialDiscountsMarginsRisks.profitMargin,
            profitMarginServices:  this.storage.initialDiscountsMarginsRisks.profitMarginServices,
            risk:  this.storage.initialDiscountsMarginsRisks.risk,
            riskServices: this.storage.initialDiscountsMarginsRisks.riskServices,
            selectedConfigurationOptions: [],
            showSave: true
        }

        let newEl;
        if(type==='Other'){
            newEl = this.createTableRowOther(dummyEmptyRow);
        } else if(type==='Service'){
            newEl = this.createTableRowService(dummyEmptyRow);
        } else {
            newEl = this.createTableRow(dummyEmptyRow, null, type);
        }

        switch (type){
            case 'Energy': {
                let data = this.dataSourceEnergyConcept.data;
                data.push(newEl);
                this.dataSourceEnergyConcept.data = data;
            }break;
            case 'Truck': {
                let data = this.dataSourceTrucks.data;
                data.push(newEl);
                this.dataSourceTrucks.data = data;
            }break;
            case 'IT': {
                let data = this.dataSourceItOptions.data;
                data.push(newEl);
                this.dataSourceItOptions.data = data;
            }break;
            case 'Other':{
                let data = this.dataSourceOtherComponents.data;
                data.push(newEl);
                this.dataSourceOtherComponents.data = data;
            }break;
            case 'Service':{
                let data = this.dataSourceServices.data;
                data.push(newEl);
                this.dataSourceServices.data = data;
            }break;
        }
    }

    getInitialDiscount(type, comp?): number {
        //type : discountLevel
        if(comp){
            switch (type){
                case 'Energy': return comp.discountEnergyConcept;
                case 'Automation': return comp.discountAutomationPart;
                case 'IT': return comp.discountItOptions;
                case 'Basetruck': return comp. discountBaseTruck;
                case 'CO basetruck': return comp.discountCoBaseTruck;
                case 'Other': return comp.discountOtherComponents;
                case 'Service': return 0;
            }
        } else {
            switch (type){
                case 'Energy': return this.storage.initialDiscountsMarginsRisks.discountEnergyConcept;
                case 'Automation': return this.storage.initialDiscountsMarginsRisks.discountAutomationPart;
                case 'IT': return this.storage.initialDiscountsMarginsRisks.discountItOptions;
                case 'Basetruck': return this.storage.initialDiscountsMarginsRisks.discountBaseTruck;
                case 'CO basetruck': return this.storage.initialDiscountsMarginsRisks.discountCoBaseTruck;
                case 'Other': return this.storage.initialDiscountsMarginsRisks.discountOtherComponents;
                case 'Service': 0;
            }
        }

    }

    saveRow(type, row){
        // call save service
        // set showSave = false
        // save in backups

        // TODO: add service
        row.showSave = false;
        if(row.price===0 && row.priceEditable) row.priceEdited=false;
        row.selectedPricingComponentId = this.uuidv4();
        this.setNewBackupRow(row);

    }

    restoreRow(type, id){
        if(id!==null){
            switch (type){
                case 'Energy': {
                    let arr = this.dataSourceEnergyConcept.data;
                    for(let k=0; k<arr.length; k++){
                        if(arr[k].selectedPricingComponentId === id) {
                            arr[k] = this.findRowBySelectedPricingComponentId(this.allBackupRows,id);
                            break;
                        }
                    }
                    this.dataSourceEnergyConcept.data = arr;
                }break;
                case 'Automation': {

                }break;
                case 'IT': {
                    let arr = this.dataSourceItOptions.data;
                    for(let k=0; k<arr.length; k++){
                        if(arr[k].selectedPricingComponentId === id) {
                            arr[k] = this.findRowBySelectedPricingComponentId(this.allBackupRows,id);
                            break;
                        }
                    }
                    this.dataSourceItOptions.data = arr;
                }break;
                case 'Basetruck': {

                }break;
                case 'CO basetruck': {

                }break;
            }
        }

    }

    restoreRowOther(type, element){
        if(type === 'Other'){
            // other
            let arr = this.dataSourceOtherComponents.data;
            for(let k=0; k<arr.length; k++){
                if(arr[k].selectedPricingComponentId === element.selectedPricingComponentId) {
                    arr[k] = this.findRowBySelectedPricingComponentId(this.allBackupRows,element.selectedPricingComponentId);
                    break;
                }
            }
            this.dataSourceOtherComponents.data = arr;
        } else if(type=== 'Service'){
            let arr = this.dataSourceServices.data;
            for(let k=0; k<arr.length; k++){
                if(arr[k].selectedPricingComponentId === element.selectedPricingComponentId) {
                    arr[k] = this.findRowBySelectedPricingComponentId(this.allBackupRows,element.selectedPricingComponentId);
                    break;
                }
            }
            this.dataSourceServices.data = arr;
        }


    }

    restoreRowTruck(type, element){
        let arr = this.dataSourceTrucks.data;
        for(let k=0; k<arr.length; k++){
            if(arr[k].selectedPricingComponentId === element.selectedPricingComponentId) {
                arr[k] = this.findRowBySelectedPricingComponentId(this.allBackupRows,element.selectedPricingComponentId);
                break;
            }
        }
        this.dataSourceTrucks.data = arr;
    }

    setNewBackupRow(row){
        let arr = this.allBackupRows;
        let found = false;
        for(let k=0; k<arr.length; k++){
            if(arr[k].selectedPricingComponentId === row.selectedPricingComponentId) {
                arr[k] = JSON.parse(JSON.stringify(row));
                found = true;
                break;
            }
        }
        if(!found){
            this.allBackupRows.push(JSON.parse(JSON.stringify(row)));
        }
    }

    findRowBySelectedPricingComponentId(arr, id: string): any{
        let retObj = null;
        if(arr && id){
            arr.forEach(el=>{
                if(el['selectedPricingComponentId'] == id) {
                    retObj = JSON.parse(JSON.stringify(el));
                }
            })
        }
        return retObj;
    }

    saveBtnDisabled(row, type){

        if(type=='Other') return false;
        else if(type=='Service') {
            return !row.category || row.category === '';
        } else if(type=='Truck') {
            return !row.category || row.category === '';
        } else {
            if(row){
                if(row.category){
                    if(this.storage.categoriesWithoutName.indexOf(row.category)>-1){
                        return row.number<0;
                    } else {
                        if(row.number>=0){
                            return !row.name;
                        }else {
                            return true;
                        }
                    }
                } else {
                    return true;
                }
            } else return true;
        }

    }

    uuidv4(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    removeRow(type, element){
        for(let k=0; k<this.storage.allSelectedComponents.length; k++){
            if(this.storage.allSelectedComponents[k].id === element.selectedPricingComponentId){
                this.storage.allSelectedComponents.splice(k,1);
                break;
            }
        }
        switch (type){
            case 'Energy': {
                let arr = this.dataSourceEnergyConcept.data;
                for(let k=0; k<arr.length; k++){
                    if(arr[k].selectedPricingComponentId === element.selectedPricingComponentId) {
                        arr.splice(k,1);
                        break;
                    }
                }
                this.dataSourceEnergyConcept.data = arr;
            }break;
            case 'Truck': {
                let arr = this.dataSourceTrucks.data;
                for(let k=0; k<arr.length; k++){
                    if(arr[k].selectedPricingComponentId === element.selectedPricingComponentId) {
                        arr.splice(k,1);
                        break;
                    }
                }
                this.dataSourceTrucks.data = arr;
            }break;
            case 'IT': {
                let arr = this.dataSourceItOptions.data;
                for(let k=0; k<arr.length; k++){
                    if(arr[k].selectedPricingComponentId === element.selectedPricingComponentId) {
                        arr.splice(k,1);
                        break;
                    }
                }
                this.dataSourceItOptions.data = arr;
            }break;
            case 'Service': {
                let arr = this.dataSourceServices.data;
                for(let k=0; k<arr.length; k++){
                    if(arr[k].selectedPricingComponentId === element.selectedPricingComponentId) {
                        arr.splice(k,1);
                        break;
                    }
                }
                this.dataSourceServices.data = arr;
            }break;
            case 'Other': {
                let arr = this.dataSourceOtherComponents.data;
                for(let k=0; k<arr.length; k++){
                    if(arr[k].selectedPricingComponentId === element.selectedPricingComponentId) {
                        arr.splice(k,1);
                        break;
                    }
                }
                this.dataSourceOtherComponents.data = arr;
            }break;
        }
    }

    removeRowClicked(type, element) {
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: "PROJECTS.PRICING.DELETEROW_H1",
                content: "PROJECTS.PRICING.DELETEROW_D1",
                save: "GLOBAL.REMOVE"
            }
        };

        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                //TODO: call service
                this.removeRow(type,element);
            }
        });
    }

    generateExport() {

    }

    calculateEfforts() {

    }

    showUserGuidance() {

    }
}
