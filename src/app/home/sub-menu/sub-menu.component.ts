import { Component } from '@angular/core';
import { MainMenuModel } from "@shared/models/MainMenu.model";
import {appRoutesNames} from "@app/app.routes.names";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-sub-home-menu',
  templateUrl: './sub-menu.component.html',
  styleUrls: ['./sub-menu.component.css']
})
export class SubMenuHomeComponent{
    menu = this.mainMenuModel.menuMap[appRoutesNames.HOME].sections;
    selectedProjectId = null;

    constructor(public mainMenuModel: MainMenuModel) {
    }
}
