import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders, HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { environment } from '@environments/environment';
import { Observable, throwError, lastValueFrom, of } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';
import { PersistenceService } from '@shared/services/database/persistence.service';
import { MasterDataStore } from '@app/_shared/provider/MasterData.store';
declare var X2JS: any;

@Injectable({
  providedIn: 'root'
})
export class GatewayService {
    kimMessages = {};

    constructor(
        private httpClient: HttpClient,
        private masterDataStore: MasterDataStore,
        private database: PersistenceService
    ){
    }

    public getKimMessageByIdent(ident) {
        if(this.kimMessages.hasOwnProperty(ident)) {
            return this.kimMessages[ident];
        }
        return null;
    }

    private parseJSONResponse(data, filterNode) {
		if(data.hasOwnProperty('data')) {
			data = data.data;
		}
		if(data.hasOwnProperty('d')) {
			data = data.d;
		}

		if(data.hasOwnProperty('result')) {
			data = data.result;
		}
		if(data.hasOwnProperty('results')) {
			data = data.results;
		}

		if(filterNode != null) {
			if(data.hasOwnProperty(filterNode)) {
				data = data[filterNode];
			}
		}

        // needed for multi batch calls
		//if (data.hasOwnProperty('__metadata')) {
		//	delete data.__metadata;
		//}
		return data;
	};

    private _mergeUrl(options): string {
        options = Object.assign({
            endpoint: null,
            url: null,
            service: null
        }, options || {});

        options = JSON.parse(JSON.stringify(options));

        if(options.endpoint != null && options.endpoint[0] == '/') {
            options.endpoint = options.endpoint.substr(1);
        }
        if(options.url != null && options.url[0] == '/') {
            options.url = options.url.substr(1);
        }
        if(options.service != null && options.service[0] == '/') {
            options.service = this.translateServiceName(options.service.substr(1));
        }

        var url =
            (options.endpoint != null ? (options.endpoint + '/') : '') +
            (options.service != null ? (options.service + '/') : '') +
            (options.url != null ? options.url : '');

        //url = url.replace('//','/');

        return url;
    }

    private translateServiceName = function(sname) {
		var cases = {
			'ZMSD_CALENDAR':'calendar',
			'ZMSD_DASHBOARD':'dashboard',
			'ZMSD_DEALER':'dealer',
			'ZMSD_EQUI': 'equi',
			'ZMSD_IMSG':'imsg',
			'ZMSD_MSG':'msg',
			'ZMSD_NOTIF':'notif',
			'ZMSD_USER': 'user',
			'ZMSD_REQ':'req',
			'ZMSD_TASK':'task',
			'ZMSD_EVENT':'event'
		};
		if(cases.hasOwnProperty(sname)) {
			return cases[sname];
		}
		//}
		return sname;
	};

    public head(options): Promise<any> {
        options = Object.assign({
            url: null,
            additionalHeader: {},
            responseType: 'json'
        }, options || {});
        return new Promise(function(resolve, reject) {
            if(options.url == null) {
                reject();
                return;
            };

            this.httpClient.head(options.url, {
                headers: new HttpHeaders(Object.assign({
        //            'Content-Type' : 'application/json'
                }, options.additionalHeader || {})),
                responseType: options.responseType,
                withCredentials: false,
                observe: 'response' as 'response'
            }).subscribe(resp => {
                resolve(resp);
            },
            err => {
                reject(err);
            });
        }.bind(this));
    }

    public createFilter(filter) {
        var strgs = [];
        Object.keys(filter).forEach(key => {
            strgs.push(key + " eq '" + filter[key] + "'");
        });
        return '$filter=' + strgs.join(' and ');
    }

    public get(options): Promise<any> {
        options = Object.assign({
            endpoint: environment.apiEndpoint,
            url: null,
            service: null,
            additionalHeader: {},
            responseType: 'json',
            identifier: null
        }, options || {});
        return new Promise(function(resolve, reject) {
            if(options.url == null) {
                reject();
                return;
            };

            var url = options.url;
            if(options.endpoint != null) {
                if(options.url.indexOf('format=json') == -1) {
                    options.url += ((options.url.indexOf('?') == -1) ? '?':'&') + '$format=json';
                }

                url = this._mergeUrl({
                    endpoint: options.endpoint,
                    service: options.service,
                    url: options.url
                });
            }

            this.httpClient.get(url, {
                headers: new HttpHeaders(Object.assign({
                    'Content-Type' : 'application/json'
                }, options.additionalHeader || {})),
                responseType: options.responseType,
                withCredentials: options.endpoint != null,
                observe: 'response' as 'response'
            }).subscribe((resp) => {
                var respData = null;
                if(resp.headers && (resp.headers.get('Content-Type') + '').toLowerCase().indexOf('json') > -1) {
                    try {
                        if(typeof resp.body === 'string') {
                            resp.body = JSON.parse(resp.body);
                        }
                        respData = this.parseJSONResponse(resp.body, null);
                    } catch(err) { console.log(err); }
                } else {
                    respData = resp.body;
                }
                resolve(respData);
            },
            err => {
                console.log(err)
                reject(err);
            });
        }.bind(this));
    }

