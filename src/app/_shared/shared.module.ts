import { CommonModule } from '@angular/common';
import { NgModule, ModuleWithProviders } from '@angular/core';
import { TranslateModule, TranslatePipe } from '@ngx-translate/core';
import { MaterialModule } from '@app/material.module';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { AccessControllService } from '@services/access-controll/access-controll.service';
import { GatewayService } from '@services/gateway-service/gateway.service';
import { ResizeService } from '@services/resize/resize.service';
import { PersistenceService } from '@services/database/persistence.service';
import { DateFormatPipe } from './pipes/date.pipe';
import { RemoveZeroPipe } from './pipes/remove-zero.pipe';
import { RemoveWhiteSpacesPipe } from './pipes/remove-spaces.pipe';
import { SAPDatePipe } from './pipes/sap-date.pipe';
import { LanguageNamePipe } from './pipes/language-name.pipe';
import { SafePipe } from './pipes/safe.pipe';
import { DisplayTimePipe } from './pipes/display-time.pipe';
import { YesNoPipe } from './pipes/yes-no.pipe';
import { DynamicPipe } from './pipes/dynamic.pipe';
import { ConfirmPopup } from '@shared/components/confirm-popup/confirm-popup.component';
import { DialogAbout } from '@shared/components/about-popup/about-popup.component';
import { ReleaseNotesPopup } from '@shared/components/release-notes-popup/release-notes-popup.component';
import { DragFileDirective } from '@shared/directive/drag-file';
import { DisplayOnMobiledDirective } from '@shared/directive/display-on-mobile.directive';
import { DisplayOnDesktopDirective } from '@shared/directive/display-on-desktop.directive';
import { PermissionLinkDirective } from '@shared/directive/permission-link.directive';
import { NoDataFoundDirective } from '@shared/directive/no-data-found.directive';
import { MatInputTimeDirective } from '@shared/directive/input-time.directive';
import { MatInputNumberDirective } from '@shared/directive/input-number.directive';
import { BottomSheetSelectionComponent } from '@shared/components/selection-bottom-sheet/selection-bottom-sheet.component';
import { PullToReloadService } from '@shared/components/pull-to-reload/pull-to-reload.service';
import { PullToReloadComponent } from '@shared/components/pull-to-reload/pull-to-reload.component';
import { FlexibleTableComponent } from '@shared/components/flexible-table/flexible-table.component';
import {NullReplacePipe} from '@shared/pipes/null-replace.pipe';
import {DisplayDatePipe} from '@shared/pipes/display-date.pipe';
import {DisplayDayPipe} from '@shared/pipes/display-day.pipe';
import {DisplayDateUTCPipe} from '@shared/pipes/display-date-utc.pipe';
import { ElementFocusDirective } from '@shared/directive/element-focus.directive';
import { SearchInputTableComponent } from './components/search-input-table/search-input-table.component';
import { MobileTopBarComponent } from './components/mobile-top-bar/mobile-top-bar.component';
import { VisualStatusBarComponent } from "@shared/components/visual-status-bar/visual-status-bar.component";
import {TextPopup} from "@shared/components/text-popup/text-popup.component";
import {DeviceImage} from "@shared/components/device-image/device-image.component";
import { CardTableSwitchComponent } from './components/card-table-switch/card-table-switch.component';
import { BtnComponent } from './components/btn/btn.component';
import { ComponentsExampleViewComponent } from './components/components-example-view/components-example-view.component';
import {MatBadgeModule} from "@angular/material/badge";
import { PromptDialogComponent } from './components/dialogs/prompt-dialog/prompt-dialog.component';
import { ConfirmDialogComponent } from './components/dialogs/confirm-dialog/confirm-dialog.component';
import { AlertDialogComponent } from './components/dialogs/alert-dialog/alert-dialog.component';
import {SearchFilterPipe} from "@shared/pipes/search.pipe";
import {OrderByPipe} from "@shared/pipes/orderBy.pipe";
import { NoInfoComponent } from './components/no-info/no-info.component';
import { SegmentsInitDialogComponent } from './components/dialogs/segments-dialog/segments-init-dialog.component';
import {SegmentsDialogComponent} from "@shared/components/dialogs/segments-init-dialog/segments-dialog.component";
import {UniquePipe} from "@shared/pipes/unique.pipe";
import {FilterPipe} from "@shared/pipes/filter.pipe";
import {AdditionalInfoPipe} from "@shared/pipes/additionalInfo.pipe";
import {MatStepperModule} from "@angular/material/stepper";
import {DisplayOnLargeDirective} from "@shared/directive/display-on-large.directive";
import {ThemeModule} from "@shared/theme/theme.module";
import {AutofocusDirective} from "@shared/directive/autofocus.directive";

