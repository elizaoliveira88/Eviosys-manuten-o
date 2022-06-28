export interface Shortcut_DATA{
    id: number;
    project: {
        projectId: number,
        projectName: string,
        sub: string
    };
    folder: {
        folderId: number,
        folderName: string
    };
    application: {
        projectId: number,
        applicationId: number,
        projectName: string,
        applicationName: string
    };
    type: string;
}

export class Shortcut implements Shortcut_DATA{
    id = null;
    project = null;
    folder = null;
    application = null;
    type = 'project';


    constructor(json?) {
        if(json){
            this.id = json.id;
            this.project = json.project;
            this.application = json.application;
            this.folder = json.folder;

            if(json.project) this.type = 'project';
            else if(json.application) this.type = 'application';
            else if(json.folder) this.type = 'folder';
        }
    }


}
