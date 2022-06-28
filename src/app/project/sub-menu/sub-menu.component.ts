import { Component } from '@angular/core';
import { MainMenuModel } from "@shared/models/MainMenu.model";
import {appRoutesNames} from "@app/app.routes.names";
import {MasterDataStore} from "@shared/provider/MasterData.store";
import {RouterLink} from "@angular/router";

@Component({
  selector: 'app-sub-menu',
  templateUrl: './sub-menu.component.html',
  styleUrls: ['./sub-menu.component.css']
})
export class SubMenuComponent{
    menu = this.mainMenuModel.menuMap[appRoutesNames.PROJECTS].sections;
    selectedProjectId = null;

    constructor(public mainMenuModel: MainMenuModel,
                private masterDataStore: MasterDataStore) {
        this.selectedProjectId = masterDataStore.selectedProjectId;
    }

    getRouterLink(item) {
        this.selectedProjectId = this.masterDataStore.selectedProjectId;
        if(item.link.indexOf('projects')>-1){
            if(this.selectedProjectId===null || this.selectedProjectId===''){
                return this.menu[0].link;
            }
            const temp = item.link.split('/:id/');
            return [temp[0], this.selectedProjectId, temp[1]];
        } else return item.link;
    }
}
