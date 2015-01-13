
httpRequest = function(){
	/**
         * Versions servlet URL
         * @const {string}
         * @protected
         */
    this.VERSIONS_PATH = "/v1/versions";
        /**
         * Versionscache servlet URL
         * @const {string}
         * @protected
         */
    this.VERSIONSCACHE_PATH = "/v1/versionscache";
        /**
         * Client registry servlet URL
         * @const {string}
         * @protected
         */
    this.CLIENT_REGISRY_PATH = "/accounts/ClientRegistry";
        /**
         * Sync servlet URL
         * @const {string}
         * @protected
         */
    this.SYNC_PATH = "/v1/sync";

    this.SF_LOGIN_PATH = "/accounts/salesforce";


}
httpRequest.prototype.getXmlHttp = function() {
        /**
         * @type {XMLHttpRequest}
         */
        var xmlhttp;
        try {
            xmlhttp = new XMLHttpRequest();
        }
        catch (e) {
            try {
                xmlhttp = ActiveXObject('Msxml2.XMLHTTP');
            }
            catch (e1) {
                try {
                    xmlhttp = ActiveXObject('Microsoft.XMLHTTP');
                } catch (e2) {
                    xmlhttp = null;
                }
            }
        }
        return xmlhttp;
};

httpRequest.prototype.getParamData = function(data) {
      var paramStrings = [], keys = Object.keys(data);
      for (var i=0; i<keys.length; i++) {
          var key = keys[i];
          paramStrings.push(key + '=' + data[key]);
      }
      return paramStrings.join('&');
 };

httpRequest.prototype.makeRequest = function(url,method,data,headers,callback){


	   var xmlhttp = this.getXmlHttp();

        xmlhttp.open(method,url);

        xmlhttp.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');

        if (headers) {
            var keys = Object.keys(headers);
            for (var i=0; i<keys.length; i++) {
                var key = keys[i];
                xmlhttp.setRequestHeader(key,headers[key]);
            }
        }
        xmlhttp.onreadystatechange = function() {
			// waaaaiiiiiit!
            if (xmlhttp.readyState == 4) {
				if (callback) {
					try {
						if (xmlhttp.status === 200) {
							callback(xmlhttp, xmlhttp.responseText, true);
						}
						else {
							callback(xmlhttp, xmlhttp.responseText, false);
						}
					}
					catch (e) {

						callback(/**@type XMLHttpRequest*/{"status":0, responseText:"", aborted:true}, "", false);
					}
				}
			}
        };

        xmlhttp.send(this.getParamData(data));

        return xmlhttp;
}