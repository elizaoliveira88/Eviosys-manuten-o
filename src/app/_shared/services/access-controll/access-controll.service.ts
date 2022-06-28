import { Injectable } from '@angular/core';
import { MasterDataProvider } from '@app/_shared/provider/MasterData.provider';

@Injectable({
  providedIn: 'root'
})
export class AccessControllService {
    private masterData;
    constructor(
        masterData: MasterDataProvider
    ){
        this.masterData = masterData;
    }

    private __checkValue(options): boolean {
        options = Object.assign({
            source: this.masterData.getUIAttributeSet(),
            path: null,
            defaultValue: undefined
        }, options || {});

        if(!options.source.hasOwnProperty(options.path)) return options.defaultValue;
        var tmp = options.source[options.path];

        if(tmp === true || tmp == 'true' || tmp == 'TRUE' || tmp == 'ON') return true;
        if(tmp === false || tmp == 'false' || tmp == 'FALSE' || tmp == 'OFF') return false;
        if(tmp == 'online' || tmp == 'ONLINE') return this.masterData.getOnlineStatus() === true;
        if(tmp == 'offline' || tmp == 'OFFLINE') return this.masterData.getOnlineStatus() === false;
        return options.defaultValue;
    }

    private _is(path, property): boolean {
        if(!path) return false;
        var pathAddon = '/';
        if(path[0] == '/') {
            pathAddon = '';
        }
        return this.__checkValue({
            source: this.masterData.getUIAttributeSet(),
            path: pathAddon + path + '/' + property,
            defaultValue: true
        });
    }

    public isVisible(path): boolean {
        if(Array.isArray(path)) {
            return this.hasOnePermission(path, 'visible');
        }
        return this._is(path, 'visible');
    }

    public isEnabled(path): boolean {
        return this._is(path, 'enabled');
    }

    public isRequired(path): boolean {
        return this._is(path, 'required');
    }

    private hasOnePermission(paths, type): boolean {
        var ret = false;
        paths.forEach(element => {
            if(this._is(element, type)) {
                ret = true;
            }
        });
        return ret;
    }

    public overwrite(path, property, value) {
        this.masterData.modifyUIAttributeSet(path + '/' + property, value);
    }

    public checkMinValue(path, defaultValue): Number {
        var rules = this.masterData.getUIRuleSet();
        if(defaultValue == null || defaultValue == undefined) defaultValue = 999999;
        path = '/'+path+'/min';
        if(!rules.getUIRuleSet().hasOwnProperty(path)) return defaultValue;
        var tmp = Number(rules.getUIRuleSet()[path]);
        return (isNaN(tmp) ? defaultValue : tmp);
    }
    public checkMaxValue(path, defaultValue): Number {
        var rules = this.masterData.getUIRuleSet();
        if(defaultValue == null || defaultValue == undefined) defaultValue = 999999;
        path = '/'+path+'/max';
        if(!rules.hasOwnProperty(path)) return defaultValue;
        var tmp = Number(rules[path]);
        return (isNaN(tmp) ? defaultValue : tmp);
    }

}
