import { Component, OnInit } from '@angular/core';
import { MasterDataStore } from '@shared/provider/MasterData.store';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { InfoService } from './info.service';

@Component({
    selector: 'app-info',
    templateUrl: './info.component.html',
    styleUrls: ['./info.component.css'],
})
export class InfoComponent implements OnInit {
    storage = {
        infoData: null,
        initialData: {},
        editLogoCostumer: {
            initialValue: null,
            enabled: false,
        },
        editLogoVendor: {
            initialValue: null,
            enabled: false,
        },
    };
    customerData: FormGroup;
    vendorData: FormGroup;
    settingsData: FormGroup;

    constructor(
        private masterDataStore: MasterDataStore,
        private translateService: TranslateService,
        private service: InfoService,
    ) {}

    ngOnInit(): void {
        this.refreshData();
    }

    refreshData() {
        this.customerData = new FormGroup({
            name: new FormControl('', Validators.required),
            projectId: new FormControl('', Validators.required),
            customerName: new FormControl('', Validators.required),
            site: new FormControl('', Validators.required),
            contactPerson: new FormControl(''),
            address: new FormControl('', Validators.required),
            tel: new FormControl('', Validators.required),
            fax: new FormControl('', Validators.required),
            mobile: new FormControl(''),
            email: new FormControl(''),
            distanceToCustomer: new FormControl('', Validators.required),
            logo: new FormControl(''),
        });
        this.customerData.disable();

        this.vendorData = new FormGroup({
            name: new FormControl('', Validators.required),
            logo: new FormControl(''),
            address: new FormControl('', Validators.required),
            tel: new FormControl('', Validators.required),
            email: new FormControl(''),
            firstName: new FormControl('', Validators.required),
            lastName: new FormControl('', Validators.required),
            mobile: new FormControl(''),
            fax: new FormControl('', Validators.required),
        });
        this.vendorData.disable();

        this.settingsData = new FormGroup({
            currency: new FormControl('', Validators.required),
            pricePowerKwh: new FormControl('', Validators.required),
            priceDiesel: new FormControl('', Validators.required),
            priceGas: new FormControl('', Validators.required),
            overallCostFactor: new FormControl('', Validators.required),
            workingDays: new FormControl('', Validators.required),
            maxSpeed: new FormControl('', Validators.required),
        });
        this.settingsData.disable();

        this.service.getInfo(this.masterDataStore.selectedProjectId).then(
            res => {
                if (res) {
                    this.storage.infoData = res;
                    this.storage.initialData = res;
                    //CUSTOMER DATA
                    this.customerData.get('name').setValue(this.storage.infoData.name);
                    this.customerData
                        .get('customerName')
                        .setValue(this.storage.infoData.customerData.customerName);
                    this.customerData.get('site').setValue(this.storage.infoData.customerData.site);
                    this.customerData
                        .get('address')
                        .setValue(this.storage.infoData.customerData.address);
                    this.customerData.get('tel').setValue(this.storage.infoData.customerData.tel);
                    this.customerData.get('fax').setValue(this.storage.infoData.customerData.fax);
                    this.customerData.get('logo').setValue(this.storage.infoData.customerData.logo);
                    //VENDOR DATA
                    this.vendorData.get('name').setValue(this.storage.infoData.vendorData.name);
                    this.vendorData
                        .get('firstName')
                        .setValue(this.storage.infoData.vendorData.firstName);
                    this.vendorData
                        .get('lastName')
                        .setValue(this.storage.infoData.vendorData.lastName);
                    this.vendorData
                        .get('address')
                        .setValue(this.storage.infoData.vendorData.address);
                    this.vendorData.get('tel').setValue(this.storage.infoData.vendorData.tel);
                    this.vendorData.get('fax').setValue(this.storage.infoData.vendorData.fax);
                    this.vendorData.get('logo').setValue(this.storage.infoData.vendorData.logo);
                    //SETTINGS DATA
                    this.settingsData
                        .get('currency')
                        .setValue(this.storage.infoData.settings.currency);
                    this.settingsData
                        .get('pricePowerKwh')
                        .setValue(this.storage.infoData.settings.pricePowerKwh);
                    this.settingsData
                        .get('priceDiesel')
                        .setValue(this.storage.infoData.settings.priceDiesel);
                    this.settingsData
                        .get('priceGas')
                        .setValue(this.storage.infoData.settings.priceGas);
                    this.settingsData
                        .get('overallCostFactor')
                        .setValue(this.storage.infoData.settings.overallCostFactor);
                    this.settingsData
                        .get('workingDays')
                        .setValue(this.storage.infoData.settings.workingDays);
                    this.settingsData
                        .get('maxSpeed')
                        .setValue(this.storage.infoData.settings.maxSpeed);
                }
            },
            err => {},
        );
    }

    cancelEdit(form: FormGroup) {
        form.setValue(this.storage.initialData);
        form.disable();
    }

