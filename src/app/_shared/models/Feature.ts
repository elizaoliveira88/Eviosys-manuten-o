export class Feature {
    constructor() {
    }

    id: string;
    name: string;

    static jsonToFeature (json: any): Feature {
        return {
            id: json.id,
            name: json.name
        }

    }
}
