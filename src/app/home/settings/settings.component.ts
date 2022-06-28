import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from "@angular/forms";
import {SettingsService} from "@app/home/settings/settings.service";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {User} from "@shared/models/User";
import {skip, Subject} from "rxjs";
import {take, takeUntil} from "rxjs/operators";
import {TranslateService} from "@ngx-translate/core";

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.css']
})
export class SettingsComponent implements OnInit, OnDestroy {
    private ngUnsubscribe = new Subject();
    storage = {
        allLanguages: [
            {name: 'English', key: 'en'},
            {name: 'Deutsch', key: 'de'},
            {name: 'Español', key: 'es'},
            {name: 'Italiano', key: 'it'},
            {name: 'Français', key: 'fr'},
            {name: 'Polski', key: 'pl'}
        ],
        userData: null,
        initialData: {},
        useragent: navigator.userAgent,
        editLogo: {
            initialValue: null,
            enabled: false
        }
    }
    parametersForm: FormGroup;
    vendorDataForm: FormGroup;

  constructor(private service: SettingsService,
              private masterDataStore: MasterDataStore,
              private translateService: TranslateService) {
  }

  ngOnInit(): void {
      this.masterDataStore.user_changed
          .pipe(
              takeUntil(this.ngUnsubscribe)
          )
          .subscribe(user=>{
              this.refreshData();
          });
     // this.refreshData();
  }

    ngOnDestroy() {
        this.ngUnsubscribe.next(true);
        this.ngUnsubscribe.complete();
    }

  refreshData() {
      this.storage.userData = User.jsonToUser(this.masterDataStore.userData);
      this.storage.initialData = JSON.parse(JSON.stringify(this.storage.userData));

      this.parametersForm = new FormGroup({
          currency: new FormControl(this.storage.userData.settings.currency, Validators.required),
          pricePowerKwh: new FormControl(this.storage.userData.settings.pricePowerKwh, Validators.required),
          priceDiesel: new FormControl(this.storage.userData.settings.priceDiesel, Validators.required),
          priceGas: new FormControl(this.storage.userData.settings.priceGas, Validators.required),
          overallCostFactor: new FormControl(this.storage.userData.settings.overallCostFactor, Validators.required),
          workingDays: new FormControl(this.storage.userData.settings.workingDays, Validators.required),
          maxSpeed: new FormControl(this.storage.userData.settings.maxSpeed, Validators.required)
      });
      this.parametersForm.disable();

      this.vendorDataForm = new FormGroup({
          companyName: new FormControl(this.storage.userData.companyName, Validators.required),
          email: new FormControl(this.storage.userData.email, Validators.required),
          firstName: new FormControl(this.storage.userData.firstName, Validators.required),
          lastName: new FormControl(this.storage.userData.lastName, Validators.required),
          address: new FormControl(this.storage.userData.address, Validators.required),
          mobile: new FormControl(this.storage.userData.mobile, Validators.required),
          tel: new FormControl(this.storage.userData.tel, Validators.required),
          fax: new FormControl(this.storage.userData.fax, Validators.required)
      });

      this.vendorDataForm.disable();
  }

    languageChanged() {
        this.service.patchUser(User.userToJson(this.storage.userData), this.storage.userData.id).then(res=>{
            if(res){
                this.masterDataStore.userData = User.jsonToUser(res);
                this.translateService.use(this.masterDataStore.userData.settings.language);
            }
        },err=>{

        });
    }

    userGuidanceChanged() {
        this.service.patchUser(User.userToJson(this.storage.userData), this.storage.userData.id).then(res=>{
            if(res){
                this.masterDataStore.userData = User.jsonToUser(res);
            }
        },err=>{

        });
    }



    cancelEdit(form: FormGroup) {
        form.setValue(this.storage.initialData);
        form.disable();
    }

    saveEditData(form: FormGroup) {
        this.service.patchUser(form.getRawValue(), this.storage.userData.id).then(res=>{
            if(res){
                this.cancelEdit(form);
                this.masterDataStore.userData = res;
            }
        },err=>{

        });
    }

    saveEditParams(form: FormGroup) {
        this.service.patchUser({settings: form.getRawValue()}, this.storage.userData.id).then(res=>{
            if(res){
                this.cancelEdit(form);
                this.masterDataStore.userData = res;
            }
        },err=>{

        });
    }

    startEdit(form: FormGroup) {
      this.storage.initialData = form.getRawValue();
      form.enable();
    }

    startEditLogo() {
      this.storage.editLogo.enabled = true;
      this.storage.editLogo.initialValue = JSON.parse(JSON.stringify(this.storage.userData.logo));
    }

    onFileSelected() {
        const inputNode: any = document.querySelector('#file');
        if (typeof (FileReader) !== 'undefined') {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                var res = e.target.result;
                const imageObj = new Image();
                imageObj.src = res;
                imageObj.onload = function (rs) {
                    var factor = ((rs.currentTarget['height'] > rs.currentTarget['width']) ? 200 : 200 / rs.currentTarget['width']);
                    if (factor > 1) {
                        factor = 1;
                    }
                    var canvas = document.createElement('canvas');
                    canvas.width = rs.currentTarget['width'] * factor;
                    canvas.height = rs.currentTarget['height'] * factor;
                    var context = canvas.getContext('2d');
                    context.drawImage(imageObj, 0, 0, rs.currentTarget['width'], rs.currentTarget['height'], 0, 0, rs.currentTarget['width'] * factor, rs.currentTarget['height'] * factor);
                    res = canvas.toDataURL('image/png');
                    this.storage.userData.logo = res;
                }.bind(this);
            };
            if(!inputNode.files) return;
            reader.readAsDataURL(inputNode.files[0]);
        }
    }


    cancelEditLogo() {
        this.storage.userData.logo = JSON.parse(JSON.stringify(this.storage.editLogo.initialValue));
        this.storage.editLogo.enabled = false;
        this.storage.editLogo.initialValue = null;
    }

    removeLogo() {
      this.storage.userData.logo = null;
    }

    saveEditLogo () {
        this.service.patchUser(User.userToJson(this.storage.userData), this.storage.userData.id).then(res=>{
            if(res){
                this.cancelEditLogo();
                this.masterDataStore.userData = User.jsonToUser(res);
            }
        },err=>{

        });
    }
}