@NgModule({
    declarations: [
        PullToReloadComponent,
        FlexibleTableComponent,
        VisualStatusBarComponent,
        DateFormatPipe,
        RemoveZeroPipe,
        RemoveWhiteSpacesPipe,
        SAPDatePipe,
        LanguageNamePipe,
        SafePipe,
        DisplayTimePipe,
        YesNoPipe,
        UniquePipe,
        FilterPipe,
        DynamicPipe,
        NullReplacePipe,
        DragFileDirective,
        DisplayOnMobiledDirective,
        DisplayOnDesktopDirective,
        DisplayOnLargeDirective,
        PermissionLinkDirective,
        NoDataFoundDirective,
        ConfirmPopup,
        TextPopup,
        BottomSheetSelectionComponent,
        MatInputTimeDirective,
        MatInputNumberDirective,
        ReleaseNotesPopup,
        DialogAbout,
        DisplayDatePipe,
        DisplayDayPipe,
        DisplayDateUTCPipe,
        AdditionalInfoPipe,
        ElementFocusDirective,
        AutofocusDirective,
        SearchInputTableComponent,
        MobileTopBarComponent,
        MobileTopBarComponent,
        DeviceImage,
        CardTableSwitchComponent,
        BtnComponent,
        ComponentsExampleViewComponent,
        PromptDialogComponent,
        ConfirmDialogComponent,
        AlertDialogComponent,
        SearchFilterPipe,
        OrderByPipe,
        NoInfoComponent,
        SegmentsDialogComponent,
        SegmentsInitDialogComponent
    ],
    exports: [
        ThemeModule,
        PullToReloadComponent,
        FlexibleTableComponent,
        VisualStatusBarComponent,
        DateFormatPipe,
        RemoveZeroPipe,
        RemoveWhiteSpacesPipe,
        SAPDatePipe,
        LanguageNamePipe,
        SafePipe,
        DisplayTimePipe,
        YesNoPipe,
        UniquePipe,
        FilterPipe,
        NullReplacePipe,
        DynamicPipe,
        DragFileDirective,
        DisplayOnMobiledDirective,
        DisplayOnDesktopDirective,
        DisplayOnLargeDirective,
        PermissionLinkDirective,
        NoDataFoundDirective,
        ConfirmPopup,
        TextPopup,
        BottomSheetSelectionComponent,
        MatInputTimeDirective,
        MatInputNumberDirective,
        ReleaseNotesPopup,
        DialogAbout,
        CommonModule,
        DisplayDatePipe,
        DisplayDayPipe,
        DisplayDateUTCPipe,
        AdditionalInfoPipe,
        ElementFocusDirective,
        AutofocusDirective,
        SearchInputTableComponent,
        MobileTopBarComponent,
        MobileTopBarComponent,
        DeviceImage,
        CardTableSwitchComponent,
        BtnComponent,
        MatBadgeModule,
        SearchFilterPipe,
        OrderByPipe,
        NoInfoComponent,
        MatStepperModule
    ],
    imports: [
        ThemeModule,
        TranslateModule,
        MaterialModule,
        CommonModule,
        FormsModule,
        MatBadgeModule,
        MatStepperModule
    ],
    providers: [] // must be empty because of forRoot !!!
})
export class SharedModule {
    static forRoot(): ModuleWithProviders<SharedModule> {
        return {
            ngModule: SharedModule,
            providers: [
                ThemeModule,
                AccessControllService,
                GatewayService,
                PersistenceService,
                ResizeService,
                PullToReloadService,
                DatePipe,
                RemoveZeroPipe,
                DisplayTimePipe,
                DisplayDatePipe,
                YesNoPipe,
                NullReplacePipe,
                TranslatePipe,
                OrderByPipe,
                SafePipe,
                CommonModule
            ]
        };
    }
}
