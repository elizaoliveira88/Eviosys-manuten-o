import {Component, Inject, OnInit} from '@angular/core';
import {MAT_DIALOG_DATA, MatDialogRef} from "@angular/material/dialog";
import {FormControl, FormGroup, Validators} from "@angular/forms";

@Component({
  selector: 'app-create-mission-from-suggestion.dialog',
  templateUrl: './create-mission-from-suggestion.dialog.component.html',
  styleUrls: ['./create-mission-from-suggestion.dialog.component.css']
})
export class CreateMissionFromSuggestionDialogComponent implements OnInit {
    bothDirPossible = null;
    form: FormGroup;

  constructor(@Inject(MAT_DIALOG_DATA) public data: any,
              public dialogRef: MatDialogRef<CreateMissionFromSuggestionDialogComponent>,) {
      this.bothDirPossible = JSON.parse(JSON.stringify(data.bothDir));

      this.form = new FormGroup({
          name: new FormControl(data.name, Validators.required),
          color: new FormControl(data.color, Validators.required),
          flow: new FormControl(null,Validators.required),
          bothDir: new FormControl(data.bothDir, Validators.required)
      });

      if(!this.bothDirPossible){
        this.form.controls['bothDir'].disable();
      }
  }

    ColorLuminance(hex, lum) {
        // validate hex string
        hex = String(hex).replace(/[^0-9a-f]/gi, '');
        if (hex.length < 6) {
            hex = hex[0]+hex[0]+hex[1]+hex[1]+hex[2]+hex[2];
        }
        lum = lum || 0;

        // convert to decimal and change luminosity
        var rgb = "#", c, i;
        for (i = 0; i < 3; i++) {
            c = parseInt(hex.substr(i*2,2), 16);
            c = Math.round(Math.min(Math.max(0, c + (c * lum)), 255)).toString(16);
            rgb += ("00"+c).substr(c.length);
        }
        return rgb;
    }

    getRandomColor() {
        var letters = '0123456789ABCDEF';
        var color = '#';
        for (var i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        color = this.ColorLuminance (color, 0.1);
        return color;
    }

    changeColor(){
        this.form.controls['color'].setValue(this.getRandomColor());
    };

  save() {
      let newMission = {
          type: 'normal',
          name: this.form.controls['name'].value,
          flow: (this.form.controls['flow'].value!==null) ? this.form.controls['flow'].value : 0,
          color: this.form.controls['color'].value,
          missionErrors:{
              missingFlow: false,
              missingPath: false
          },
          bothDirections : this.form.controls['bothDir'].value,
          isLoaded: (this.form.controls['bothDir'].value ? null : true),
          additionalTime: 0
      };
      this.dialogRef.close(newMission);
  }

  cancel() {
      this.dialogRef.close();
  }

  ngOnInit(): void {
  }

}