    public delete(options): Promise<any> {
        options = Object.assign({
            endpoint: environment.apiEndpoint,
            service: null,
            url: null,
            additionalHeader: null,
            responseType: 'text',
            identifier: null
        }, options || {});

        return new Promise(function(resolve, reject) {
            if(options.url == null) {
                reject();
                return;
            };

            var url = options.url;
            if(options.endpoint != null) {
                url = this._mergeUrl({
                    endpoint: options.endpoint,
                    service: options.service,
                    url: options.url
                });
            }

            this.httpClient.delete(url, {
                headers: new HttpHeaders(Object.assign({
                    'Content-Type' : 'application/json'
                }, options.additionalHeader || {})),
                responseType: options.responseType,
                withCredentials: options.endpoint != null,
                observe: 'response' as 'response'
            }).subscribe((resp) => {
                    var respData = null;
                    if(resp.headers && (resp.headers.get('Content-Type') + '').toLowerCase().indexOf('json') > -1) {
                        try {
                            if(typeof resp.body === 'string') {
                                resp.body = JSON.parse(resp.body);
                            }
                            respData = this.parseJSONResponse(resp.body, null);
                        } catch(err) { console.log(err); }
                    } else {
                        respData = resp.body;
                    }
                    resolve(respData);
                },
                err => {
                    console.log(err)
                    reject(err);
                });
        }.bind(this));

    }

    public post(options): Promise<any> {
        options = Object.assign({
            endpoint: environment.apiEndpoint,
            service: null,
            data: {},
            url: null,
            additionalHeader: null,
            responseType: 'json',
            additionalBatchData: null,
            identifier: null,
            formMultipart: false
        }, options || {});

        return new Promise(function(resolve, reject) {
            if(options.url == null) {
                reject();
                return;
            };

            var targetURL = options.url;
            if(options.endpoint != null) {
                targetURL = this._mergeUrl({
                    endpoint: options.endpoint,
                    service: options.service,
                    url: options.url
                });
            }

            if (options.formMultipart) {
                var fd = new FormData();
                for(let key in options.data){
                    let value = options.data[key];
                    fd.append(key, value);
                }
                options.data = fd;
            }

            this.httpClient.post(targetURL, options.data, {
                headers: new HttpHeaders(Object.assign({
                    'Content-Type' : 'application/json',
                }, options.additionalHeader || {})),
                observe: 'response' as 'response',
                responseType: options.responseType,
                withCredentials: true
            }).toPromise().then((resp) => {
                var respData = null;
                if(resp.headers && (resp.headers.get('Content-Type') + '').toLowerCase().indexOf('json') > -1) {
                    try {
                        if(typeof resp.body === 'string') {
                            resp.body = JSON.parse(resp.body);
                        }
                        respData = this.parseJSONResponse(resp.body, null);
                    } catch(err) { console.log(err); }
                } else {
                    respData = resp.body;
                }
                resolve(respData);
            }, (err) => {
                console.log(err)
                reject(err);
            });
        }.bind(this));

    }

    public put(options): Promise<any> {
        options = Object.assign({
            endpoint: environment.apiEndpoint,
            service: null,
            data: {},
            url: null,
            additionalHeader: null,
            responseType: 'json',
            additionalBatchData: null,
            identifier: null
        }, options || {});

        return new Promise(function(resolve, reject) {
            if(options.url == null) {
                reject();
                return;
            };

            var targetURL = this._mergeUrl({
                endpoint: options.endpoint,
                service: options.service,
                url: options.url
            });

            this.httpClient.put(targetURL, options.data, {
                headers: new HttpHeaders(Object.assign({
                    'Content-Type' : 'application/json',
                }, options.additionalHeader || {})),
                observe: 'response' as 'response',
                responseType: options.responseType,
                withCredentials: true
            }).toPromise().then((resp) => {
                var respData = null;
                if(resp.headers && (resp.headers.get('Content-Type') + '').toLowerCase().indexOf('json') > -1) {
                    try {
                        if(typeof resp.body === 'string') {
                            resp.body = JSON.parse(resp.body);
                        }
                        respData = this.parseJSONResponse(resp.body, null);
                    } catch(err) { console.log(err); }
                } else {
                    respData = resp.body;
                }
                resolve(respData);
            }, (err) => {
                console.log(err)
                reject(err);
            });
        }.bind(this));

    }

