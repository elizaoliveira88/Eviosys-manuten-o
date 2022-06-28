import { Component, Input, OnChanges, SimpleChanges } from '@angular/core';

@Component({
  selector: 'device-image',
  templateUrl: 'device-image.component.html',
})
export class DeviceImage implements OnChanges {
    device = {
        name:'',
        deviceType:'default'
    };
    @Input('device') data;
    defaultImageName = 'default';
    isCircle = false;

    constructor(
    ) {
        this.device.deviceType = this.defaultImageName;
    }

    ngOnChanges(changes: SimpleChanges) {
        if(changes.hasOwnProperty('data')) {
            this.checkDeviceProp();
        }
    }
    checkDeviceProp(){
        this.device.name = (!this.device.hasOwnProperty('name')) ? '' : this.data.name;
        this.isCircle = this.data && this.data.geoType && this.data.geoType === 'Circle';

        //switch(this.data.deviceType)
        if(this.data && this.data.deviceType){
            const name = this.data.deviceType.charAt(0).toUpperCase() + this.data.deviceType.slice(1);
            switch (name){
                case 'Beeper': case 'Gateway': case 'RtlsZone': case 'Staticunit': case 'TruckUnit': case 'TruckUnitSmall': case 'Zonemarker': {
                    this.device.deviceType = 'sgImg'+ this.data.deviceType.charAt(0).toUpperCase() + this.data.deviceType.slice(1);
                } return;
                default: {
                    this.device.deviceType = 'default';
                }
            }
        }
    }
}
