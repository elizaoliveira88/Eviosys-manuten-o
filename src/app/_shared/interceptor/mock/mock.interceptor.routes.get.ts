import * as ME from '@mock/users/USER_ME.json';
import * as FlowPlanTrucks from '@mock/projects/flowPlanTrucks.json';
import * as SelectedPricingComponents from '@mock/projects/pricingComponents.json';
import * as Optimizations from '@mock/projects/optimizations.json';
import * as OptimizationDetails from '@mock/projects/optimization-details.json';
import * as Overview from '@mock/projects/welcome.json';
import * as Folders from '@mock/projects/folders.json';
import * as FoldersById from '@mock/projects/folderById.json';
import * as FoldersById2 from '@mock/projects/folderById2.json';
import * as GetLatestPublishedVersion from '@mock/versioning/getLatestPublishedVersion.json';
import * as ReducedVersions from '@mock/versioning/getReducedVersionDtosOfAllVersion.json';
import * as Variations_0 from '@mock/versioning/variations_0.json';
import * as Variations_1 from '@mock/versioning/variations_1.json';

export const mockRoutingGet = [{
    url: '/users/SuperAdminIto',
    json: ME,
    enabled: false
},{
    url: 'flowPlanTrucks',
    json: FlowPlanTrucks,
    enabled: false
},{
    url: 'pricingComponents',
    json: SelectedPricingComponents,
    enabled: true
}, {
    url: 'api/optimizations/0?$format=json',
    json: OptimizationDetails,
    type: 'match',
    enabled: true
}, {
    url: 'optimizations',
    json: Optimizations,
    type: 'partial',
    enabled: true
},{
    url: 'overview',
    json: Overview,
    type: 'partial',
    enabled: true
},{
    url: 'api/users/149/folders/1?$format=json',
    json: FoldersById,
    type: 'match',
    enabled: true
},{
    url: 'api/users/149/folders/4?$format=json',
    json: FoldersById2,
    type: 'match',
    enabled: true
},{
    url: 'folders',
    json: Folders,
    type: 'partial',
    enabled: true
},{
    url: 'versioningTruck/getLatestPublishedVersion',
    json: GetLatestPublishedVersion,
    type: 'partial',
    enabled: true
},{
    url: 'versioningTruck/getReducedVersionDtosOfAllVersion',
    json: ReducedVersions,
    type: 'partial',
    enabled: true
},{
    url: 'api/versioningTruck/0/variations$format=json',
    json: Variations_0,
    type: 'match',
    enabled: true
},{
    url: 'api/versioningTruck/1/variations$format=json',
    json: Variations_1,
    type: 'match',
    enabled: true
}].map((entry)=>

    Object.assign({
        url: null,
        json: {},
        enabled: false,
        type: 'partial'
    }, entry)
);
