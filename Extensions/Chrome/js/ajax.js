/**
 * Created with JetBrains WebStorm.
 * User: ddyachenko
 * Date: 19.08.13
 * Time: 13:07
 * To change this template use File | Settings | File Templates.
 */

(function(){
namespace("fjs");
var a = fjs.Ajax = function() {
    //Singleton
    if (!this.constructor.__instance)
        this.constructor.__instance = this;
    else return this.constructor.__instance;
};

fjs.Ajax.REQUEST_NOT_INITIALIZED = 0;
fjs.Ajax.REQUEST_CONNECTION_ESTABLISHED = 1;
fjs.Ajax.REQUEST_RECEIVED = 2;
fjs.Ajax.REQUEST_PROCESSING = 3;
fjs.Ajax.REQUEST_COMPLETED = 4;
    /**
     *
     * @returns {XMLHttpRequest}
     */
fjs.Ajax.prototype.getXmlHttp = function() {
    var xmlhttp;
    try {
        xmlhttp = new XMLHttpRequest();
    }
    catch (e) {
        try {
            xmlhttp = new ActiveXObject("Msxml2.XMLHTTP");
        }
        catch (e1) {
            try{
                xmlhttp = new ActiveXObject("Microsoft.XMLHTTP");
            } catch (e2) {
                xmlhttp = false;
            }
        }
    }
    return xmlhttp;
};
    /**
     * @param {*} data
     * @returns {string}
     */
fjs.Ajax.prototype.getParamData = function(data) {
    var paramStrings = [];
    for(var i in data) {
        if(data.hasOwnProperty(i)) {
            paramStrings.push(i+"="+data[i]);
        }
    }
    return paramStrings.join("&");
};

    /**
     *
     * @param {String} method
     * @param {String} url
     * @param {*} headers
     * @param {*} data
     * @param {Function} callback
     * @returns {XMLHttpRequest}
     */
fjs.Ajax.prototype.send = function(method, url, headers, data, callback) {
    var xmlhttp = this.getXmlHttp();

    xmlhttp.open(method, url);

    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

    if(headers) {
        for(var key in headers) {
            if(headers.hasOwnProperty(key)) {
                xmlhttp.setRequestHeader(key, headers[key]);
            }
        }
    }

    xmlhttp.onreadystatechange = function () {
        if (xmlhttp.readyState != a.REQUEST_COMPLETED) return;

        if(callback) {
            if (xmlhttp.status == 200) {
                callback(xmlhttp, xmlhttp.responseText, true);
            }
            else {
                callback(xmlhttp, xmlhttp.responseText, false);
            }
        }
    };

    xmlhttp.send(this.getParamData(data));

    return xmlhttp;
};

    /**
     * @param {XMLHttpRequest} xhr
     */
fjs.Ajax.prototype.abort  = function(xhr) {
    if (xhr && xhr.readyState != a.REQUEST_COMPLETED) {
        xhr["aborted"] = true;
        xhr.abort();
    }
};
})();