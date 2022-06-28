import { Component } from '@angular/core';
import { MainMenuModel } from '@shared/models/MainMenu.model';
import {appRoutesNames} from "@app/app.routes.names";

@Component({
  selector: 'app-sub-global-management-menu',
  templateUrl: './sub-menu.component.html',
  styleUrls: ['./sub-menu.component.css']
})
export class SubMenuGlobalManagementComponent {

    subMenuName = appRoutesNames.GLOBAL_ADMINISTRATION;
    menu = this.mainMenuModel.menuMap[this.subMenuName].sections;

    constructor(public mainMenuModel: MainMenuModel) {
    }
}
