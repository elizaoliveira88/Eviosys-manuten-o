import {Feature} from "@shared/models/Feature";

export class UserGroup {
    constructor() {
    }

    id: string;
    name: string;
    features: Feature[];

    static jsonToUserGroup (json: any): UserGroup {
        let features = [];
        if(json.features){
            json.features.forEach(el=>{
               features.push(Feature.jsonToFeature(el));
            });
        }
        return {
            id: json.id,
            name: json.name,
            features: features
        }

    }
}
