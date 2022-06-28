import {Component, Input, OnInit} from '@angular/core';
import {SidenavService} from "@services/sidenav/sidenav.service";
import {MainMenuModel} from "@shared/models/MainMenu.model";
import {Router} from "@angular/router";

@Component({
  selector: 'mobile-top-bar',
  templateUrl: './mobile-top-bar.component.html',
  styleUrls: ['./mobile-top-bar.component.css']
})
export class MobileTopBarComponent implements OnInit {

  @Input() menu;
  routeSubscribe;
  titleMobile;
  constructor(
      private sidenav: SidenavService,
      private router: Router,
      public mainMenuModel: MainMenuModel) {
      this.routeSubscribe = router.events.subscribe(() => {
          this.setTitleTopBar();
      });
  }

    ngOnInit(){
        this.setTitleTopBar();
    }

    toggleSidenav() {
        this.sidenav.toggle();
    }

    setTitleTopBar() {
      if (this.menu) {
          for (let x = 0; x < this.menu.length; x++) {
              if (this.router.url === this.menu[x].link){
                  this.titleMobile = this.menu[x].name;
              }
          }
      }
    }

}
