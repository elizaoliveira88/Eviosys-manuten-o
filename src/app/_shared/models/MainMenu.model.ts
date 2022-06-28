import { AccessControllService } from '@services/access-controll/access-controll.service';
import { Injectable } from '@angular/core';
import {MasterDataStore} from "@shared/provider/MasterData.store";

@Injectable({
    providedIn: 'root',
})
export class MainMenuModel {

    public menuItems = [];
    public clusteredMenuItems = [];
    public menuMap = {};

    selectedProjectId: string = null;

    constructor(acs: AccessControllService) {

        this.menuItems = [{
            name: 'HOME.WELCOME.TITLE',
            link: "/fp/home/welcome",
            right: "/welcome",
            subMenu: false,
            badge:-1,
            icon: 'home',
            realm: 'HOME',
            showMobile: true
        },{
            name: 'HOME.MANUTENCAO_DE_FERRAMENTAS.TITLE',
            link: "/fp/home/manutencao-de-ferramentas",
            right: "/manutencao-de-ferramentas",
            subMenu: false,
            badge:-1,
            icon: 'assignment',
            realm: 'HOME',
            showMobile: true
        },{
            name: 'HOME.ELEMENTS.TITLE',
            link: "/fp/home/folders",
            right: "/folders",
            subMenu: false,
            badge:-1,
            icon: 'assignment',
            realm: 'HOME',
            showMobile: true
        },{
            name: 'HOME.MANUTENCOES.TITLE',
            link: "/fp/home/folders",
            right: "/folders",
            subMenu: false,
            badge:-1,
            icon: 'assignment',
            realm: 'HOME',
            showMobile: true
        },{
            name: 'HOME.SETTINGS.TITLE',
            link: "/fp/home/settings",
            right: "/settings",
            subMenu: false,
            badge:-1,
            icon: 'settings',
            realm: 'HOME',
            showMobile: true
        },{
            name: 'GLOBAL_ADMINISTRATION.USERS.TITLE',
            link: "/fp/global-administration/users",
            right: "/users",
            subMenu: false,
            badge:-1,
            icon: null,
            realm: 'GLOBAL_ADMINISTRATION',
            showMobile: true
        },{
            name: 'GLOBAL_ADMINISTRATION.TOOLS.TITLE',
            link: "/fp/global-administration/templates",
            right: "/templates",
            subMenu: false,
            badge:-1,
            icon: null,
            realm: 'GLOBAL_ADMINISTRATION',
            showMobile: true
        },{
            name: 'GLOBAL_ADMINISTRATION.ELEMENTS.TITLE',
            link: "/fp/global-administration/truck-data",
            right: "/truck-data",
            subMenu: false,
            badge:-1,
            icon: null,
            realm: 'GLOBAL_ADMINISTRATION',
            showMobile: true
        }];

        const tmp = {};
        const menuItems = [];
        this.menuItems.forEach(element => {
            menuItems.push(element);
            const link = element.link.split('/');
            const basePath = link[2];
            if (!tmp.hasOwnProperty(basePath)) {
                tmp[basePath] = {
                    name: basePath,
                    rights: [],
                    sections: [],
                    translationKey: element.name.split('.')[0] + ".TITLE",
                    link: '/' + link[1] + '/' + basePath,
                };
            }
            tmp[basePath].rights.push(element.right);
            tmp[basePath].sections.push(element);
        });
        this.menuItems = menuItems;
        this.menuMap = tmp;
        this.clusteredMenuItems = Object.values(tmp);
    }

}
