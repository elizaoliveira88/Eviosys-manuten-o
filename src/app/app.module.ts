import { BrowserModule } from '@angular/platform-browser';
import { NgModule, ErrorHandler, APP_INITIALIZER } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { HttpClientModule, HttpClient, HTTP_INTERCEPTORS } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { ToastrModule } from 'ngx-toastr';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateLoader, MissingTranslationHandler, MissingTranslationHandlerParams } from '@ngx-translate/core';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { SharedModule } from '@shared/shared.module';
import { environment, ENVIRONMENT_SPECIFIC_PROVIDERS } from '@environments/environment';
import { AppRoutingModule } from '@app/app.routes.module';
import { AppComponent } from '@app/app.component';
import { AppBootComponent } from '@app/app.boot.component';
import { MyErrorHandler } from '@app/app.error';
import { MaterialModule } from '@app/material.module';
import { NgxMaterialTimepickerModule } from 'ngx-material-timepicker';
import { GatewayService } from '@services/gateway-service/gateway.service';
import { LoaderComponent } from '@interceptor/loader/loader/loader.component';
import { MasterDataProvider } from '@shared/provider/MasterData.provider';
import { MasterDataStore } from '@shared/provider/MasterData.store';
import { FormsModule } from '@angular/forms';
import { SidenavService } from '@shared/services/sidenav/sidenav.service';
import { TamInterceptor } from '@interceptor/tam/tam.interceptor';
import { LoaderInterceptor } from '@interceptor/loader/loader.interceptor';
import { KIMHeaderMessagesInterceptor } from '@interceptor/kim-messages/kim-messages.interceptor';
import { CancelGetRequestsOnRouterChangeInterceptor } from '@interceptor/cancel-requests/cancel-requests.interceptor';
import { AuthGuard } from '@shared/guards/Auth.guard';
import { MissingPermissionComponent } from './app.missing-auth.component';

import { registerLocaleData } from '@angular/common';
import localeDe from '@angular/common/locales/de';
import localeEs from '@angular/common/locales/es';
import localeFr from '@angular/common/locales/fr';
import localeHu from '@angular/common/locales/hu';
import localeIt from '@angular/common/locales/it';
import localePl from '@angular/common/locales/pl';
import localePt from '@angular/common/locales/pt';
import localeSv from '@angular/common/locales/sv';

registerLocaleData(localeDe);
registerLocaleData(localeEs);
registerLocaleData(localeFr);
registerLocaleData(localeHu);
registerLocaleData(localeIt);
registerLocaleData(localePl);
registerLocaleData(localePt);
registerLocaleData(localeSv);

/* handle missing translations on DEV */
import missingTranslations from '../assets/i18n/missingTranslations.json';
import {LoginGuard} from "@shared/guards/Login.guard";
import {ProjectGuard} from "@shared/guards/Project.guard";
import {TreeModule} from "@circlon/angular-tree-component";
import {ThemeModule} from "@shared/theme/theme.module";

export class MyMissingTranslationHandler implements MissingTranslationHandler {
    handle(params: MissingTranslationHandlerParams) {
        return missingTranslations.alternativeTranslationJson.hasOwnProperty(params.key) ? missingTranslations.alternativeTranslationJson[params.key] : params.key;
    }
}
/* handle missing translations on DEV END*/

export function masterDataProviderFactory(provider: MasterDataProvider) {
    console.log('loading app ' + provider.getVersion());
    return () => provider.load();
}

@NgModule({
    declarations: [
        AppComponent,
        AppBootComponent,
        MissingPermissionComponent,
        LoaderComponent
    ],
    imports: [
        NgxMaterialTimepickerModule,
        BrowserModule.withServerTransition({ appId: 'C_FP' }),
        BrowserAnimationsModule,
        MaterialModule,
        AppRoutingModule,
        HttpClientModule,
        RouterModule,
        TreeModule,
        TranslateModule.forRoot({
            missingTranslationHandler: {
                provide: MissingTranslationHandler,
                useClass: MyMissingTranslationHandler
            },
            loader: {
                provide: TranslateLoader,
                useFactory: function (http: HttpClient) {
                    return new TranslateHttpLoader(http, './assets/i18n/', '.json');
                    /*return new MultiTranslateHttpLoader(http, [
                        {prefix: "./assets/i18n/", suffix: ".json"}
                    ])*/
                },
                deps: [HttpClient]
            }
        }),
        SharedModule.forRoot(),
        ToastrModule.forRoot(),
        ThemeModule.forRoot(),
        FormsModule
    ],
    providers: [
        AuthGuard,
        LoginGuard,
        ProjectGuard,
        GatewayService,
        MasterDataProvider,
        SidenavService,
        { provide: APP_BASE_HREF, useValue: '/' },
        { provide: ErrorHandler, useClass: MyErrorHandler},
        { provide: APP_INITIALIZER, useFactory: masterDataProviderFactory, deps: [MasterDataProvider], multi: true },
        { provide: HTTP_INTERCEPTORS, useClass: KIMHeaderMessagesInterceptor, multi: true }, // kim-messages in header for gateway messages
        { provide: HTTP_INTERCEPTORS, useClass: TamInterceptor, multi: true }, // tam refresh formbased
        { provide: HTTP_INTERCEPTORS, useClass: LoaderInterceptor, multi: true }, // spinner
       /* { provide: HTTP_INTERCEPTORS, useClass: CancelGetRequestsOnRouterChangeInterceptor, multi: true },*/ // cancel get requests against the api on router change event (kill long gets without a target)
        ENVIRONMENT_SPECIFIC_PROVIDERS
    ],
    bootstrap: [AppBootComponent]
})

export class AppModule {}
