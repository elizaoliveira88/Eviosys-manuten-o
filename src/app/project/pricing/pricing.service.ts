import { Injectable } from '@angular/core';
import {GatewayService} from "@services/gateway-service/gateway.service";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {FlowPlanTruckSet} from "@shared/models/FlowPlanTruckSet";
import {PricingComponents} from "@shared/models/PricingComponents";
import {SelectedPricingComponent} from "@shared/models/SelectedPricingComponent";
import {Project_DATA} from "@shared/models/Project";

@Injectable({
  providedIn: 'root'
})
export class PricingService {

    trucksWithManualPrice = [
        "T-MATIC (131-01)",
        "L-MATIC 20 HD (1173)"
    ];

    truckMapping = {
        "L-Matic 12 AC" : "L-MATIC 12 AC (1170)",
        "L-Matic 16 AC" : "L-MATIC 16 AC (1170)",
        "L-Matic" : "L-MATIC (133)",
        "P-Matic" : "P-MATIC (1190-00)",
        "T-Matic" : "T-MATIC (131-01)",
        "R-Matic" : "R-MATIC (1120)",
        "K-Matic" : "K-MATIC (5231)",
        "L-Matic 20 HD" : "L-MATIC 20 HD (1173)",
        "L-Matic 16 HD" : "L-MATIC 16 HD (1173)"
    };

  constructor(public gatewayService: GatewayService,
              public dataStore: MasterDataStore) { }

    getAllPricingComponents(): Promise<PricingComponents[]>  {
        const url = 'components/';
        return this.gatewayService.get({
            url: url
        });
    }

    getProject(id: string): Promise<Project_DATA>  {
        const url = 'projects/' + id + '?exclude=vendorData,customerData';
        return this.gatewayService.get({
            url: url
        });
    }

    getSelectedPricingComponents(projectId): Promise<SelectedPricingComponent[]>  {
        const url = 'projects/' + projectId + '/pricingComponents';
        return this.gatewayService.get({
            url: url
        });
    }

    truckHasManualPrice (str) {
        return !!str && this.trucksWithManualPrice.indexOf(str)>-1;
    }

    compIsBasetruck (str) {
        return (str === 'Standard Configuration' || str === 'MODEL' || str === 'Base model' || str === 'base model' || str === 'Truck');
    }

    getTruckMapping() {
      return this.truckMapping;
    }

