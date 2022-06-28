import {Component, OnInit, ViewChild} from '@angular/core';
import {FormBuilder, FormGroup, Validators} from "@angular/forms";
import {MatStepper} from "@angular/material/stepper";
import {FoldersService} from "@app/home/folders/folders.service";
import {MatDialog, MatDialogRef} from "@angular/material/dialog";

@Component({
    selector: 'app-add-project.dialog',
    templateUrl: './add-project.dialog.component.html',
    styleUrls: ['./add-project.dialog.component.scss']
})
export class AddProjectDialogComponent implements OnInit {
    firstFormGroup: FormGroup;
    secondFormGroup: FormGroup;
    thirdFormGroup: FormGroup;
    @ViewChild('stepper') private stepper: MatStepper;

    storage = {
        customerSearchTerm: '',
        allCustomers: [],
        customersList: [],
        allFolders: [{id: -2, name: 'Root'}, {id: -1, name: 'Add new folder'}],
        useShifts: false,
        saveAsNewCustomer: false,
        changeCustomer: false,
        customerSelected: null,
        customerChanged: false,
        editUserSelectedEnabled: false
    }

    constructor(private _formBuilder: FormBuilder,
                private service: FoldersService,
                private dialogRef: MatDialogRef<AddProjectDialogComponent>) {
        this.service.getCustomers().then(res => {
            if (res) {
                this.storage.allCustomers = res;
                this.storage.customersList = JSON.parse(JSON.stringify(this.storage.allCustomers));
            }
        }, err => {

        });
    }

    ngOnInit(): void {
        this.firstFormGroup = this._formBuilder.group({
            name: ['', Validators.required],
            externalId: [''],
            folder: [-2]
        });
        this.secondFormGroup = this._formBuilder.group({
            customerName: ['', Validators.required],
            distanceToCustomer: [''],
            address: ['', Validators.required],
            site: ['', Validators.required],
            tel: [''],
            fax: [''],
            logo: [''],
        });
        this.thirdFormGroup = this._formBuilder.group({
            observationTime: ['01:00', Validators.required],
        });

        this.secondFormGroup.valueChanges.subscribe(change => {
            if (this.storage.customerSelected) {
                this.storage.customerChanged = true;
            }
        });
    }

    search(value: string): void {
        this.storage.customersList = this.storage.allCustomers.filter((val) => {
            return val.customerData.customerName.toLowerCase().includes(value.toLowerCase())
                || val.customerData.address.toLowerCase().includes(value.toLowerCase())
                || val.customerData.site.toLowerCase().includes(value.toLowerCase());
        });
    }

    validateCurrentStep() {
        if (this.stepper) {
            let step = this.stepper.selectedIndex;
            if (step === 0) {
                return this.firstFormGroup.valid;
            } else if (step === 1) {
                return this.secondFormGroup.valid || this.secondFormGroup.disabled;
            } else if (step === 2) {
                return this.thirdFormGroup.valid;
            }
        }
    }

    validateAllStep() {
        return this.firstFormGroup.valid && (this.secondFormGroup.valid ||  this.secondFormGroup.disabled) && this.thirdFormGroup.valid;
    }

    changeThirdFormGroup() {
        if (this.storage.useShifts) {
            this.thirdFormGroup = this._formBuilder.group({});
        } else {
            this.thirdFormGroup = this._formBuilder.group({
                observationTime: ['01:00', Validators.required],
            });
        }
    }

    checkCheckboxes(changed: string) {
        if (changed === 'saveAsNewCustomer') {
            if (this.storage.saveAsNewCustomer) {
                this.storage.changeCustomer = false;
            }
        } else if (changed === 'changeCustomer') {
            if (this.storage.changeCustomer) {
                this.storage.saveAsNewCustomer = false;
            }
        }
    }

    next() {
        this.stepper.next();
    }

    cancel() {
        this.dialogRef.close();
    }

    close(customerId: any) {
        this.dialogRef.close({
            useShifts: this.storage.useShifts,
            info: this.firstFormGroup.getRawValue(),
            customer: this.secondFormGroup.getRawValue(),
            shifts: this.thirdFormGroup.getRawValue(),
            customerId: customerId
        })
    }

    save() {
        let val = this.secondFormGroup.getRawValue();
        if (this.storage.saveAsNewCustomer) {
            this.service.createCustomer({
                customerData: {
                    address: val.address,
                    customerName: val.customerName,
                    distanceToCustomer: val.distanceToCustomer,
                    fax: val.fax,
                    logo: val.logo,
                    site: val.site,
                    tel: val.tel
                }
            }).then(res => {
                if(res){
                    this.close(res[res.length-1].id);
                } else {
                    this.close(null);
                }

            }, err => {

            });
        } else if (this.storage.changeCustomer) {
            this.service.updateCustomer(this.storage.customerSelected.id, {
                customerData: {
                    address: val.address,
                    customerName: val.customerName,
                    distanceToCustomer: val.distanceToCustomer,
                    fax: val.fax,
                    logo: val.logo,
                    site: val.site,
                    tel: val.tel
                }
            }).then(res => {
                this.close(this.storage.customerSelected.id);
            }, err => {
            });
        } else {
            this.close(this.secondFormGroup.disabled ? this.storage.customerSelected.id : null);
        }
    }


    selectCustomer(customer: any) {
        let data = customer.customerData;
        this.secondFormGroup.patchValue({
            customerName: data.customerName,
            distanceToCustomer: data.distanceToCustomer,
            address: data.address,
            site: data.site,
            tel: data.tel,
            fax: data.fax
        });
        this.storage.customerSelected = customer;
        this.storage.changeCustomer = false;
        this.storage.saveAsNewCustomer = false;
        this.storage.customerChanged = false;
        this.secondFormGroup.disable();
    }

    enableEdit() {
        this.secondFormGroup.enable();
    }

}
