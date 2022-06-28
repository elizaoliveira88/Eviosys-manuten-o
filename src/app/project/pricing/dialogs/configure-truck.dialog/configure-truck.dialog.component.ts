import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialog, MatDialogConfig, MatDialogRef} from "@angular/material/dialog";
import {DialogData} from "@shared/components/text-popup/text-popup.component";
import {PricingService} from "@app/project/pricing/pricing.service";
import {
    StandardConfigDialogComponent
} from "@app/project/pricing/dialogs/standard-config.dialog/standard-config.dialog.component";

@Component({
  selector: 'app-configure-truck.dialog',
  templateUrl: './configure-truck.dialog.component.html',
  styleUrls: ['./configure-truck.dialog.component.scss']
})
export class ConfigureTruckDialogComponent {

    storage = {
        grossPrice: 0,
        sumLindeOption: 0,
        sumBalyoOption: 0,
        discountPriceTruck: 0,
        discountPriceLinde: 0,
        discountPriceBalyo: 0,
        discountPriceCo: 0,
        purchasePrice: 0,
        baseTruckPrice: 0,
        automationPartPrice: 0
    };
    exchangeRatio = null;
    currency = null;
    selectedConfigurationOptions = [];

    selectedConfigurationOptionsInit = [];

    baseModel = null;
    standardComponents = {
        basetruck : [],
        automation : []
    };

    components = [];
    truckRow = null;

    lindeOpts = [];
    balyoOpts = [];

  constructor(public dialogRef: MatDialogRef<ConfigureTruckDialogComponent>,
              @Inject(MAT_DIALOG_DATA) public data: any,
              private service: PricingService,
              private dialog: MatDialog) {
      this.components = data.components;
      this.exchangeRatio = 1; //data.exchangeRatio;
      this.currency = "€"; //data.currency;
      this.truckRow = data.truckRow;
      this.selectedConfigurationOptions = data.truckRow.selectedConfigurationOptions ? data.truckRow.selectedConfigurationOptions : [];
      this.selectedConfigurationOptionsInit = JSON.parse(JSON.stringify(this.selectedConfigurationOptions));


      for(let i=0; i<this.components.length;i++){
          let co =  JSON.parse(JSON.stringify(this.components[i]));
          if(co.standardConfig){
              co.selected = true;
          }
          if(this.service.compIsBasetruck(co.category)) {
              if(co.componentGroup !== 'K-Matic'){
                  this.baseModel = JSON.parse(JSON.stringify(this.components[i]));
                  this.baseModel.selected = true;
                  co.price = co.price * this.exchangeRatio;
                  this.standardComponents.basetruck.push(co);
                  //this.baseModel.price = this.baseModel.price * this.exchangeRatio;
              } else {
                  this.lindeOpts.push(co);
              }
          } else {
              let co = JSON.parse(JSON.stringify(this.components[i]));
              co.price = co.price * this.exchangeRatio;
              if(co.hasOwnProperty('optionProvider') && co.optionProvider==='Linde'){
                  if(co.standardConfig && co.componentGroup !== 'K-Matic'){
                      this.standardComponents.basetruck.push(co);
                  } else {
                      this.lindeOpts.push(co);
                  }
              }else{
                  if(co.standardConfig && co.componentGroup !== 'K-Matic'){
                      this.standardComponents.automation.push(co);
                  } else {
                      this.balyoOpts.push(co);
                  }
              }
          }

          for(let k=0; k<this.selectedConfigurationOptions.length; k++){
              let opt = this.selectedConfigurationOptions[k];
              if(opt.id === co.id){
                  co.additionalInfo = opt.additionalInfo;
                  co.price = opt.price;
                  co.selected = opt.selected === true;
              }
          }
      }

      for(let k=0; k<this.selectedConfigurationOptions.length; k++){
          let existOpt = this.selectedConfigurationOptions[k];
          if(existOpt.additionalInfo === 'custom option' || existOpt.additionalInfo === 'custom option changed'){
              if(existOpt.optionProvider === 'Balyo'){
                  this.balyoOpts.push(JSON.parse(JSON.stringify(existOpt)));
              } else if(existOpt.optionProvider === 'Linde'){
                  this.lindeOpts.push(JSON.parse(JSON.stringify(existOpt)));
              }
          }
      }

      this.updateSelectedConfiguration();
  }

    checkOtherOptions (array, comp){
        for(let k=0;k<array.length;k++){
            if(array[k].selected){
                if(comp!==undefined && array[k].property === comp.property && array[k].id!== comp.id){
                    array[k].selected = false;
                }
            }
        }
    };

