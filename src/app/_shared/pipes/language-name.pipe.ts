import {NgModule} from '@angular/core';
import { Pipe, PipeTransform  } from '@angular/core';

@Pipe({
    name: 'languagename'
})
export class LanguageNamePipe implements PipeTransform {
    transform (lang: any): any {
        switch(lang) {
            case 'de': return 'Deutsch'; break;
            case 'cs': return 'Čeština'; break;
            case 'en': return 'English'; break;
            case 'es': return 'Español'; break;
            case 'fr': return 'Français'; break;
            case 'hu': return 'Magyar'; break;
            case 'it': return 'Italiano'; break;
            case 'pl': return 'Polszczyzna'; break;
            case 'pt': return 'Português'; break;
            case 'sv': return 'Svenska'; break;
            default: return lang;
        }
    }
}
