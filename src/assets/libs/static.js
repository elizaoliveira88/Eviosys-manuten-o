/*
window.onerror = function (errorMsg, url, lineNumber) {
    alert('Error: ' + errorMsg + ' Script: ' + url + ' Line: ' + lineNumber);
};
*/

if (!("console" in window)) {
	window.console = {};
};
var names = ["log", "debug", "info", "warn", "error", "assert", "dir", "dirxml", "group", "groupEnd", "time", "timeEnd", "count", "trace", "profile", "profileEnd"];
for (var i = 0; i < names.length; ++i) {
	if(!window.console[names[i]]) {
		window.console[names[i]] = function() {};
	}
}

function guid() { // this is not a true guid, cause we cannot check if it is unique ...
	return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
         return v.toString(16);
    });
}

String.prototype.format = function() {
	var s = this;
	for (var i = 0; i < arguments.length; i++) {
		var reg = new RegExp("\\{" + i + "\\}", "gm");
	    s = s.replace(reg, arguments[i]);
	}
	return s;
};

function base64toBlob(base64str, mimeType) {
	// decode base64 string, remove space for IE compatibility
	var binary = atob(base64str.replace(/\s/g, ''));
    var mtype = mimeType || "application/pdf";

	// get binary length
	var len = binary.length;

	// create ArrayBuffer with binary length
	var buffer = new ArrayBuffer(len);

	// create 8-bit Array
	var view = new Uint8Array(buffer);

	// save unicode of binary data into 8-bit Array
	for (var i = 0; i < len; i++) {
	 view[i] = binary.charCodeAt(i);
	}

	// create the blob object with content-type "application/pdf"
	return new Blob( [view], { type: mtype });
};

//@ https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/String/startsWith
if (!String.prototype.startsWith) {
  String.prototype.startsWith = function(searchString, position) {
    position = position || 0;
    return this.lastIndexOf(searchString, position) === position;
  };
}


// JWT : https://www.jonathan-petitcolas.com/2014/11/27/creating-json-web-token-in-javascript.html
function base64url(source) {
    // Encode in classical base64
    var encodedSource = CryptoJS.enc.Base64.stringify(source);

    // Remove padding equal characters
    encodedSource = encodedSource.replace(/=+$/, '');

    // Replace characters according to base64url specifications
    encodedSource = encodedSource.replace(/\+/g, '-');
    encodedSource = encodedSource.replace(/\//g, '_');

    return encodedSource;
};

function createJWT(data, secret) {
    var encodedHeader = base64url(CryptoJS.enc.Utf8.parse(JSON.stringify({
      "alg": "HS256",
      "typ": "JWT"
    })));

    var encodedData = base64url(CryptoJS.enc.Utf8.parse(JSON.stringify(data)));

    var token = encodedHeader + "." + encodedData;
    var signature = base64url(CryptoJS.HmacSHA256(token, secret));

    return  token + "." + signature;
};
