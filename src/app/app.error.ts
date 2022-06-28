import { ErrorHandler, Injectable } from '@angular/core';
import {HttpErrorResponse} from '@angular/common/http';
import { MasterDataProvider } from '@app/_shared/provider/MasterData.provider';
import { MasterDataStore } from '@app/_shared/provider/MasterData.store';
import { GatewayService } from '@services/gateway-service/gateway.service';
import { environment } from '@environments/environment';

@Injectable()
export class MyErrorHandler implements ErrorHandler {

    constructor(
        private masterData: MasterDataProvider,
        private masterDataStore: MasterDataStore,
        private gatewayService: GatewayService
    ) {
    }

    handleError(error) {
        if(environment.production != true) {
            if (error instanceof HttpErrorResponse) {
                console.error('There was an HTTP error.', error.message, 'Status code:', (<HttpErrorResponse>error).status);
            } else if (error instanceof TypeError) {
                console.error('There was a Type error.', error.message);
            } else if (error instanceof Error) {
                console.error('There was a general error.', error.message);
            } else {
                console.error('Nobody threw an error but something happened!', error);
            }
        }

        const chunkFailedMessage = /Loading chunk [\d]+ failed/;
        if (chunkFailedMessage.test(error.message)) {
            window.location.reload();
        }
    }
}
