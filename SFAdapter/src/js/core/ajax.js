/**
 * Created with JetBrains WebStorm.
 * User: ddyachenko
 * Date: 19.08.13
 * Time: 13:07
 * To change this template use File | Settings | File Templates.
 */

namespace("fjs");
fjs.Ajax = function() {
    //Singleton
    if (!fjs.Ajax.__instance)
        fjs.Ajax.__instance = this;
    else return fjs.Ajax.__instance;

    this.ticket = null;
    this.node = null;
};

fjs.Ajax.REQUEST_NOT_INITIALIZED = 0;
fjs.Ajax.REQUEST_CONNECTION_ESTABLISHED = 1;
fjs.Ajax.REQUEST_RECEIVED = 2;
fjs.Ajax.REQUEST_PROCESSING = 3;
fjs.Ajax.REQUEST_COMPLETED = 4;

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

fjs.Ajax.prototype.setTicket = function(ticket) {
    this.ticket = ticket;
};

fjs.Ajax.prototype.setNode = function(node) {
    this.node = node;
};

fjs.Ajax.prototype.getParamData = function(data) {
    var paramStrings = [];
    for(var i in data) {
        if(data.hasOwnProperty(i)) {
            paramStrings.push(i+"="+data[i]);
        }
    }
    return paramStrings.join("&");
};


fjs.Ajax.prototype.send = function(method, url, data, callback) {
    var xmlhttp = this.getXmlHttp();
    xmlhttp.open(method, url);
    xmlhttp.setRequestHeader("Content-type","application/x-www-form-urlencoded");

    if (this.ticket) {
        xmlhttp.setRequestHeader("Authorization", "auth=" + this.ticket);
    }
    if(this.node) {
        xmlhttp.setRequestHeader("node", this.node);
    }

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState != fjs.Ajax.REQUEST_COMPLETED) return;

        if (xmlhttp.status == 200) {
            callback(xmlhttp, xmlhttp.responseText, true);
        }
        else {
            callback(xmlhttp, xmlhttp.responseText, false);
        }
    }

    xmlhttp.send(this.getParamData(data));
    return xmlhttp;
};

fjs.Ajax.prototype.abort  = function(xhr) {
    if (xhr && xhr.readyState != fjs.Ajax.REQUEST_COMPLETED) {
        xhr.aborted = true;
        xhr.abort();
    }
};

