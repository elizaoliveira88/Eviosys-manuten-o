import {Component, OnInit} from '@angular/core';
import {TemplateManagementService} from "@app/global-administration/template-management/template-management.service";
import {OrderByPipe} from "@shared/pipes/orderBy.pipe";
import {MatDialog, MatDialogConfig} from "@angular/material/dialog";
import {
    AddRowDialogComponent
} from "@app/global-administration/template-management/dialogs/add-row.dialog/add-row.dialog.component";
import {ToastService} from "@services/toast.service";
import {PromptDialogComponent} from "@shared/components/dialogs/prompt-dialog/prompt-dialog.component";
import {ConfirmDialogComponent} from "@shared/components/dialogs/confirm-dialog/confirm-dialog.component";
import {environment} from "@environments/environment";
import {Subject} from "rxjs";

@Component({
    selector: 'app-template-management',
    templateUrl: './template-management.component.html',
    styleUrls: ['./template-management.component.css']
})
export class TemplateManagementComponent implements OnInit {
    baseUrl = environment.apiEndpoint;
    storage = {
        templates: [],
        languages: [
            {name: 'English', key: 'en'},
            {name: 'Deutsch', key: 'de'},
            {name: 'Español', key: 'es'},
            {name: 'Italiano', key: 'it'},
            {name: 'Français', key: 'fr'},
            {name: 'Polski', key: 'pl'}
        ],
        selectedTemplate: {
            info: null,
            data: {
                chapters: [],
                contentBlocks: [],
                contentBlockRows: [],
                contentBlockItems: [],
                translations: {}
            },
            menu: [],
            displayedStructure: null,
            selectedChapterId: null,
            tinymceAll: {}
        },
        selectedLanguage: 'en',
        sysValues: [],
        rulesVars: []
    }

    treeOptions = {
        allowDrag: true,
        allowDrop: true,
    };

    tinyMceOptions = {
        height: 500,
        menubar: false,
        plugins: [
            'advlist autolink lists link image charmap print preview anchor',
            'searchreplace visualblocks code fullscreen',
            'insertdatetime media table paste code help wordcount'
        ]
    };

    constructor(private service: TemplateManagementService,
                private orderBy: OrderByPipe,
                private dialog: MatDialog,
                private toast: ToastService) {
    }

    ngOnInit(): void {
        this.service.getTemplates().then(res => {
            if (res) {
                this.storage.templates = res;
                if(this.storage.templates.length>0){
                    this.storage.selectedTemplate.info = this.storage.templates[0];
                    this.templateChanged();
                }
            }

        });
        this.loadSysValues();
    }

    templateChanged() {
        // TODO: confirm message / warning
        this.loadTemplateData();
    }

    loadTemplateData() {
        this.service.getTemplateById(this.storage.selectedTemplate.info.id).then(res=>{

            let chaptersCollect = [];
            let contentBlocks = [];
            let contentBlockRows = [];
            let contentBlockItems = [];

            let flatChapters = this.flattenObject2(res, [], null);
            if(flatChapters!==undefined && flatChapters!==null){
                for(var k=0; k<flatChapters.length; k++){
                    var chapter = flatChapters[k];
                    var chapterCopy = JSON.parse(JSON.stringify(chapter));
                    delete chapterCopy.contentBlocks;
                    delete chapterCopy.subChapters;

                    chaptersCollect.push(chapterCopy);

                    for(var l=0;l<chapter.contentBlocks.length;l++){
                        var block = chapter.contentBlocks[l];
                        var blockCopy = JSON.parse(JSON.stringify(block));
                        delete blockCopy.contentBlockRows;

                        contentBlocks.push(blockCopy);
                        for(var n=0; n<block.contentBlockRows.length;n++){
                            var row = block.contentBlockRows[n];
                            var rowCopy = JSON.parse(JSON.stringify(row));
                            delete rowCopy.contentBlockItems;

                            contentBlockRows.push(rowCopy);
                            contentBlockItems = contentBlockItems.concat(row.contentBlockItems);
                        }
                    }
                }
            }
            this.storage.selectedTemplate.data.chapters = chaptersCollect;
            this.storage.selectedTemplate.data.contentBlocks = contentBlocks;
            this.storage.selectedTemplate.data.contentBlockRows = contentBlockRows;
            this.storage.selectedTemplate.data.contentBlockItems = contentBlockItems;


            /* load translations */
            this.service.getTemplateTranslations(this.storage.selectedTemplate.info.id).then(translations=>{
                if(translations){
                    for (var lan in translations) {
                        if (translations.hasOwnProperty(lan)) {
                            for (var key in translations[lan]) {
                                if (translations[lan].hasOwnProperty(key)) {
                                    translations[lan][key] = translations[lan][key].replace(new RegExp("<br />", "g"), "<br>");
                                    translations[lan][key] = translations[lan][key].replace(new RegExp("<img", "g"), '&lt; image');
                                    translations[lan][key] = translations[lan][key].replace(new RegExp("/>", "g"), '/&gt;');
                                }
                            }
                        }
                    }
                    this.storage.selectedTemplate.data.translations = translations;
                    this.storage.selectedTemplate.menu = this.convertToHierarchy(JSON.parse(JSON.stringify(this.storage.selectedTemplate.data.chapters)));
                }
            }, err=>{
            });
        },err=>{
        });
    }

