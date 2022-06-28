import {NgModule} from '@angular/core';
import {CommonModule, DatePipe} from '@angular/common';
import {Router, RouterModule} from '@angular/router';
import {MaterialModule} from '@app/material.module';
import {TranslateModule} from '@ngx-translate/core';
import {FormsModule} from '@angular/forms';
import {SharedModule} from '@shared/shared.module';
import {ProjectComponent} from '@app/project/project.component';
import {SubMenuComponent} from './sub-menu/sub-menu.component';
import {LeafletModule} from '@asymmetrik/ngx-leaflet';
import {LeafletDrawModule} from '@asymmetrik/ngx-leaflet-draw';
import { InfoComponent } from './info/info.component';
import { ShiftsComponent } from './shifts/shifts.component';
import { TrucksComponent } from './trucks/trucks.component';
import { LayoutComponent } from './layout/layout.component';
import { ApplicationsComponent } from './applications/applications.component';
import { OptimizationsComponent } from './optimizations/optimizations.component';
import { FlowplanResultsComponent } from './flowplan-results/flowplan-results.component';
import { PricingComponent } from './pricing/pricing.component';
import { ProjectGuard } from "@shared/guards/Project.guard";
import { routeNamesProject } from "@app/project/project.routes.names";
import { ApplicationDetailsComponent } from './application-details/application-details.component';
import {
    AddTruckDialogComponent
} from "@app/project/application-details/dialogs/add-truck.dialog/add-truck.dialog.component";
import {
    CommentsDialogComponent
} from "@app/project/application-details/dialogs/comments.dialog/comments.dialog.component";
import {
    SelectSdTypeDialogComponent
} from './layout/dialogs/select-sd-type.dialog/select-sd-type.dialog.component';
import {
    CreateMissionFromSuggestionDialogComponent
} from './layout/dialogs/create-mission-from-suggestion.dialog/create-mission-from-suggestion.dialog.component';
import {
    AddElementToMissionDialogComponent
} from "@app/project/layout/dialogs/add-element-to-mission.dialog/add-element-to-mission.dialog.component";
import {
    CreateTuggerTrainMissionDialogComponent
} from "@app/project/layout/dialogs/create-tugger-train-mission.dialog/create-tugger-train-mission.dialog.component";
import {
    CreateTuggerMissionFromSuggestionDialogComponent
} from "@app/project/layout/dialogs/create-tugger-mission-from-suggestion.dialog/create-tugger-mission-from-suggestion.dialog.component";
import {
    CreateVnaMissionDialogComponent
} from "@app/project/layout/dialogs/create-vna-mission.dialog/create-vna-mission.dialog.component";
import {
    CreateMissionsFromMultipleElementsDialogComponent
} from "@app/project/layout/dialogs/create-missions-from-multiple-elements.dialog/create-missions-from-multiple-elements.dialog.component";
import {NgChartsModule} from "ng2-charts";
import {
    ConfigureTruckDialogComponent
} from './pricing/dialogs/configure-truck.dialog/configure-truck.dialog.component';
import {
    StandardConfigDialogComponent
} from './pricing/dialogs/standard-config.dialog/standard-config.dialog.component';
import {
    AddOptimizationDialogComponent
} from './optimizations/dialogs/add-optimization.dialog/add-optimization.dialog.component';
import { OptimizationDetailsComponent } from './optimization-details/optimization-details.component';
import {
    AddGroupDialogComponent
} from "@app/project/optimization-details/dialogs/add-group.dialog/add-group.dialog.component";
import {
    GroupNetworkDialogComponent
} from "@app/project/optimization-details/dialogs/group-network.dialog/group-network.dialog.component";
import {
    AddApplicationDialogComponent
} from "@app/project/applications/dialogs/add-application.dialog/add-application.dialog.component";
import {
    ProjectTruckDetailsDialogComponent
} from "@app/project/trucks/dialogs/project-truck-details.dialog/project-truck-details.dialog.component";
import { RoiChartComponent } from './application-details/roi-chart/roi-chart.component';
import { TrucksChartComponent } from './application-details/trucks-chart/trucks-chart.component';
import {
    TruckInfoDialogComponent
} from "@app/project/application-details/dialogs/truck-info.dialog/truck-info.dialog.component";

@NgModule({
    declarations: [
        ProjectComponent,
        SubMenuComponent,
        InfoComponent,
        ShiftsComponent,
        TrucksComponent,
        LayoutComponent,
        ApplicationsComponent,
        OptimizationsComponent,
        FlowplanResultsComponent,
        PricingComponent,
        ApplicationDetailsComponent,
        AddTruckDialogComponent,
        CommentsDialogComponent,
        SelectSdTypeDialogComponent,
        CreateMissionFromSuggestionDialogComponent,
        AddElementToMissionDialogComponent,
        CreateTuggerTrainMissionDialogComponent,
        CreateTuggerMissionFromSuggestionDialogComponent,
        CreateVnaMissionDialogComponent,
        CreateMissionsFromMultipleElementsDialogComponent,
        ConfigureTruckDialogComponent,
        StandardConfigDialogComponent,
        AddOptimizationDialogComponent,
        OptimizationDetailsComponent,
        AddGroupDialogComponent,
        GroupNetworkDialogComponent,
        AddApplicationDialogComponent,
        ProjectTruckDetailsDialogComponent,
        TruckInfoDialogComponent,
        RoiChartComponent,
        TrucksChartComponent
    ],
    imports: [
        TranslateModule,
        FormsModule,
        CommonModule,
        SharedModule,
        MaterialModule,
        LeafletModule,
        LeafletDrawModule,
        NgChartsModule,
        RouterModule.forChild([{
            path: '',
            component: SubMenuComponent,
            outlet: 'mainSubmenu'
        }, {
            path: '',
            pathMatch: 'full',
            redirectTo: routeNamesProject.INFO
        }, {
            path: routeNamesProject.INFO,
            canActivate: [ProjectGuard],
            component: InfoComponent
        }, {
            path: routeNamesProject.SHIFTS,
            component: ShiftsComponent
        }, {
            path: routeNamesProject.TRUCKS,
            component: TrucksComponent
        }, {
            path: routeNamesProject.LAYOUT,
            component: LayoutComponent
        }, {
            path: routeNamesProject.APPLICATIONS,
            component: ApplicationsComponent
        }, {
            path: routeNamesProject.APPLICATIONS + '/:id',
            component: ApplicationDetailsComponent
        }, {
            path: routeNamesProject.OPTIMIZATIONS,
            component: OptimizationsComponent
        }, {
            path: routeNamesProject.OPTIMIZATIONS + '/:id',
            component: OptimizationDetailsComponent
        }, {
            path: routeNamesProject.FLOWPLANRESULTS,
            component: FlowplanResultsComponent
        }, {
            path: routeNamesProject.PRICING,
            component: PricingComponent
        },
        ])
    ],
    providers: [
        DatePipe
    ]
})
export class ProjectModule {
    public constructor(
        private router: Router
    ) {
    }
}
