import { NgModule } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { FlexLayoutModule } from '@angular/flex-layout';
import { CdkTableModule } from '@angular/cdk/table';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { MatBottomSheetModule } from '@angular/material/bottom-sheet';
import { MatTreeModule } from '@angular/material/tree';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatButtonModule } from '@angular/material/button';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatCardModule } from '@angular/material/card';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatChipsModule } from '@angular/material/chips';
import { MatNativeDateModule, MatRippleModule } from '@angular/material/core';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatDialogModule } from '@angular/material/dialog';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatGridListModule } from '@angular/material/grid-list';
import { MatIconRegistry, MatIconModule } from '@angular/material/icon';
import { MatInputModule } from '@angular/material/input';
import { MatListModule } from '@angular/material/list';
import { MatMenuModule } from '@angular/material/menu';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSliderModule } from '@angular/material/slider';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSortModule } from '@angular/material/sort';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatMomentDateModule } from '@angular/material-moment-adapter'
import { A11yModule } from '@angular/cdk/a11y';
import { DragDropModule } from '@angular/cdk/drag-drop';

import { DateAdapter, MAT_DATE_FORMATS } from '@angular/material/core';

const modules = [
    A11yModule,
    DragDropModule,
    CdkTableModule,
    MatAutocompleteModule,
    MatButtonModule,
    MatButtonToggleModule,
    MatCardModule,
    MatCheckboxModule,
    MatChipsModule,
    MatStepperModule,
    MatDatepickerModule,
    MatDialogModule,
    MatExpansionModule,
    MatGridListModule,
    MatIconModule,
    MatInputModule,
    MatListModule,
    MatMenuModule,
    MatNativeDateModule,
    MatPaginatorModule,
    MatProgressBarModule,
    MatProgressSpinnerModule,
    MatRadioModule,
    MatRippleModule,
    MatSelectModule,
    MatSidenavModule,
    MatSliderModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatSortModule,
    MatTableModule,
    MatTabsModule,
    MatToolbarModule,
    MatTooltipModule,
    FlexLayoutModule,
    ReactiveFormsModule,
    MatBottomSheetModule,
    MatTreeModule,
    MatMomentDateModule
];

@NgModule({
    imports: modules,
    exports: modules
})
export class MaterialModule {
    constructor(matIconRegistry: MatIconRegistry, domSanitizer: DomSanitizer){
        matIconRegistry.addSvgIcon("LMH_Logo", domSanitizer.bypassSecurityTrustResourceUrl("./assets/icons/Linde_MH_Logo_RGB.svg"));
        matIconRegistry.addSvgIconSet(domSanitizer.bypassSecurityTrustResourceUrl('./assets/icons/icons.svg')); // linde icons
        matIconRegistry.registerFontClassAlias('sap-icons');
        matIconRegistry.registerFontClassAlias('LMH');
        //external icons
        matIconRegistry.addSvgIcon("contract", domSanitizer.bypassSecurityTrustResourceUrl("./assets/icons//external/contract_external_icon.svg"));

        matIconRegistry.addSvgIcon("FLAG_DE", domSanitizer.bypassSecurityTrustResourceUrl("./assets/icons/flags/de.svg"));
        matIconRegistry.addSvgIcon("FLAG_LONGTEXT", domSanitizer.bypassSecurityTrustResourceUrl("./assets/icons/flags/de.svg"));
        matIconRegistry.addSvgIcon("FLAG_EN", domSanitizer.bypassSecurityTrustResourceUrl("./assets/icons/flags/gb.svg"));
        matIconRegistry.addSvgIcon("FLAG_ES", domSanitizer.bypassSecurityTrustResourceUrl("./assets/icons/flags/es.svg"));
        matIconRegistry.addSvgIcon("FLAG_FR", domSanitizer.bypassSecurityTrustResourceUrl("./assets/icons/flags/fr.svg"));
        matIconRegistry.addSvgIcon("FLAG_HU", domSanitizer.bypassSecurityTrustResourceUrl("./assets/icons/flags/hu.svg"));
        matIconRegistry.addSvgIcon("FLAG_IT", domSanitizer.bypassSecurityTrustResourceUrl("./assets/icons/flags/it.svg"));
        matIconRegistry.addSvgIcon("FLAG_PL", domSanitizer.bypassSecurityTrustResourceUrl("./assets/icons/flags/pl.svg"));
        matIconRegistry.addSvgIcon("FLAG_PT", domSanitizer.bypassSecurityTrustResourceUrl("./assets/icons/flags/pt.svg"));
        matIconRegistry.addSvgIcon("FLAG_SV", domSanitizer.bypassSecurityTrustResourceUrl("./assets/icons/flags/sv.svg"));
    }
}