    public patch(options): Promise<any> {
        options = Object.assign({
            endpoint: environment.apiEndpoint,
            service: null,
            data: {},
            url: null,
            additionalHeader: null,
            responseType: 'json',
            additionalBatchData: null,
            identifier: null
        }, options || {});

        return new Promise(function(resolve, reject) {
            if(options.url == null) {
                reject();
                return;
            };

            var targetURL = this._mergeUrl({
                endpoint: options.endpoint,
                service: options.service,
                url: options.url
            });

            this.httpClient.patch(targetURL, options.data, {
                headers: new HttpHeaders(Object.assign({
                    'Content-Type' : 'application/json',
                }, options.additionalHeader || {})),
                observe: 'response' as 'response',
                responseType: options.responseType,
                withCredentials: true
            }).toPromise().then((resp) => {
                var respData = null;
                if(resp.headers && (resp.headers.get('Content-Type') + '').toLowerCase().indexOf('json') > -1) {
                    try {
                        if(typeof resp.body === 'string') {
                            resp.body = JSON.parse(resp.body);
                        }
                        respData = this.parseJSONResponse(resp.body, null);
                    } catch(err) { console.log(err); }
                } else {
                    respData = resp.body;
                }
                resolve(respData);
            }, (err) => {
                console.log(err)
                reject(err);
            });
        }.bind(this));

    }

    private parseBatchResponse(response, additionalBatchData, identifier) {
        if(response.body == '') return [];
        var boundary = response.headers.get('Content-Type').split('=')[1];
        /*
        if(response.body.indexOf('400 Bad Request') > -1 || response.body.indexOf('Internal Server') > -1) {
            console.error('false batch');
            console.debug(response.body)
        }
        */
        var requests = response.body.split('--'+boundary);

        var result = [];
        requests.forEach(function(request) {
            if(request.length < 5) return;

            var tempEntry = {
                status: -2,
                error: true,
                data: null,
                additionalData: additionalBatchData && additionalBatchData.length > result.length ? additionalBatchData[result.length] : null
            };

            var requestPieces = request.split('\n');
            requestPieces.forEach(function(entry) {
                if(entry.indexOf('HTTP/1.1') > -1) {
                    var tmp = entry.split(' ');
                    tempEntry.status = Number(tmp[1]);
                    tempEntry.error = (tempEntry.status > 300);
                } else if(entry.indexOf('kim-message') > -1) {

                } else if(entry.indexOf('{"') > -1) {
                    try {
                        tempEntry.data = this.parseJSONResponse(JSON.parse(entry), null);
                    } catch(err) {
                        console.debug(entry)
                        console.error(err);
                        tempEntry.data = entry;
                    }
                }
            }.bind(this));
            result.push(tempEntry);
        }.bind(this));
        return result;
    }

