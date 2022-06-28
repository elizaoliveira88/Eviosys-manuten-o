import {Directive, ElementRef, forwardRef, HostListener, Input, Output, EventEmitter } from '@angular/core';
import {MAT_INPUT_VALUE_ACCESSOR} from '@angular/material/input';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

@Directive({
    selector: 'input[matInputTime]',
    providers: [{
        provide: MAT_INPUT_VALUE_ACCESSOR,
        useExisting: MatInputTimeDirective
    }, {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => MatInputTimeDirective),
        multi: true,
    }]
})
export class MatInputTimeDirective {
    // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
    private _value: string | null;
    private _roundTo: number = 0;
    private _minValue: number | null = 0;
    private _maxValue: number | null = 0;
    @Output('changed') changed: EventEmitter<any> = new EventEmitter();
    @Output('blured') blured: EventEmitter<any> = new EventEmitter();

    constructor(
        private elementRef: ElementRef<HTMLInputElement>
    ) {
    }

    @Input('value')
    set value(value: string | null) {
        this._value = value;
        this.formatValue(value);
    }
    get value(): string | null {
        return this._value;
    }

    @Input('roundTo')
    set roundTo(value: number) {
        var t = Number(value);
        if(isNaN(Number(t)) || Number(t) <= 0) {
            this._roundTo = 0;
            return;
        }
        this._roundTo = t * 60000;
        this.formatValue(this._value);
    }
    get roundTo(): number {
        return this._roundTo != 0 ? (this._roundTo / 60000) : 0;
    }

    @Input('minValue')
    set minValue(value: number | string) {
        if(!value) {
            this._minValue = null;
            return;
        }
        if(!isNaN(Number(value))) {
            this._minValue = Number(value) % 86400000;
            this.formatValue(this._value);
            return;
        }
        value = value + '';
        if(value.length != 5 || value.indexOf(':') != 2 || value == '00:00') {
            this._minValue = null;
            return
        }

        this._minValue = this._getTimeStamp(value.split(''));
        this.formatValue(this._value);
    }
    get minValue(): number | string{
        return this._minValue;
    }

    @Input('maxValue')
    set maxValue(value: number | string) {
        if(!value) {
            this._maxValue = null;
            return;
        }
        if(!isNaN(Number(value))) {
            this._maxValue = Number(value) % 86400000;
            this.formatValue(this._value);
            return;
        }
        value = value + '';
        if(value.length != 5 || value.indexOf(':') != 2 || value == '00:00') {
            this._maxValue = null;
            return
        }

        this._maxValue = this._getTimeStamp(value.split(''));
        this.formatValue(this._value);
    }
    get maxValue(): number | string {
        return this._maxValue;
    }

    private formatToDate(value: string) {
        value = (value+'').substr(0,5);
        var val = value.split('');

        if(value.length == 0) {
            return '00:00';
        }

        if(value.indexOf(':') == -1) {
            if(value.length == 1) { value = '0' + value + ':00'; }
            if(value.length == 2) {
                if(Number(value) > 23) {
                    if(Number(val[0]) > 5) {
                        value = '00:5' + val[1];
                    } else {
                        value = '00' + ':' + val[0] + val[1];
                    }
                } else {
                    value = value + ':00';
                }
            }
            if(value.length == 3) {
                // 110 -> 11:00
                // 600 -> 06:00
                if(Number(val[0]) > 2) {
                    value = '0' + val[0] + ':' + val[1] + val[2];
                } else {
                    value = val[0] + val[1] + ':' + val[2] + '0';
                }
            }
            if(value.length == 4) { value = val[0] + val[1] + ':' + val[2] + val[3]; }
        } else {
            var tmp = value.split(':'); // :xx x:x x:
            var newValue = '';
            if(tmp[0].length == 1) { newValue = '0' + tmp[0] + ':'; }
            else if(tmp[0].length == 2) { newValue = tmp[0] + ':'; }
            else { newValue = '00:'; }

            if(tmp[1].length == 1) { newValue += '0' + tmp[1]; }
            else if(tmp[1].length == 2) { newValue += tmp[1]; }
            else { newValue += '00'; }

            value = newValue;
        }

        var p = value.split(':');
        val = value.split('');

        if(Number(p[0]) > 23) {
            val[0] = '2';
            val[1] = '3';
        }
        if(Number(p[1]) > 59) {
            val[3] = '5';
            val[4] = '9';
        }

        val = this.checkRounding(val);
        val = this.checkMinValue(val);
        val = this.checkMaxValue(val);

        return val.join('');
    }

    private _getTimeStamp(newValInPieces) {
        var cur = newValInPieces.join('').split(':');
        var curTime = Number(cur[0]) * 3600000;
            curTime += Number(cur[1]) * 60000;
        return curTime;
    }


    private checkRounding(newValInPieces) {
        if(this._roundTo == 0) return newValInPieces;
        var cur = this._getTimeStamp(newValInPieces);

        if((cur % this._roundTo) >= (this._roundTo / 2)) { // round up
            cur = cur - (cur % this._roundTo) + this._roundTo;
        } else { // round down
            cur = cur - (cur % this._roundTo);
        }

        var tmp = new Date(cur);
        var tmp2 = ('0' + tmp.getUTCHours()).slice(-2) + ':' + ('0' + tmp.getUTCMinutes()).slice(-2);
        return tmp2.split('');
    }

    private checkMinValue(newValInPieces) {
        if(!this._minValue) return newValInPieces;
        if(!this._maxValue && newValInPieces.join('') == '00:00') return newValInPieces;
        var cur = this._getTimeStamp(newValInPieces);
        if(cur < this._minValue) {
            var tmp = new Date(this._minValue);
            return (('0' + tmp.getUTCHours()).slice(-2) + ':' + ('0' + tmp.getUTCMinutes()).slice(-2)).split('');
        }
        return newValInPieces;
    }

    private checkMaxValue(newValInPieces) {
        if(!this._maxValue) return newValInPieces;
        var cur = this._getTimeStamp(newValInPieces);
        if(cur > this._maxValue) {
            var tmp = new Date(this._maxValue);
            return (('0' + tmp.getUTCHours()).slice(-2) + ':' + ('0' + tmp.getUTCMinutes()).slice(-2)).split('');
        }
        return newValInPieces;
    }

    private formatValue(value: string | null) {
        if (value !== null) {
            this._value = this.formatToDate(value);
            this._onChange(this._value);
            this.changed.emit(this._value);
            this.elementRef.nativeElement.value = this._value;
        } else {
            this.elementRef.nativeElement.value = '';
        }
    }

    private unFormatValue() {
        const value = this.elementRef.nativeElement.value;
        this._value = value.replace(/[^\d:]/g, '');
        if (value) {
            this.elementRef.nativeElement.value = this._value;
        } else {
            this.elementRef.nativeElement.value = '';
        }
    }

    @HostListener('input', ['$event.target.value'])
    onInput(value) {
        this._value = value.replace(/[^\d:]/g, '');
        this.elementRef.nativeElement.value = this._value;
        this._onChange(this._value); // here to notify Angular Validators
    }

    @HostListener('blur')
    _onBlur() {
        this.formatValue(this._value);
        this.blured.emit(this._value);
    }

    @HostListener('focus')
    onFocus() {
        this.elementRef.nativeElement.select();
        this.unFormatValue();
    }

    _onChange(value: any): void {
    }

    writeValue(value: any) {
        this._value = value;
        this.formatValue(this._value); // format Value
    }

    registerOnChange(fn: (value: any) => void) {
        this._onChange = fn;
    }

    registerOnTouched() {
    }

}
