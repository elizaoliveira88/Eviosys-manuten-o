import { Injectable } from '@angular/core';
import { GatewayService } from '@services/gateway-service/gateway.service';
import {ShiftData} from "@app/project/shifts/shifts.component";

@Injectable({
    providedIn: 'root',
})
export class ShiftsService {

    constructor(public gatewayService: GatewayService) {}

    getShifts(id: string): Promise<any> {
        const url = '/projects/' + id + '/shiftInputs';
        return this.gatewayService.get({
            url: url,
        });
    }

    deleteShift(id: number): Promise<any> {
        const url = '/shiftInputs/' + id;
        return this.gatewayService.delete({
            url: url,
        });
    }

    patchShift(id: string, shift: ShiftData): Promise<any> {
        const url = '/shiftInputs/' + id;
        return this.gatewayService.patch({
            data: shift,
            url: url,
        });
    }

    addShifts(projectId: string, shift: ShiftData): Promise<any> {
        const url = '/projects/' + projectId + '/shiftInputs';
        return this.gatewayService.post({
            data: [shift],
            url: url,
        });
    }
}
