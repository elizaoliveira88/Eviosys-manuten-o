

export const mockRoutingDelete = [{
    url: '/Clients/'
},{
    url: '/Devices/'
},{
    url: '/Gateways/'
},{
    url: '/Groups/'
},{
    url: '/Maps/'
},{
    url: '/Packages/'
},{
    url: '/Users/role'
},{
    url: '/Zones/'
}].map((entry)=>
    Object.assign({
        url: null,
        json: {},
        enabled: false,
        type: 'partial',
        status: 204
    }, entry)
);