    calculateTruckPrices(row, selectedConfigurationOptions?){
        let storage = {
            priceDiscountedBaseTruck: 0,
            priceDiscountedCOBaseTruck: 0,
            priceDiscountedAutomationKit: 0,
            priceDiscountedBaseTruckOptions: 0,
            priceDiscountedAutomationPartOptions: 0,
            priceDiscountedCoOptions: 0,

            priceDiscountedTruckTotal: 0,
            priceGrossTotal: 0,

            purchasePrice: 0,


            standardConfig: {
                basetruck: 0,
                automation: 0,
                co: 0
            },
            options: {
                basetruck: 0,
                co: 0,
                automation: 0
            }
        };

        //row.filteredComponents
        //row.filteredStandard
        //row.selectedConfigurationOptions

        // use rows selectedConfigurationOptions only if not overwritten by 'selectedConfigurationOptions' (from truckConfigurator)
        let calcSelectedConfigurationOptions = !!selectedConfigurationOptions ? selectedConfigurationOptions : ((!!row.selectedConfigurationOptions && row.selectedConfigurationOptions.length>0) ? row.selectedConfigurationOptions : []);

        if(!this.truckHasManualPrice(row.category)){
            if(!!calcSelectedConfigurationOptions && calcSelectedConfigurationOptions.length>0){
                for(let k=0; k<calcSelectedConfigurationOptions.length; k++){
                    let opt = calcSelectedConfigurationOptions[k];


                    if(!!opt.price){
                        if(opt.standardConfig || this.compIsBasetruck(opt.category)){
                            // base truck and standardConfigs
                            if(opt.hasOwnProperty('discountLevel') && opt.discountLevel!==''){
                                if(opt.discountLevel === 'Basetruck'){
                                    storage.standardConfig.basetruck += opt.price;
                                } else if(opt.discountLevel === 'Automation'){
                                    storage.standardConfig.automation += opt.price;
                                } else if(opt.discountLevel === 'CO basetruck'){
                                    storage.standardConfig.co += opt.price;
                                }
                            } else {
                                if(opt.optionProvider === 'Balyo'){
                                    storage.standardConfig.automation += opt.price;
                                } else {
                                    storage.standardConfig.basetruck += opt.price;
                                }
                            }

                        } else {
                            // options
                            if(opt.selected){
                                if(opt.hasOwnProperty('discountLevel')  && opt.discountLevel!==''){
                                    if(opt.discountLevel === 'Basetruck'){
                                        storage.options.basetruck += opt.price;
                                    } else if(opt.discountLevel === 'Automation'){
                                        storage.options.automation += opt.price;
                                    } else if (opt.discountLevel === 'CO basetruck'){
                                        storage.options.co += opt.price;
                                    }
                                } else {
                                    if(opt.additionalInfo === 'custom option' || opt.additionalInfo === 'custom option changed'){
                                        storage.options.co += opt.price;
                                    } else {
                                        if(opt.optionProvider === 'Balyo'){
                                            storage.options.automation += opt.price;
                                        } else {
                                            storage.options.basetruck += opt.price;
                                        }
                                    }
                                }
                            }
                        }
                    }

                }
                storage.priceGrossTotal = storage.standardConfig.basetruck + storage.standardConfig.automation + storage.standardConfig.co +
                    storage.options.basetruck + storage.options.automation + storage.options.co;

                storage.priceDiscountedBaseTruck = (storage.standardConfig.basetruck * (1-(row.discountBaseTruck/100)) );
                storage.priceDiscountedCOBaseTruck = (storage.standardConfig.co * (1-(row.discountCoBaseTruck/100)) );
                storage.priceDiscountedAutomationKit = (storage.standardConfig.automation * (1-(row.discountAutomationPart/100)) );

                storage.priceDiscountedBaseTruckOptions = (storage.options.basetruck * (1-(row.discountBaseTruck/100)) );
                storage.priceDiscountedAutomationPartOptions = (storage.options.automation * (1-(row.discountAutomationPart/100)) );
                storage.priceDiscountedCoOptions = (storage.options.co * (1-(row.discountCoBaseTruck/100)) );

                storage.priceDiscountedTruckTotal = storage.priceDiscountedBaseTruck+storage.priceDiscountedCOBaseTruck+storage.priceDiscountedAutomationKit+storage.priceDiscountedBaseTruckOptions+storage.priceDiscountedAutomationPartOptions+storage.priceDiscountedCoOptions;
            } else {
                // e.g. K-MATIC: 0 default options
                storage.priceGrossTotal = 0;
                storage.priceDiscountedTruckTotal = (storage.priceGrossTotal * (1-(row.discountBaseTruck/100)) );
            }

        } else {
            // If request price
            storage.priceGrossTotal = row.price;
            storage.priceDiscountedTruckTotal = (storage.priceGrossTotal * (1-(row.discountBaseTruck/100)) );
        }
        row.price = Math.ceil(JSON.parse(JSON.stringify(storage.priceGrossTotal)));
        row.purchasePrice = Math.ceil(JSON.parse(JSON.stringify(storage.priceDiscountedTruckTotal)));
        row.endCustomerPrice =  Math.ceil(JSON.parse(JSON.stringify(row.purchasePrice)) / ((100 - (row.profitMargin + row.risk) )/100));

        row.priceTotal = row.price * row.number;
        row.purchasePriceTotal = row.purchasePrice * row.number;
        row.endCustomerPriceTotal = row.endCustomerPrice * row.number;

        return {
            truckRow: row,
            results: storage
        };
    }