    updateSelectedConfiguration () {

        this.selectedConfigurationOptions = [];

        for(let z=0; z<this.selectedConfigurationOptionsInit.length; z++){
            let initCur = this.selectedConfigurationOptionsInit[z];
            if(initCur.standardConfig){
                this.selectedConfigurationOptions.push(initCur);
            }
            if(this.service.compIsBasetruck(initCur)){

            }
        }

        for(let k=0; k<this.lindeOpts.length;k++){
            let option = this.lindeOpts[k];
            if(option.selected || option.componentGroup === 'K-Matic' || option.additionalInfo==='custom option' || option.additionalInfo==='custom option changed'){
                if(!option.hasOwnProperty('selected')) option.selected = false;
                this.selectedConfigurationOptions.push(option);
            }
        }
        for(let k=0; k<this.balyoOpts.length;k++){
            let option = this.balyoOpts[k];
            if(option.selected || option.componentGroup === 'K-Matic' || option.additionalInfo==='custom option' || option.additionalInfo==='custom option changed'){
                if(!option.hasOwnProperty('selected')) option.selected = false;
                this.selectedConfigurationOptions.push(option);
            }
        }

        for(let i=0; i<this.selectedConfigurationOptions.length; i++){
            let opt = this.selectedConfigurationOptions[i];
            if(opt.standardConfig){
                let found = false;
                for(let k=0; k<this.selectedConfigurationOptions.length; k++){
                    let opt2 = this.selectedConfigurationOptions[k];
                    if(!opt2.standardConfig && opt.property === opt2.property) {
                        found = true;
                    }
                }
                opt.selected = !found;
            }
        }
        let res = this.service.calculateTruckPrices(this.truckRow, this.selectedConfigurationOptions);
        // res.truckRow , res.results

        this.storage.grossPrice = res.results.priceGrossTotal;
        this.storage.sumLindeOption = res.results.options.basetruck + res.results.options.co;
        this.storage.sumBalyoOption= res.results.options.automation;
        this.storage.discountPriceTruck = res.results.priceDiscountedBaseTruck + res.results.priceDiscountedAutomationKit;
        this.storage.discountPriceLinde = res.results.priceDiscountedBaseTruckOptions;
        this.storage.discountPriceBalyo = res.results.priceDiscountedAutomationPartOptions;
        this.storage.discountPriceCo = res.results.priceDiscountedCoOptions;
        this.storage.purchasePrice = res.truckRow.purchasePrice;
        this.storage.baseTruckPrice = res.results.standardConfig.basetruck + res.results.standardConfig.co;
        this.storage.automationPartPrice = res.results.standardConfig.automation;
    };

    changePrice (comp){
        if(!comp.selected) comp.selected = true;

        if(comp.additionalInfo === "custom option"){
            comp.additionalInfo = "custom option changed";
        }else comp.additionalInfo = "CO request changed";
    };

    removeOption (comp, type){
        if(type==='linde'){
            for(let k=0; k<this.lindeOpts.length; k++){
                if(this.lindeOpts[k].id === comp.id){
                    this.lindeOpts.splice(k,1);
                    break;
                }
            }
        }else if(type==='balyo'){
            for(let k=0; k<this.balyoOpts.length; k++){
                if(this.balyoOpts[k].id === comp.id){
                    this.balyoOpts.splice(k,1);
                    break;
                }
            }
        }
        this.updateSelectedConfiguration();
    };

    uuidv4() {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    addOption (type) {

        if (type === 'linde') {
            this.lindeOpts.push({
                id: this.uuidv4(),
                externalId: "",
                name: "",
                price: 0,
                category: "",
                componentGroup: "",
                componentClass: "",
                property: "",
                propertyValue: "",
                additionalInfo: "custom option",
                optionProvider: "Linde",
                standardConfig: false,
                customPrice: true,
                discountLevel: 'CO basetruck',
                selected: true
            });
        } else if (type === 'balyo') {
            this.balyoOpts.push({
                id: this.uuidv4(),
                externalId: "",
                name: "",
                price: 0,
                category: "",
                componentGroup: "",
                componentClass: "",
                property: "",
                propertyValue: "",
                additionalInfo: "custom option",
                optionProvider: "Balyo",
                standardConfig: false,
                customPrice: true,
                discountLevel: 'Automation',
                selected: true
            });
        }

        this.updateSelectedConfiguration();
    }

    openStandardConfig(){
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['noHeightDialog'];
        dialogConfig.data = {
            standardComponents: this.standardComponents
        };

        const dialogRef = this.dialog.open(StandardConfigDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {

            }
        });
    }

  save() {
        this.dialogRef.close([this.storage,this.selectedConfigurationOptions]);
  }

  cancel(){
        this.dialogRef.close();
  }
}
