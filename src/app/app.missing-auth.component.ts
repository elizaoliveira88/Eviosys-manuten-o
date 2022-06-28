import { Component } from '@angular/core';

@Component({
    selector: 'missing-permission',
    template: '<div><h1>{{ "MISSING_PERMISSION" | translate }}</h1></div>'
})
export class MissingPermissionComponent {
    constructor() {}
};