    public batch(options): Promise<any> {
        options = Object.assign({
            endpoint: environment.apiEndpoint,
            service: null,
            requests: null,
            identifier: null
        }, options || {});

        var guid = function() { // this is not a true guid, cause we cannot check if it is unique ...
            return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
                var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
                 return v.toString(16);
            });
        }

        return new Promise(function(resolve, reject) {
            if(options.requests == null || options.requests.length == 0) {
                reject();
                return;
            };

            var batchId = 'batch_' + guid();

            var additionalBatchData = [];
            var body = [];
            options.requests.forEach(request => {
                request = Object.assign({
                    method: 'GET',
                    url: null,
                    data: null,
                    additionalData: null
                }, request || {});

                additionalBatchData.push(request.additionalData);

                var url = request.url;
                if(request.method == 'GET') {
                    if(url.indexOf('format=json') == -1) {
                        url += ((url.indexOf('?') == -1) ? '?':'&') + '$format=json';
                    }
                }
                if(url[0] == '/') {
                    url = url.substr(1);
                }

                body.push('--' + batchId);
                if(request.method != 'GET') {
                    var changeSetId = 'changeset_' + guid();
                    body.push('Content-Type: multipart/mixed; boundary=' + changeSetId);
                    body.push('');
                    body.push('--' + changeSetId);
                    body.push('Content-Type: application/http');
                    body.push('Content-Transfer-Encoding: binary');
                    body.push('');
                    body.push(request.method + ' ' + encodeURI(url) + ' HTTP/1.1');
                    if(request.hasOwnProperty('data') && request.data != null) {
                        var xml = [];
                        if(request.method == 'POST' || request.method == 'PUT' || request.method == 'DELETE') {
                            xml.push('<?xml version="1.0" encoding="utf-8"?>');
                            xml.push('<entry xmlns="http://www.w3.org/2005/Atom" xmlns:m="http://schemas.microsoft.com/ado/2007/08/dataservices/metadata" xmlns:d="http://schemas.microsoft.com/ado/2007/08/dataservices">');
                            xml.push('<content type="application/xml">');
                            xml.push('<m:properties>');
                            for (var key in request.data) {
                                xml.push('<d:' + key + '>' + request.data[key] + '</d:' + key + '>');
                            };
                            xml.push('</m:properties>');
                            xml.push('</content>');
                            xml.push('</entry>');

                        }
                        var xmlString = xml.join("\n");

                        body.push('Accept: application/atomsvc+xml;q=0.8, application/json;odata=fullmetadata;q=0.7, application/json;q=0.5, */*;q=0.1');

                        body.push('MaxDataServiceVersion: 3.0');
                        body.push('Content-Type: application/xml');
                        body.push('Content-Length: ' + (xmlString.length + 100)); // +100 because of PEÇ is converted to PEU+1493
                        body.push('');
                        body.push(xmlString);
                    } else {
                        body.push('Accept: application/atomsvc+xml;q=0.8, application/json;odata=fullmetadata;q=0.7, application/json;q=0.5, */*;q=0.1');
                        body.push('MaxDataServiceVersion: 3.0');
                        body.push('Content-Type: application/xml');
                        body.push('x-csrf-token: ##CURRENTXSRFTOKEN##');
                    }
                    body.push('');
                    body.push('');
                    body.push('--'+changeSetId+'--');
                    body.push('');
                } else {
                    body.push('Content-Type: application/http');
                    body.push('Content-Transfer-Encoding: binary');
                    body.push('');
                    body.push(request.method + ' ' + encodeURI(url) + ' HTTP/1.1');
                    body.push('Accept: application/atomsvc+xml;q=0.8, application/json;odata=fullmetadata;q=0.7, application/json;q=0.5, */*;q=0.1');
                    //body.push('MaxDataServiceVersion: 3.0');
                    body.push('MaxDataServiceVersion: 2.0');
                    body.push('DataServiceVersion: 2.0');
                    //body.push('x-csrf-token: xxxxxxxxx');
                    body.push('Content-Type: application/json');
                    body.push('');
                    body.push('');
                }
            });
            body.push('--'+batchId+'--');

            this.post({
                data: body.join("\n"),
                service: options.service,
                url: "/$batch",
                additionalHeader: {
                    'Content-Type': 'multipart/mixed; boundary=' + batchId
                },
                responseType: 'text',
                additionalBatchData: additionalBatchData,
                identifier: options.identifier
            }).then(resolve, reject);
        }.bind(this));
    }

    private getSAPDate(seconds) {
        var l10 = function(val) {
            return (val < 10 ? '0':'') + val;
        };
        var date = new Date(seconds);
        return date.getUTCFullYear() + '-' + l10(date.getUTCMonth() + 1) + '-' + l10(date.getUTCDate()) +
        'T' + l10(date.getUTCHours()) + ':' + l10(date.getUTCMinutes()) + ':' + l10(date.getUTCSeconds());
    }

    public getUserCacheSet(lang): Promise<any> {
        // get language related caches
        return new Promise(function(resolve, reject) {
            this.get({
                service: 'MOB_CACHE',
                url: "UsrCacheSet(IvLangu='" + (lang || 'en') + "')"
            }).then(function(data) {
                try {
                    if(data.hasOwnProperty('EvCache') && (typeof data['EvCache']) == "string") {
                        data['EvCache'] = JSON.parse(data['EvCache']);
                    }
                    if(data.hasOwnProperty('EvCacheLangu') && (typeof data['EvCacheLangu']) == "string") {
                        data['EvCacheLangu'] = JSON.parse(data['EvCacheLangu']);
                    }
                    resolve(data);
                } catch(err) {
                    reject(err);
                }
            }, reject);
        }.bind(this));
    }

    public getDeploymentTime(): Promise<any> {
        return this.get({
            endpoint: null,
            url: "assets/timestamp.txt",
            additionalHeader: {
                'Content-Type' : 'application/text'
            },
            responseType: 'text'
        });
    }

    public getDevelopmentNotes(): Promise<any> {
        return this.get({
            endpoint: null,
            url: "assets/whats-new.json"
        });
    }

    public getReleaseNotes(): Promise<any> {
        return this.get({
            endpoint: null,
            url: "assets/release-notes.json"
        });
    }

    public getTranslation(lang): Promise<any> {
        return new Promise(function(resolve, reject) {
            this.httpClient.get('assets/i18n/v1/' + lang + '.json').toPromise().then(function(baseV1) {
                this.httpClient.get('assets/i18n/' + lang + '.json').toPromise().then(function(baseV2) {
                    resolve(Object.assign({}, baseV1, baseV2));
                }.bind(this), reject);
            }.bind(this), reject);
        }.bind(this));
    }
}
