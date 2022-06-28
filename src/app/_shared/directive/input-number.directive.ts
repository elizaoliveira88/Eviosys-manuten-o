import {Directive, ElementRef, forwardRef, HostListener, Input} from '@angular/core';
import {MAT_INPUT_VALUE_ACCESSOR} from '@angular/material/input';
import {NG_VALUE_ACCESSOR} from '@angular/forms';

@Directive({
    selector: 'input[matInputNumber]',
    providers: [{
        provide: MAT_INPUT_VALUE_ACCESSOR,
        useExisting: MatInputNumberDirective
    }, {
        provide: NG_VALUE_ACCESSOR,
        useExisting: forwardRef(() => MatInputNumberDirective),
        multi: true,
    }]
})
export class MatInputNumberDirective {
    // eslint-disable-next-line @typescript-eslint/naming-convention, no-underscore-dangle, id-blacklist, id-match
    private _value: string | null;
    private _minValue: number | null = 0;
    private _maxValue: number | null = 0;

    constructor(
        private elementRef: ElementRef<HTMLInputElement>
    ) {
    }

    get value(): string | null {
        return this._value;
    }

    @Input('value')
    set value(value: string | null) {
        this._value = value;
        this.formatValue(value);
    }

    private formatToNumber(value: string) {
        if(value == '' || value == null || value == undefined) {
            value = '0';
        }
        if(isNaN(Number(value))) {
            value = value.replace(/[^\d.-]/g, '');
        }

        value = this.checkMinValue(value);
        value = this.checkMaxValue(value);

        return (value + '');
    }

    private formatValue(value: string | null) {
        if (value !== null) {
            this._value = this.formatToNumber(value);
            this._onChange(this._value);
            this.elementRef.nativeElement.value = this._value;
        } else {
            this.elementRef.nativeElement.value = '';
        }
    }

    private unFormatValue() {
        var value = (this.elementRef.nativeElement.value+'').replace(',', '.');
        this._value = value.replace(/[^\d.-]/g, '');
        if (value) {
            this.elementRef.nativeElement.value = this._value;
        } else {
            this.elementRef.nativeElement.value = '';
        }
    }

    private checkMinValue(val) {
        if(!this._minValue) return val;
        return (Number(val) < this._minValue) ? (this._minValue+'') : val;
    }

    private checkMaxValue(val) {
        if(!this._maxValue) return val;
        return (Number(val) > this._maxValue) ? (this._maxValue+'') : val;
    }

    @Input('minValue')
    set minValue(value: number | string) {
        if(!value) {
            this._minValue = null;
        } else if(isNaN(Number(value))) {
            this._minValue = null;
        } else {
            this._minValue = Number(value);
        }
        this.formatValue(this._value);
    }
    get minValue(): number | string{
        return this._minValue;
    }

    @Input('maxValue')
    set maxValue(value: number | string) {
        if(!value) {
            this._maxValue = null;
        } else if(isNaN(Number(value))) {
            this._maxValue = null;
        } else {
            this._maxValue = Number(value);
        }
        this.formatValue(this._value);
    }
    get maxValue(): number | string {
        return this._maxValue;
    }

    @HostListener('input', ['$event.target.value'])
    onInput(value) {
        value = (value+'').replace(',', '.');
        this._value = value.replace(/[^\d.-]/g, '');
        this.elementRef.nativeElement.value = this._value;
        this._onChange(this._value); // here to notify Angular Validators
    }

    @HostListener('blur')
    _onBlur() {
        this.formatValue(this._value);
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
