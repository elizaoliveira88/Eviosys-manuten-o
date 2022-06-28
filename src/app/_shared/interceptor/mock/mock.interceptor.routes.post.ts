import * as USER_LOGIN from '@mock/users/USER_LOGIN.json';

export const mockRoutingPost = [{
    url: '/users/login',
    json: USER_LOGIN,
}].map((entry)=>
    Object.assign({
        url: null,
        json: {},
        enabled: false,
        type: 'partial'
    }, entry)
);
