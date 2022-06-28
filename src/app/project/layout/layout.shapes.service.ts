import {Injectable} from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LayoutShapesService {

    sourceDestinationTypes = {
        numberSinglePos: {
            type: 'number',
            value: 0,
            min: 0,
            max: 20000,
            description: "SOURCEDESTINATION_NUMBERSINGLEPOS"
        },
        maxPickHeight: {
            type: 'number',
            value: 0,
            min: 0,
            max: 20,
            description: "SOURCEDESTINATION_PICKHEIGHT"
        },
        avgPickHeight: {
            type: 'number',
            value: 0,
            min: 0,
            max: 20,
            description: "SOURCEDESTINATION_AVGPICKHEIGHT"
        },
        pickHeight: {
            type: 'number',
            expert: true,
            value: 0,
            min: 0,
            max: 0.6,
            description: "SOURCEDESTINATION_PICKHEIGHT"
        },
        pickHeightConveyor: {
            type: 'number',
            value: 0,
            min: 0,
            max: 3,
            description: "SOURCEDESTINATION_PICKHEIGHT"
        },
        triggerCondition: {
            type: 'dropdown',
            disabled: 'TRIGGERCONDITIONS_WMS',
            value: null,
            min: null,
            max: null,
            description: "SOURCEDESTINATION_TRIGGERCONDITION",
            options: ["TRIGGERCONDITIONS_WMS", "TRIGGERCONDITIONS_PUSHBUTTONS", "TRIGGERCONDITIONS_SENSORS"]
        },
        triggerConditionDisabled: {
            type: 'dropdown',
            value: null,
            min: null,
            max: null,
            description: "SOURCEDESTINATION_TRIGGERCONDITION",
            options: ["TRIGGERCONDITIONS_WMS", "TRIGGERCONDITIONS_PUSHBUTTONS", "TRIGGERCONDITIONS_SENSORS"]
        },
        loadIdentification: {
            type: 'dropdown',
            value: null,
            min: null,
            max: null,
            description: "SOURCEDESTINATION_LOADIDENTIFICATION",
            options: ["LOADIDENTIFICATION_NONE", "LOADIDENTIFICATION_BARCODE", "LOADIDENTIFICATION_BARCODE2", "LOADIDENTIFICATION_WMS"]
        },
        loadIdentificationExpert: {
            type: 'dropdown',
            expert: true,
            value: null,
            min: null,
            max: null,
            description: "SOURCEDESTINATION_LOADIDENTIFICATION",
            options: ["LOADIDENTIFICATION_NONE", "LOADIDENTIFICATION_BARCODE", "LOADIDENTIFICATION_BARCODE2", "LOADIDENTIFICATION_WMS"]
        },
        loadIdentificationDisabled: {
            type: 'dropdown',
            disabled: 'LOADIDENTIFICATION_WMS',
            value: null,
            min: null,
            max: null,
            description: "SOURCEDESTINATION_LOADIDENTIFICATION",
            options: ["LOADIDENTIFICATION_NONE", "LOADIDENTIFICATION_BARCODE", "LOADIDENTIFICATION_BARCODE2", "LOADIDENTIFICATION_WMS"]
        },
        laneScanning: {
            type: 'radio',
            value: false,
            expert: true,
            min: null,
            max: null,
            description: "SOURCEDESTINATION_LANESCANNING"
        },
        numberLanesSideBySide: {
            type: 'number',
            value: 0,
            min: 0,
            max: 99,
            description: "SOURCEDESTINATION_NUMBERLANES"
        },
        depthBufferLane: {
            type: 'number',
            value: 0,
            min: 0,
            max: 99.9,
            description: "SOURCEDESTINATION_DEPTHBUFFERLANE"
        },
        numberPickLocations: {
            type: 'calculated',
            value: null,
            min: null,
            max: null,
            description: "SOURCEDESTINATION_NUMBERPICKLOCATIONS"
        },
        rackLength: {
            type: 'number',
            value: 0,
            min: 0,
            max: 999,
            description: "SOURCEDESTINATION_RACKLENGTH"
        },
        minAisleWidthVNA: {
            type: 'number',
            value: 0,
            min: 1.86,
            max: 2.1,
            description: "SOURCEDESTINATION_MINAISLEWIDTH"
        },
        minAisleWidth: {
            type: 'number',
            value: 0,
            min: 2.7,
            max: 9.9,
            description: "SOURCEDESTINATION_MINAISLEWIDTH"
        },
        numberAisles: {
            type: 'number',
            value: 0,
            min: 0,
            max: 999,
            description: "SOURCEDESTINATION_NUMBERAISLES"
        },
        numberConveyorPos: {
            type: 'number',
            value: 0,
            min: 0,
            max: 99,
            description: "SOURCEDESTINATION_NUMBERCONVEYORPOS"
        },
        waitingTimeForAccess: {
            type: 'number',
            value: 0,
            min: 0,
            max: 300,
            description: "SOURCEDESTINATION_WAITINGTIMEACCESS"
        },
        locationCasterWheelAccessible: {
            type: 'radio',
            value: true,
            expert: true,
            min: null,
            max: null,
            description: "SOURCEDESTINATION_LOCATIONCASTER"
        },
        dropHeight: {
            type: 'number',
            expert: true,
            value: 0,
            min: 0,
            max: 0.6,
            description: "SOURCEDESTINATION_DROPHEIGHT"
        },
        maxDropHeight: {
            type: 'number',
            value: 0,
            min: 0,
            max: 20,
            description: "SOURCEDESTINATION_DROPHEIGHT"
        },
        avgDropHeight: {
            type: 'number',
            value: 0,
            min: 0,
            max: 20,
            description: "SOURCEDESTINATION_AVGDROPHEIGHT"
        },
        numberDropLocation: {
            type: 'calculated',
            value: null,
            min: null,
            max: null,
            description: "SOURCEDESTINATION_NUMBERDROPLOCATION"
        },
        palletSpaceAvailabilityCheck: {
            type: 'dropdown',
            value: 'PALLETSPACEAVAILABILITYCHECK_TIMSENSOR',
            min: null,
            max: null,
            description: "SOURCEDESTINATION_PALLETSPACE",
            options: ["PALLETSPACEAVAILABILITYCHECK_TIMSENSOR", "PALLETSPACEAVAILABILITYCHECK_SENSOR", "PALLETSPACEAVAILABILITYCHECK_WMS"]
        },
        handoverType: {
            type: 'dropdown',
            value: "HANDOVERTYPE_TOP",
            min: null,
            max: null,
            description: "SOURCEDESTINATION_HANDOVERTYPE",
            options: ["HANDOVERTYPE_CONVEYOR", "HANDOVERTYPE_TOP", "HANDOVERTYPE_TOPBOTTOM"]
        },
        distanceToHandoverLocation: {
            type: 'number',
            value: 0,
            min: -10,
            max: null,
            description: "SOURCEDESTINATION_DISTANCETOHANDOVER"
        },
        cyclesTillAisleChange: {
            type: 'dropdown',
            value: 5,
            min: 1,
            max: 10,
            description: "SOURCEDESTINATION_CYCLESTILLAISLECHANGE",
            options: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10]
        },
        pickDropsTillPivotingForks: {
            type: 'dropdown',
            value: 2,
            min: 0,
            max: null,
            description: "SOURCEDESTINATION_PICKDROPSTILLPIVOT",
            options: [1, 2, 3, 4, 5]
        },
        doubleCyclePercentage: {
            type: 'number',
            value: 50,
            min: 0,
            max: 100,
            description: "SOURCEDESTINATION_DOUBLECYCLE"
        },
        couplingTime: {
            type: 'number',
            value: null,
            min: 0,
            max: 600,
            description: "SOURCEDESTINATION_COUPLINGTIME"
        },
        rackHeight: {
            type: 'number',
            value: null,
            min: 0,
            max: 20,
            description: "APPLICATION_FLOWPLAN_VNA_H1"
        },
        numberOfComboxes: {
            type: 'number',
            condition: 'triggerCondition',
            value: null,
            min: 0,
            max: 100,
            description: "APPLICATION_FLOWPLAN_NUMBEROFCOMBOXES"
        },
        numberOfSpaces: {
            type: 'number',
            value: 0,
            min: 0,
            max: null,
            description: "APPLICATION_FLOWPLAN_NUMBEROFSPACES"
        }
    };

    sourceTypes = {
        singlePositions: ['numberSinglePos', 'pickHeight', 'triggerCondition', 'numberOfComboxes', 'loadIdentification', 'laneScanning'],
        bufferLane: ['numberLanesSideBySide', 'depthBufferLane', 'numberPickLocations', 'triggerCondition', 'numberOfComboxes', 'loadIdentification', 'laneScanning'],
        rack: ['maxPickHeight', 'rackLength', 'minAisleWidth', 'numberAisles', 'numberOfSpaces', 'triggerCondition', 'numberOfComboxes', 'loadIdentificationExpert'],
        conveyor: ['numberConveyorPos', 'pickHeightConveyor', 'triggerCondition', 'numberOfComboxes', 'loadIdentificationExpert'],
        userDefined: ['numberSinglePos', 'maxPickHeight', 'triggerCondition', 'numberOfComboxes', 'loadIdentificationExpert', 'waitingTimeForAccess', 'laneScanning', 'locationCasterWheelAccessible']
    };

    destinationTypes = {
        singlePositions: ['numberSinglePos', 'dropHeight', 'laneScanning'],
        bufferLane: ['numberLanesSideBySide', 'depthBufferLane', 'numberDropLocation', 'laneScanning'],
        rack: ['maxDropHeight', 'rackLength', 'minAisleWidth', 'numberAisles', 'numberOfSpaces', 'palletSpaceAvailabilityCheck'],
        conveyor: ['numberConveyorPos', 'pickHeightConveyor', 'palletSpaceAvailabilityCheck'],
        userDefined: ['numberSinglePos', 'maxPickHeight', 'waitingTimeForAccess', 'palletSpaceAvailabilityCheck', 'locationCasterWheelAccessible']
    };

    sdTypes = {
        vna: ['rackHeight', 'rackLength', 'minAisleWidthVNA', 'numberAisles', 'numberOfSpaces', 'handoverType', 'distanceToHandoverLocation', 'avgPickHeight', 'avgDropHeight', 'triggerConditionDisabled', 'loadIdentificationDisabled', 'cyclesTillAisleChange', 'pickDropsTillPivotingForks', 'doubleCyclePercentage'],
        vnaRackSupply: ['numberSinglePos', 'maxPickHeight', 'triggerCondition', 'numberOfComboxes', 'loadIdentification', 'laneScanning'],
        tuggerTrain: ['triggerCondition', 'numberOfComboxes', 'loadIdentification'],
        singlePositions: ['numberSinglePos', 'pickHeight', 'triggerCondition', 'numberOfComboxes', 'loadIdentification', 'laneScanning'],
        bufferLane: ['numberLanesSideBySide', 'depthBufferLane', 'numberPickLocations', 'triggerCondition', 'numberOfComboxes', 'loadIdentification', 'laneScanning'],
        rack: ['maxPickHeight', 'rackLength', 'minAisleWidth', 'numberAisles', 'numberOfSpaces', 'triggerCondition', 'numberOfComboxes', 'loadIdentificationExpert'],
        conveyor: ['numberConveyorPos', 'pickHeightConveyor', 'triggerCondition', 'numberOfComboxes', 'loadIdentificationExpert'],
        userDefined: ['numberSinglePos', 'maxPickHeight', 'triggerCondition', 'numberOfComboxes', 'loadIdentificationExpert', 'waitingTimeForAccess', 'laneScanning', 'locationCasterWheelAccessible']
    };

    typeParamsMapping = {
        'S:P': ['displayLength', 'visible', 'singleDirection', 'locked', 'laneSpacing', 'doppelspur'],
        'S:G': ['visible', 'stopTimeInSeconds', 'locked'],
        'S:W': ['displayLength', 'visible', 'locked'],
        'S:C': ['displayLength', 'visible', 'singleDirection', 'locked', 'laneSpacing', 'doppelspur'],
        'S:D': ['visible', 'locked'],
        'S:S': ['visible', 'locked'],
        'S:SD': ['visible', 'locked'],
        'S:I': ['opacity', 'visible', 'locked'],
        'S:RL': ['displayLength', 'visible', 'distance', 'locked'],
        'S:TSP': []
    };

    constructor() {

    }

    getAll() {
        return {
            sourceDestinationTypes: this.sourceDestinationTypes,
            sourceTypes: this.sourceTypes,
            destinationTypes: this.destinationTypes,
            sdTypes: this.sdTypes,
            typeParamsMapping: this.typeParamsMapping
        }
    }

    getTypeParamsMapping() {
        return this.typeParamsMapping;
    }

    getSourceDestinationTypes() {
        return this.sourceDestinationTypes;
    }

    getSourceTypes() {
        return this.sourceTypes;
    }

    getDestinationTypes() {
        return this.destinationTypes;
    }

    getSdTypes() {
        return this.sdTypes;
    }

    getMappedObj() {
        var ret = {
            source: {},
            destination: {},
            sd: {}
        };

        for (var key in this.sourceTypes) {
            if (this.sourceTypes.hasOwnProperty(key)) {
                var arr = this.sourceTypes[key];
                ret.source[key] = {};
                for (var k = 0; k < arr.length; k++) {
                    ret.source[key][arr[k]] = this.sourceDestinationTypes[arr[k]];
                }
            }
        }
        for (var key2 in this.destinationTypes) {
            if (this.destinationTypes.hasOwnProperty(key2)) {
                var arr2 = this.destinationTypes[key2];
                ret.destination[key2] = {};
                for (var l = 0; l < arr2.length; l++) {
                    ret.destination[key2][arr2[l]] = this.sourceDestinationTypes[arr2[l]];
                }
            }
        }
        for (var key3 in this.sdTypes) {
            if (this.sdTypes.hasOwnProperty(key3)) {
                var arr3 = this.sdTypes[key3];
                ret.sd[key3] = {};
                for (var m = 0; m < arr3.length; m++) {
                    ret.sd[key3][arr3[m]] = this.sourceDestinationTypes[arr3[m]];
                }
            }
        }
        return ret;
    }
}

