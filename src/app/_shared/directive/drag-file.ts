import { Directive, Output, Input, EventEmitter, HostBinding, HostListener } from '@angular/core';

@Directive({
    selector: '[dragFile]'
})
export class DragFileDirective {

    @Output() onFileDropped = new EventEmitter<any>();
	@HostBinding('style.cursor') public cursor = 'auto';
    @HostBinding('style.opacity') public opacity = '1';

    //Dragover listener
    @HostListener('dragover', ['$event']) onDragOver(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.dataTransfer.dropEffect = "copy";
        this.cursor = 'copy';
        this.opacity = '0.8';
    }

    //Dragleave listener
    @HostListener('dragleave', ['$event']) public onDragLeave(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.dataTransfer.dropEffect = "none";
        this.cursor = 'auto';
        this.opacity = '1';
    }

    //Drop listener
    @HostListener('drop', ['$event']) public ondrop(evt) {
        evt.preventDefault();
        evt.stopPropagation();
        evt.dataTransfer.dropEffect = "none";
        this.cursor = 'auto';
        this.opacity = '1';
        let files = evt.dataTransfer.files;
        if (files.length > 0) {
            this.onFileDropped.emit(files)
        }
    }

}