    loadSysValues() {
        this.service.getSysValues().then(values=>{
            let sysValues = values.placeholderVars;
            let rulesVars = values.rulesVars;

            sysValues = this.orderBy.transform(sysValues, 'type');

            this.storage.sysValues = sysValues;
            this.storage.rulesVars = rulesVars;

          //  this.loadValues(true);
        }, err=>{
         //   this.loadValues(true);
        });
    }

    onMoveNode($event) {
        console.log(
            "Moved",
            $event.node,
            "to",
            $event.to);

        let temp = this.flattenObject(this.storage.selectedTemplate.menu, [], null);
    }

    onEvent($event){
        if($event.node && $event.node.data && $event.node.data.value){
            let id = $event.node.data.value.id;
            this.storage.selectedTemplate.selectedChapterId = id;
            this.storage.selectedTemplate.displayedStructure = this.openChapter();
        }
    }

    openChapter(): any{
        let obj = null;
        if(this.storage.selectedTemplate){
            if(this.storage.selectedTemplate.data.chapters){
                this.storage.selectedTemplate.data.chapters.forEach(chapter=>{
                    if(chapter.id === this.storage.selectedTemplate.selectedChapterId){
                        obj = JSON.parse(JSON.stringify(chapter));
                        obj.contentBlocks = [];
                        if(this.storage.selectedTemplate.data.contentBlocks){
                            this.storage.selectedTemplate.data.contentBlocks.forEach(block=>{
                                if(obj.id === block.chapterId){
                                    let blockEl = JSON.parse(JSON.stringify(block));
                                    blockEl.contentBlockRows = [];
                                    obj.contentBlocks.push(blockEl);
                                    if(this.storage.selectedTemplate.data.contentBlockRows){
                                        this.storage.selectedTemplate.data.contentBlockRows.forEach(row=>{
                                            if(blockEl.id === row.contentBlockId){
                                                let rowEl = JSON.parse(JSON.stringify(row));
                                                rowEl.contentBlockItems = [];
                                                blockEl.contentBlockRows.push(rowEl);
                                                if(this.storage.selectedTemplate.data.contentBlockItems){
                                                    this.storage.selectedTemplate.data.contentBlockItems.forEach(item=>{
                                                        if(rowEl.id === item.contentBlockRowId){
                                                            let itemEl = JSON.parse(JSON.stringify(item));
                                                            rowEl.contentBlockItems.push(itemEl);
                                                        }
                                                    });
                                                }
                                            }
                                        })
                                    }
                                }
                            })
                        }
                    }
                })
            }
        }
        this.refreshContentBlockItems();
        return obj;
    }

    addRow(block){
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];

