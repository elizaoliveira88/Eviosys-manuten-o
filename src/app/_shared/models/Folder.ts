import {Project_Simple_DATA} from "@shared/models/Project";

export interface Folders_DATA{
    folders: Folder_Simple_DATA[],
    projects: Project_Simple_DATA[]
}

export interface Folder_DATA{
    folders: Folder_Simple_DATA[],
    projects: Project_Simple_DATA[],
    nav: Folder_Simple_DATA[],
    creationDate: string,
    parentFolderId: number,
    name: string,
    id: number
}

export interface Folder_Simple_DATA{
    id: number,
    name: string
}

