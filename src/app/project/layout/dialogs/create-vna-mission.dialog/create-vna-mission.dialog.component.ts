import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {ToastService} from "@services/toast.service";

@Component({
  selector: 'app-create-vna-mission.dialog',
  templateUrl: './create-vna-mission.dialog.component.html',
  styleUrls: ['./create-vna-mission.dialog.component.css']
})
export class CreateVnaMissionDialogComponent {
    newName =  null;
    flow = null;
    inputsRequired = false;
    color = null;

    flowInputs = {
        into: 0,
        out: 0,
        total: 0
    };
  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<CreateVnaMissionDialogComponent>,
              private toast: ToastService) {
      if(data.name) this.newName = data.name;
      this.color = this.getRandomColor();
  }

  flowInputsChanged() {
      if(this.flowInputs.into!==null && this.flowInputs.out!==null){
          this.flowInputs.total = this.flowInputs.into + this.flowInputs.out;
      }
  }
    getRandomColor() {
        let letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        color = this.ColorLuminance (color, 0.1);
        return color;
    }

    ColorLuminance(hex, lum) {
        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        let rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00"+c).substr(c.length);
        }
        return rgb;
    }

    changeColor (){
        this.color = this.getRandomColor();
    };

    uuidv4(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    cancel () {
        this.dialogRef.close();
    };

    save () {
        if(this.newName!==null && this.newName!==''){
            var newMission = {
                id: this.uuidv4(),
                type: 'vna',
                name: this.newName,
                elements: [],
                stopPoints : [],
                source: this.data.selEl.id,
                destination: this.data.selEl.id,
                flow: (this.flowInputs.total!==null) ? this.flowInputs.total : 0,
                color: this.color,
                missionErrors:{
                    missingFlow: false,
                    missingPath: false
                },
                bothDirections : null,
                isLoaded: null,
                /*   stopsPerCycle: 0,*/
                additionalTime: 0
            };
            this.dialogRef.close(newMission);
        }else this.inputsRequired = true;

    };

}
