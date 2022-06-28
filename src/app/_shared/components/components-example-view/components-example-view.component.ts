import { Component, OnInit } from '@angular/core';
import {MatTableDataSource} from "@angular/material/table";
import {MatChipInputEvent} from "@angular/material/chips";
import {COMMA, ENTER} from "@angular/cdk/keycodes";
import {ThemeService} from "@shared/theme/services/theme.service";
import {listOfThemes} from "@shared/theme/models/themes";

@Component({
  selector: 'app-components-example-view',
  templateUrl: './components-example-view.component.html',
  styleUrls: ['./components-example-view.component.css']
})
export class ComponentsExampleViewComponent implements OnInit {
    dataSource = new MatTableDataSource([]);
    tableDefinition = [
        {key: 'deviceImage', label: 'Col 1'},
        {key: 'deviceName', label: 'Col 2'},
        {key: 'deviceType', label: 'Test Col'}
    ];
    fruits: any[] = [{name: 'Lemon'}, {name: 'Lime'}, {name: 'Apple'}];
    readonly separatorKeysCodes = [ENTER, COMMA] as const;
    addOnBlur = true;

    selectedTheme = 'Linde';
    searchTerm = null;

  constructor(private themeService: ThemeService) {
      let test = [{deviceName:'test', deviceType:'beeper'},{deviceName:'test', deviceType:'beeper'},{deviceName:'test', deviceType:'beeper'}]
      this.dataSource = new MatTableDataSource(test);
      this.selectedTheme = themeService.getActiveTheme().name;
  }

  ngOnInit(): void {
  }

  switchTheme(theme) {
      if(theme === 'Linde'){
          this.themeService.setActiveTheme(listOfThemes[1]);
      } else {
          this.themeService.setActiveTheme(listOfThemes[2]);
      }
  }

    add(event: MatChipInputEvent): void {
        const value = (event.value || '').trim();

        // Add our fruit
        if (value) {
            this.fruits.push({name: value});
        }

        // Clear the input value
        event.chipInput!.clear();
    }

    remove(fruit: any): void {
        const index = this.fruits.indexOf(fruit);

        if (index >= 0) {
            this.fruits.splice(index, 1);
        }
    }

}
