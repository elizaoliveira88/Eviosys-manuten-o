import {Project_DATA} from "@shared/models/Project";
import {Shortcut_DATA} from "@shared/models/Shortcut";

export interface Overview_DATA{
    recentProjects: Project_DATA[];
    sharedProjects: Project_DATA[];
    shortcuts: Shortcut_DATA[]
}