    calculateAllSectionTotals (totals,data) {
        totals.totalTrucks = this.calculateSectionTotals (data, 'totalTrucks');
        totals.totalComponents = this.calculateSectionTotals (data, 'totalComponents');
        totals.totalServices = this.calculateSectionTotals (data, 'totalServices');
        return totals;
    }

    calculateSectionTotals (data, type) {
        let totals = {
            totalTrucks: [0, 0, 0],
            totalComponents: [0, 0, 0],
            totalServices: [0, 0, 0]
        };

        if(data){
            if(type === 'totalTrucks'){
                if(data.dataSourceTrucks){
                    for (let k = 0; k < data.dataSourceTrucks.length; k++) {
                        totals.totalTrucks[0] += (data.dataSourceTrucks[k].number * data.dataSourceTrucks[k].price);
                        totals.totalTrucks[1] += (data.dataSourceTrucks[k].number * data.dataSourceTrucks[k].purchasePrice);
                        totals.totalTrucks[2] += (data.dataSourceTrucks[k].number * data.dataSourceTrucks[k].endCustomerPrice);
                    }
                }
                return totals.totalTrucks;
            } else if(type === 'totalServices'){
                if(data.dataSourceServices){
                    for (let k = 0; k < data.dataSourceServices.length; k++) {
                        totals.totalServices[0] += (data.dataSourceServices[k].number * data.dataSourceServices[k].price);
                        totals.totalServices[1] += (data.dataSourceServices[k].number * data.dataSourceServices[k].purchasePrice);
                        totals.totalServices[2] += (data.dataSourceServices[k].number * data.dataSourceServices[k].endCustomerPrice);
                    }
                }
                return totals.totalServices;
            } else if(type === 'totalComponents'){
                if(data.dataSourceItOptions){
                    for (let k = 0; k < data.dataSourceItOptions.length; k++) {
                        totals.totalComponents[0] += (data.dataSourceItOptions[k].number * data.dataSourceItOptions[k].price);
                        totals.totalComponents[1] += (data.dataSourceItOptions[k].number * data.dataSourceItOptions[k].purchasePrice);
                        totals.totalComponents[2] += (data.dataSourceItOptions[k].number * data.dataSourceItOptions[k].endCustomerPrice);
                    }
                }
                if(data.dataSourceEnergyConcept){
                    for (let k = 0; k < data.dataSourceEnergyConcept.length; k++) {
                        totals.totalComponents[0] += (data.dataSourceEnergyConcept[k].number * data.dataSourceEnergyConcept[k].price);
                        totals.totalComponents[1] += (data.dataSourceEnergyConcept[k].number * data.dataSourceEnergyConcept[k].purchasePrice);
                        totals.totalComponents[2] += (data.dataSourceEnergyConcept[k].number * data.dataSourceEnergyConcept[k].endCustomerPrice);
                    }
                }
                if(data.dataSourceOtherComponents){
                    for (let k = 0; k < data.dataSourceOtherComponents.length; k++) {
                        totals.totalComponents[0] += (data.dataSourceOtherComponents[k].number * data.dataSourceOtherComponents[k].price);
                        totals.totalComponents[1] += (data.dataSourceOtherComponents[k].number * data.dataSourceOtherComponents[k].purchasePrice);
                        totals.totalComponents[2] += (data.dataSourceOtherComponents[k].number * data.dataSourceOtherComponents[k].endCustomerPrice);
                    }
                }
                return totals.totalComponents;
            }
            else return [0, 0, 0];
        } else {
            return [0, 0, 0];
        }
    }

    calculateTotals(data) {
        let totalTotals = {
            totalSum: [0, 0, 0],
            totalMarginRisk: 0
        };

        if (data) {
            for (var k = 0; k < 3; k++) {
                totalTotals.totalSum[k] = data.totalTrucks[k] + data.totalServices[k] + data.totalComponents[k];
            }
        }
        if (totalTotals.totalSum[1] !== null && totalTotals.totalSum[2] && totalTotals.totalSum[2]!==0) {
            totalTotals.totalMarginRisk = 1 - totalTotals.totalSum[1] / totalTotals.totalSum[2];
        }
        return totalTotals;
    }
}