        const dialogRef = this.dialog.open(AddRowDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                let id = this.uuidv4();
                //first add row item
                this.storage.selectedTemplate.data.contentBlockRows.push({
                    id: id,
                    contentBlockId: block.id,
                    position: block.contentBlockRows.length
                });

                //then add all items already to row
                if (result === 1) {
                    //one element
                    this.storage.selectedTemplate.data.contentBlockItems.push({
                        id: this.uuidv4(),
                        contentBlockRowId: id,
                        position: 0,
                        textLK: null,
                        type: null,
                        width: 100
                    });

                } else {

                    let el1 = {
                        id: this.uuidv4(),
                        contentBlockRowId: id,
                        position: 0,
                        textLK: null,
                        type: null,
                        width: 50
                    };
                    let el2 = {
                        id: this.uuidv4(),
                        contentBlockRowId: id,
                        position: 1,
                        textLK: null,
                        type: null,
                        width: 50
                    };

                    if (result === 3) {
                        //two element in row 33:66
                        el1.width = 33;
                        el2.width = 66;

                    } else if (result === 4) {
                        //two element in row 66:33
                        el1.width = 66;
                        el2.width = 33;
                    }

                    this.storage.selectedTemplate.data.contentBlockItems.push(el1);
                    this.storage.selectedTemplate.data.contentBlockItems.push(el2);
                }

                this.storage.selectedTemplate.displayedStructure = this.openChapter();
            }
        });
    }

    addContentBlockItem (row, item, type) {
        for (var k = 0; k < this.storage.selectedTemplate.data.contentBlockItems.length; k++) {
            if (item.id === this.storage.selectedTemplate.data.contentBlockItems[k].id) {

                if (type === 'text') {
                    item.type = type;
                    item.textLK = 'ITEM_' + item.id;
                    this.storage.selectedTemplate.data.translations[this.storage.selectedLanguage]['ITEM_' + item.id] = "";

                    //UPDATE VIEW
                }
                else if (type === 'image') {
                    this.uploadImage('ITEM_' + item.id).then(res=>{
                        item.type = type;
                        item.textLK = 'ITEM_' + item.id;
                        item.imageMaxDimensions = {
                            width:null,
                            height:300
                        };

                        this.service.postImage(res).then(res=>{
                            if(res.data!== undefined && res.data!== null){
                                this.storage.selectedTemplate.data.translations[this.storage.selectedLanguage]['ITEM_' + item.id] = res.data.fileName;

                                //UPDATE VIEW

                                this.toast.success('TEMPLATER_IMAGEUPLOADEDSUCCESS');
                            }
                        },err=>{
                            this.toast.error('TEMPLATER_IMAGEUPLOADEDERROR');
                        });
                    },err=>{
                    });
                }

                break;
            }
        }
    }

    clickDeleteContentBlockItem(blockItem){
        const dialogConfig = new MatDialogConfig();
        dialogConfig.autoFocus = false;
        dialogConfig.panelClass = ['smallDialog'];
        dialogConfig.data = {
            labels: {
                title: "TEMPLATER_DELETEITEMWARNING_TITLE",
                content: "TEMPLATER_DELETEITEMWARNING",
                save: "TEMPLATER_DELETEITEMWARNING2"
            }
        };
        const dialogRef = this.dialog.open(ConfirmDialogComponent, dialogConfig);
        dialogRef.afterClosed().subscribe(result => {
            if (result) {
                this.deleteContentBlockItem(blockItem);
            }
        });
    }

    deleteContentBlockItem(blockItem) {
        //delete item
        for (var k = 0; k < this.storage.selectedTemplate.data.contentBlockItems.length; k++) {
            if (this.storage.selectedTemplate.data.contentBlockItems[k].id === blockItem.id) {
                this.storage.selectedTemplate.data.contentBlockItems.splice(k, 1);
            }
        }
        //resize other row element
        var bool = false;
        for (var i = 0; i < this.storage.selectedTemplate.data.contentBlockItems.length; i++) {
            if (this.storage.selectedTemplate.data.contentBlockItems[i].contentBlockRowId === blockItem.contentBlockRowId) {
                if (this.storage.selectedTemplate.data.contentBlockItems[i].id !== blockItem.id) {
                    bool = true;
                    this.storage.selectedTemplate.data.contentBlockItems[i].position = 0;
                    this.storage.selectedTemplate.data.contentBlockItems[i].width = 100;
                }
            }
        }
        if (!bool) {
            //delete row if no items left
            for (var j = 0; j < this.storage.selectedTemplate.data.contentBlockRows.length; j++) {
                if (this.storage.selectedTemplate.data.contentBlockRows[j].id === blockItem.contentBlockRowId) {
                    this.storage.selectedTemplate.data.contentBlockRows.splice(j, 1);
                    break;
                }
            }
        }
    }

    uploadImage (name){
        return new Promise(function(resolve, reject) {
            var element = document.createElement('input');
            element.setAttribute('type', 'file');
            element.style.display = 'none';

            document.body.appendChild(element);

            element.addEventListener('change', function (evt) {
                document.body.removeChild(element);
                var files = evt.target['files']; // FileList object
                // files is a FileList of File objects. List some properties.
                if(files.length == 0) {
                    reject();
                    return;
                }

                var oldFileName = files[0].name;
                var pieces = oldFileName.split(".");
                var fileType = pieces[pieces.length-1];

                var selFile =files[0];
                var new_file = new File([selFile], name+'.'+fileType, {type:files[0].type});
                resolve({file:new_file});

            }, false);
            element.click();
        });
    };

    changeImageDimensions (item, type){
        if(type==='width'){
            item.imageMaxDimensions.height = null;
        } else if(type==='height'){
            item.imageMaxDimensions.width = null;
        }
      // update contentBlockItems ?
    };

    refreshContentBlockItems () {
        this.storage.selectedTemplate.tinymceAll = {};
        for (var k = 0; k < this.storage.selectedTemplate.data.contentBlockItems.length; k++) {
            this.storage.selectedTemplate.tinymceAll[this.storage.selectedTemplate.data.contentBlockItems[k].textLK] = this.translateItem(this.storage.selectedTemplate.data.contentBlockItems[k].textLK, false);
        }
    };





    /* helpers */
    flattenObject2 (arr, res, parent) {
        for (var i = 0; i < arr.length; i++) {
            res.push(arr[i]);
            if (arr[i].hasOwnProperty('subChapters') && arr[i].subChapters.length > 0) {
                this.flattenObject2(arr[i].subChapters, res, JSON.parse(JSON.stringify(arr[i])));
            }
        }
        return res;
    };

    convertToHierarchy(array) {
        let nodeObjects = this.createStructure(array);

        for (let i = nodeObjects.length - 1; i >= 0; i--) {
            let currentNode = nodeObjects[i];

            //Skip over root node.
            if (currentNode.value.parentChapterId === null) {
                continue;
            }

            let parent = this.getParent(currentNode, nodeObjects);

            if (parent == null) {
                continue;
            }

            parent.children.push(currentNode);
            parent.children = this.orderBy.transform(parent.children, 'value.position');
            nodeObjects.splice(i, 1);
        }
        //What remains in nodeObjects will be the root nodes.
        return nodeObjects;
    }

    createStructure(nodes) {
        let objects = [];
        for (var i = 0; i < nodes.length; i++) {
            objects.push({value: nodes[i], children: [], name:this.translateItem(nodes[i].textLK)});
        }
        return objects;
    }

    getParent(child, nodes){
        let parent = null;
        for (let i = 0; i < nodes.length; i++) {
            if (nodes[i].value.id == child.value.parentChapterId) {
                return nodes[i];
            }
        }
        return parent;
    }

    translateItem(lk, returnEmpty?) {
        if (this.storage.selectedTemplate.data.translations.hasOwnProperty(this.storage.selectedLanguage) && this.storage.selectedTemplate.data.translations[this.storage.selectedLanguage].hasOwnProperty(lk)) return this.storage.selectedTemplate.data.translations[this.storage.selectedLanguage][lk];
        else {
            if (returnEmpty) return '';
            else {
                //show fallback en
                if (this.storage.selectedTemplate.data.translations.hasOwnProperty('en') && this.storage.selectedTemplate.data.translations['en'].hasOwnProperty(lk))
                    return this.storage.selectedTemplate.data.translations['en'][lk];
                else return lk;
            }
        }
    };

    uuidv4(): string {
        return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
            return v.toString(16);
        });
    }

    flattenObject (arr, res, parent) {
        for (var i = 0; i < arr.length; i++) {
            if (parent !== null) {
                arr[i].value.parentChapterId = parent.id;
            }
            arr[i].value.position = i + 1;
            res.push(arr[i].value);
            if (arr[i].hasOwnProperty('children') && arr[i].children.length > 0) {
                this.flattenObject(arr[i].children, res, JSON.parse(JSON.stringify(arr[i].value)));
            }
        }
        return res;
    };
}
