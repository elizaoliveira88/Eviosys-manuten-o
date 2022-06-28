oAuthLogin: function(opts) {
    var options = angular.extend({
        username: '',
        password: ''
    }, opts);

    AuthData.setExtranetUserName(opts.username);

    var oAuthStepsPromise = $q.defer();

    var searchFailureCodeInResponse = function(response) {
        if(response.hasOwnProperty('data')) {
            var test = JSON.stringify(response.data);
            if(test.indexOf('FBTUPD101E') > -1) {
                var text = response.data.message.replace('FBTUPD101E','').trim();
                throw text;
            } else if(test.indexOf('FBTUPD119E') > -1) {
                throw $filter('translate')('TAM_ACC_INVALID');
            } else if(test.indexOf('FBTUPD117E') > -1) {
                $rootScope.$emit('show:changePasswordForm', {
                    token: null,
                    userid: options.username
                });
            }
        }
    };

    var oAuthSteps = {
        fnError: function(err) {
            oAuthStepsPromise.notify('ERROR');
            if(err.data && err.data.hasOwnProperty('exceptionMsg')) {
                Toast.error(err.data.exceptionMsg);
                oAuthStepsPromise.notify(err.data.exceptionMsg);
            } else {
                Toast.error('ERR_LOGIN');
                oAuthStepsPromise.notify(err);
            }
        },
        initAuthentication: function() {
            oAuthStepsPromise.notify('OA_LOGIN_STEP_INITAUTH');
            return $http({
                method: 'POST',
                url: serviceEndPoint + '/mga/sps/apiauthsvc?PolicyId=urn:ibm:security:authentication:asf:password',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }).then(function(response) {
                oAuthStepsPromise.notify('done initAuthentication');
                if((response.data.message + '').indexOf('FBTUPD117E') > -1) {
                    $rootScope.$emit('show:changePasswordForm', {
                        token: null,
                        userid: options.username
                    });
                }
                return {
                    state: response.data.state,
                    location: response.data.location ? response.data.location : '/mga/sps/apiauthsvc?StateId=' + response.data.state,
                    username: options.username,
                    password: options.password
                }
            });
        },
        authenticate: function(options) {
            oAuthStepsPromise.notify('OA_LOGIN_STEP_AUTHENTICATE');

            var location = '/mga/sps/apiauthsvc?StateId=' + options.state;
            if(options.location && options.location != '') {
                location = options.location;
            }
            return $http({
                method: 'PUT',
                url: serviceEndPoint + location,
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                data: {
                    "username": options.username,
                    "password": options.password
                }
            }).then(function(response) {
                AuthData.setExtranetUserName(options.username);
                searchFailureCodeInResponse(response);
                return options;
            }, function(err) {
                searchFailureCodeInResponse(err);
                return options;
            });
        },
        authorize: function(options) {
            oAuthStepsPromise.notify('OA_LOGIN_STEP_AUTHORIZE');
            var promise = $q.defer();

            $http({
                method: 'GET',
                url: serviceEndPoint + '/mga/sps/oauth/oauth20/authorize?' + $httpParamSerializer({
                    'response_type':'code',
                    'scope':'',
                    'redirect_uri':'',
                    "redirect_url":'',
                    'state': options.state,
                    'client_id': oAuthConfiguration.clientId
                }),
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }).then(function(response) {
                var test = response.data.match(/code=(.*)"/);
                if(test == null) {
                    oAuthStepsPromise.notify('INVALID_CREDENTIALS');
                    throw 'INVALID_CREDENTIALS';
                }
                promise.resolve(test[1]);
            }, function(err) {
                if(!err.hasOwnProperty('data') || (err.data+'').indexOf('code=') == -1) {
                    throw $filter('translate')('CODE_ERROR');
                }
                var test = err.data.match(/code=([0-9a-zA-Z]*)</);

                if(test == null) {
                    oAuthStepsPromise.notify('INVALID_CREDENTIALS');
                    throw 'INVALID_CREDENTIALS';
                }
                promise.resolve(test[1]);
            });

            return promise.promise.then(function(code) {
                options.code = code;
                return options;
            });
        },
        getToken: function(options) {
            if(!options.hasOwnProperty('code') || (options.code+'').length == 0) {
                throw 'INVALID_CODE_1';
            }
            var promise = $q.defer();

            oAuthStepsPromise.notify('OA_LOGIN_STEP_GETTOKEN');

            cordovaHTTP.post(serviceEndPoint + '/mga/sps/oauth/oauth20/token', {
                "scope":"",
                "client_secret": oAuthConfiguration.clientSecret,
                "grant_type":"authorization_code",
                "redirect_uri":"",
                "pin":"",
                "code": options.code,
                "client_id": oAuthConfiguration.clientId
            }, {
                'Content-Type': 'application/x-www-form-urlencoded', // ; charset=UTF-8
                'Accept': 'application/json',
                'Accept-Charset':'UTF-8'
            }).then(function(response) {
                var tmpData = JSON.parse(response.data);
                    tmpData.token_type = tmpData.token_type.charAt(0).toUpperCase() + tmpData.token_type.slice(1);
                promise.resolve(tmpData);
            }, function(err) {
                promise.reject({
                    data: {
                        exceptionMsg:'INVALID_CODE_2'
                    }
                });
                throw 'INVALID_CODE_2';
            });

            return promise.promise.then(function(opt) {
                return opt;
            });
        },
        login: function(options) {
            oAuthStepsPromise.notify('OA_LOGIN_STEP_LOGIN');
            AuthData.loginOAuth(options);
            AuthData.setExtranetUserName(opts.username);

            return getUserData({
                additionalHeader: {
                    'Authorization': options.token_type + ' ' + options.access_token
                }
            }).then(function(data) {
                oAuthStepsPromise.notify('OA_LOGIN_STEP_OK');
                AuthData.setLoginName(data.userId); // for InternalDatabase
                AuthData.setAuthProfile(data.authProfile);
                InternalDatabase.connect();
                oAuthStepsPromise.notify('OA_LOGIN_STEP_RIGHTS');
                return loadAttributesCache().then(function() {
                    return data;
                }, function() {
                    return data;
                });
            });
        }
    };

    oAuthStepsPromise.notify('LOADING_DATA');

    oAuthSteps.initAuthentication()
        .then(oAuthSteps.authenticate)
        .then(oAuthSteps.authorize)
        .then(oAuthSteps.getToken)
        .then(oAuthSteps.login)
        .then(function(data) {
            oAuthStepsPromise.resolve(data);
        })
        .catch(function(data) {
            oAuthSteps.fnError(data);
            oAuthStepsPromise.reject(data);
        });

    return oAuthStepsPromise.promise;
},
oAuth: {
    refreshToken: function(opts) {
        if(refreshTokenCallPromise != null) {
            return refreshTokenCallPromise;
        }

        var options = angular.extend({
            refreshToken: AuthData.getOAuthRefreshToken()
        }, opts || {});

        var deferred = $q.defer();
        refreshTokenCallPromise = deferred.promise;

        cordovaHTTP.post(serviceEndPoint + '/mga/sps/oauth/oauth20/token', {
            "refresh_token": options.refreshToken,
            "grant_type":"refresh_token",
            "client_secret": oAuthConfiguration.clientSecret,
            "client_id": oAuthConfiguration.clientId,
            "pin":"",
            "scope":"",
            "state":"",
            "redirect_uri":""
        }, {
            'Content-Type': 'application/x-www-form-urlencoded'
        }).then(function(response) {
            try {
                response.data = JSON.parse(response.data);
            } catch(err) {
                deferred.reject(err);
                $rootScope.$emit('do:logout');
                refreshTokenCallPromise = null;
                return;
            }
            AuthData.loginOAuth(response.data);
            deferred.resolve(response.data);
            refreshTokenCallPromise = null;
        }, function(err) {
            deferred.reject(err);
            $rootScope.$emit('do:logout');
            refreshTokenCallPromise = null;
        });

        return refreshTokenCallPromise;
    },
    changePassword: function(opts) {
        var options = angular.extend({
            token: null,
            passwordOld: null,
            passwordNew: null,
            username: null
        }, opts);
        if(!options.username) {
            options.username = AuthData.getExtranetUserName();
        }
        options.username = (options.username + '').toUpperCase();

        var promise = $q.defer();

        $http({
            method: 'POST',
            url: serviceEndPoint + '/mga/sps/apiauthsvc?PolicyId=urn:ibm:security:authentication:asf:pwchange',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'Authorization': AuthData.getOAuthHeaderData()
            },
            data: {
                "username": options.username,
                "passwordOld": options.passwordOld,
                "password": options.passwordNew,
                "passwordConfirm": options.passwordNew
            }
        }).then(function(response) {
            promise.resolve(response);
        }, function(err) {
            var txt = 'PASSWORD_CHANGED_ERROR';
            try {
                if(err && error.data && err.data.hasOwnProperty('error')) {
                    if(err.error.indexOf('HPDAA0344E') > -1) {
                        txt = 'PASSWORD_CHANGED_ERROR_WRONG_PW';
                    } else if(err.error.indexOf('HPDAA0291E') > -1) {
                        txt = 'PASSWORD_CHANGED_ERROR_ACC_LOCKED';
                    }
                }
            } catch(err2) {}
            promise.reject(txt);
        });

        return promise.promise;
    }
}
