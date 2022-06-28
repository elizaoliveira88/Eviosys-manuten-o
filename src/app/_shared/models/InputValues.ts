import {PickStrategy_DATA} from "@shared/models/PickStrategy";

export interface InputValues_DATA {
    additionalTime: number;
    averageCapacity: number;
    averageWeight: number;
    depositDistribution: string;
    depositPallet: string;
    depositPalletValue: number;
    distance: number;
    distanceDepositPallet: number;
    distanceInPickingZone: number;
    distancePickPallet: number;
    distancePickingZone: number;
    doubleCycles: number;
    durationShiftSec: number;
    emptyCarrier: boolean;
    flow: number;
    lengthOfShelf: number;
    load: number;
    loadUnload: string;
    loadingBayTime: number;
    maxNumOrderShift: number;
    nightShift: number;
    numItemsLine: number;
    numLinesPicking: number;
    numLoadsLorry: number;
    numLorries: number;
    numOrdersProcessed: number;
    numbPackageDay: number;
    numberOfContainers: number;
    numberOfCurves: number;
    numberOfScans: number;
    numberOfShelfs: number;
    numberOfStops: number;
    numberOfTrainStops: number;
    percentageAbove: number;
    pickDistribution: string;
    pickInHeightValue: number;
    pickPallet: string;
    pickPalletValue: number;
    pickStrategy: PickStrategy_DATA;
    rackChanges: number;
    rackHeight: number;
    scanDuration: number;
    stackNoStack: string;
    timeCarrier: number;
    traffic: boolean;
    trainDistance: number;
}



export class InputValues implements InputValues_DATA {
    additionalTime = 0;
    averageCapacity = 0;
    averageWeight = 0;
    depositDistribution = "";
    depositPallet = "";
    depositPalletValue = 0;
    distance = 0;
    distanceDepositPallet = 0;
    distanceInPickingZone = 0;
    distancePickPallet = 0;
    distancePickingZone = 0;
    doubleCycles = 0;
    durationShiftSec = 0;
    emptyCarrier = false;
    flow = 0;
    lengthOfShelf = 0;
    load = 0;
    loadUnload = "";
    loadingBayTime = 0;
    maxNumOrderShift = 0;
    nightShift = 0;
    numItemsLine = 0;
    numLinesPicking = 0;
    numLoadsLorry = 0;
    numLorries = 0;
    numOrdersProcessed = 0;
    numbPackageDay = 0;
    numberOfContainers = 0;
    numberOfCurves = 0;
    numberOfScans = 0;
    numberOfShelfs = 0;
    numberOfStops = 0;
    numberOfTrainStops = 0;
    percentageAbove = 0;
    pickDistribution = "";
    pickInHeightValue = 0;
    pickPallet = "";
    pickPalletValue = 0;
    pickStrategy = {
        horizontalLeft: 0,
        horizontalMiddle: 0,
        horizontalRight: 0,
        key: "",
        name: "",
        verticalBottom: 0,
        verticalMiddle: 0,
        verticalTop: 0
    };
    rackChanges = 0;
    rackHeight = 0;
    scanDuration = 0;
    stackNoStack = "";
    timeCarrier = 0;
    traffic = false;
    trainDistance = 0;

    constructor() {}
}
