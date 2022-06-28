import { Settings } from '@shared/models/UserSettings';

export interface Project_DATA {
    id: number;
    name: string;
    creationDate: string;
    archive: boolean;
    processDurationAfterBreak: number;
    customerData: CustomerData_DATA;
    vendorData: VendorData_DATA;
    settings: Settings;
    itOptions: any;
    warehouseDesign: any;
    flowPlanResults: string;
    optimizations: any;
    lastOpenedDate: string;
    createdBy: string;
    externalId: string;
}

export interface CustomerData_DATA {
    id: number;
    customerName: string;
    site: string;
    contactPerson: string;
    address: string;
    tel: string;
    fax: string;
    mobile: string;
    email: string;
    distanceToCustomer: number;
}

export interface VendorData_DATA {
    id: number;
    name: string;
    address: string;
    tel: string;
    fax: string;
    firstName: string;
    email: string;
    lastName: string;
    mobile: string;
}

export interface Project_Simple_DATA {
    id: string;
    name: string;
    creationDate: string;
    lastOpenedDate: string;
    customerData: any;
    vendorData: any;
    externalId: string;
    createdBy: string;
}