    saveEditData(form: FormGroup, dataToEdit) {
        switch (dataToEdit) {
            case 'customer': {
                this.service
                    .patchProject({ customerData: form.getRawValue() }, this.storage.infoData.id)
                    .then(
                        res => {
                            if (res) {
                                form.disable();
                            }
                        },
                        err => {},
                    );
                break;
            }
            case 'vendor': {
                this.service
                    .patchProject({ vendorData: form.getRawValue() }, this.storage.infoData.id)
                    .then(
                        res => {
                            if (res) {
                                form.disable();
                            }
                        },
                        err => {},
                    );
                break;
            }
            case 'settings': {
                this.service
                    .patchProject({ settings: form.getRawValue() }, this.storage.infoData.id)
                    .then(
                        res => {
                            if (res) {
                                form.disable();
                            }
                        },
                        err => {},
                    );
                break;
            }
        }
    }

    startEdit(form: FormGroup) {
        this.storage.initialData = form.getRawValue();
        form.enable();
    }

    startEditLogo(form) {
        switch (form) {
            case 'customer': {
                this.storage.editLogoCostumer.enabled = true;
                this.storage.editLogoCostumer.initialValue = JSON.parse(
                    JSON.stringify(this.storage.infoData.customerData.logo),
                );
                break;
            }
            case 'vendor': {
                this.storage.editLogoVendor.enabled = true;
                this.storage.editLogoVendor.initialValue = JSON.parse(
                    JSON.stringify(this.storage.infoData.vendorData.logo),
                );
                break;
            }
        }
    }

    onFileSelected(form) {
        const inputNode: any = document.querySelector('#file');
        if (typeof FileReader !== 'undefined') {
            const reader = new FileReader();
            reader.onload = (e: any) => {
                let res = e.target.result;
                const imageObj = new Image();
                imageObj.src = res;
                imageObj.onload = function (rs) {
                    let factor =
                        rs.currentTarget['height'] > rs.currentTarget['width']
                            ? 200
                            : 200 / rs.currentTarget['width'];
                    if (factor > 1) {
                        factor = 1;
                    }
                    const canvas = document.createElement('canvas');
                    canvas.width = rs.currentTarget['width'] * factor;
                    canvas.height = rs.currentTarget['height'] * factor;
                    const context = canvas.getContext('2d');
                    context.drawImage(
                        imageObj,
                        0,
                        0,
                        rs.currentTarget['width'],
                        rs.currentTarget['height'],
                        0,
                        0,
                        rs.currentTarget['width'] * factor,
                        rs.currentTarget['height'] * factor,
                    );
                    res = canvas.toDataURL('image/png');
                    switch (form) {
                        case 'customer': {
                            this.storage.infoData.customerData.logo = res;
                            break;
                        }
                        case 'vendor': {
                            this.storage.infoData.vendorData.logo = res;
                            break;
                        }
                    }
                }.bind(this);
            };
            if (!inputNode.files) return;
            reader.readAsDataURL(inputNode.files[0]);
        }
    }

    cancelEditLogo(form) {
        switch (form) {
            case 'customer': {
                this.storage.infoData.customerData.logo = JSON.parse(
                    JSON.stringify(this.storage.editLogoCostumer.initialValue),
                );
                this.storage.editLogoCostumer.enabled = false;
                this.storage.editLogoCostumer.initialValue = null;
                break;
            }
            case 'vendor': {
                this.storage.infoData.vendorData.logo = JSON.parse(
                    JSON.stringify(this.storage.editLogoVendor.initialValue),
                );
                this.storage.editLogoVendor.enabled = false;
                this.storage.editLogoVendor.initialValue = null;
                break;
            }
        }
    }

    removeLogo(form) {
        switch (form) {
            case 'customer': {
                this.storage.infoData.customerData.logo = null;
                break;
            }
            case 'vendor': {
                this.storage.infoData.vendorData.logo = null;
                break;
            }
        }
    }

    saveEditLogo(form) {
        switch (form) {
            case 'customer': {
                this.service
                    .patchProject(
                        { customerData: this.storage.infoData.customerData },
                        this.storage.infoData.id,
                    )
                    .then(
                        res => {
                            if (res) {
                                this.storage.editLogoCostumer.initialValue =
                                    this.storage.infoData.customerData.logo;
                                this.cancelEditLogo(form);
                            }
                        },
                        err => {},
                    );
                break;
            }
            case 'vendor': {
                this.service
                    .patchProject(
                        { vendorData: this.storage.infoData.vendorData },
                        this.storage.infoData.id,
                    )
                    .then(
                        res => {
                            if (res) {
                                this.storage.editLogoVendor.initialValue =
                                    this.storage.infoData.vendorData.logo;
                                this.cancelEditLogo(form);
                            }
                        },
                        err => {},
                    );
                break;
            }
        }
    }
}
