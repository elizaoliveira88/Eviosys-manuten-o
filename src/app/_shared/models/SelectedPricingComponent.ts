
export interface SelectedPricingComponent{
    "id": number,
    "componentId": string,
    "truckIdentification": string,
    "description": string,
    "type": string,
    "category": string,
    "comment": string,
    "number": number,
    "grossPriceOverwrite": number,

    "profitMargin": number,
    "profitMarginServices": number,
    "risk" : number,
    "riskServices": number,

    "discountBaseTruck": number,
    "discountCoBaseTruck": number,
    "discountAutomationPart": number,
    "discountEnergyConcept": number,
    "discountItOptions": number,
    "discountOtherComponents": number,
    "selectedConfigurationOptions": any[],

    "showSave": boolean
}
