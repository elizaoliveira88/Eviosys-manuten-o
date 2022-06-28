import { Injectable } from '@angular/core';
import { MatSidenav } from '@angular/material/sidenav';

@Injectable()
export class SidenavService {
    private sidenav: MatSidenav;

    public setSidenav(sidenav: MatSidenav) {
        this.sidenav = sidenav;
    }

    public open() {
        if(!this.sidenav) return false;
        return this.sidenav.open();
    }


    public close() {
        if(!this.sidenav) return false;
        return this.sidenav.close();
    }

    public toggle(): void {
        if(!this.sidenav) return;
        this.sidenav.toggle();
   }
}
