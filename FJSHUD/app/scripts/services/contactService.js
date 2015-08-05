hudweb.service('ContactService', ['$q', '$rootScope', 'HttpService', function($q, $rootScope, httpService) {
	var deferred = $q.defer();	
	var contacts = [];
	var service = this;

	service.getContact = function(xpid) {
		for (var i = 0, len = contacts.length; i < len; i++) {
			if (contacts[i].xpid == xpid)
				return contacts[i];
		}
		
		return null;
	};
	
	service.getContacts = function() {
		// waits until data is present before sending back
		return deferred.promise;
	};
	
	/**
		SYNCING
	*/

	$rootScope.$on('contacts_synced', function(event, data) {
		// first time
		if (contacts.length == 0) {
			contacts = data;
			
			// add avatars
			for (var i = 0, len = contacts.length; i < len; i++) {
				contacts[i].getAvatar = function(size) {
					return httpService.get_avatar(this.xpid, size, size, this.icon_version); 
				};
			}
		}
		else {
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				var match = false;
					
				for (var c = 0, cLen = contacts.length; c < cLen; c++) {
					if (contacts[c].xpid == data[i].xpid) {
						// contact was deleted
						if (data[i].xef001type == 'delete') {
							contacts.splice(c, 1);
							cLen--;
						}
						// regular update
						else
							angular.extend(contacts[c], data[i]);
						
						match = true;
						break;
					}
				}
				
				// add new contact
				if (!match && data[i].xef001type != 'delete') {
					contacts.push(data[i]);
					
					// add avatar
					contacts[contacts.length-1].getAvatar = function(size) {
						return httpService.get_avatar(this.xpid, size, size, this.icon_version); 
					};
				}
			}
		}
		
		// retrieve child data
		/*httpService.getFeed('contactstatus');
		httpService.getFeed('calls');
		httpService.getFeed('contactpermissions');*/
	});
	
	$rootScope.$on('contactstatus_synced', function(event, data) {
		for (var c = 0, cLen = contacts.length; c < cLen; c++) {
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				// set contact's status
				if (contacts[c].xpid == data[i].xpid) {
					contacts[c].contact_status = data[i];
					contacts[c].hud_status = data[i].xmpp;
					contacts[c].queue_status = data[i].queueStatus;
					contacts[c].custom_status = data[i].xmppCustom;
					contacts[c].device_status = data[i].deviceStatus;
					
					break;
				}
			}
		}
	});
	
	$rootScope.$on('calls_synced', function(event, data) {
		for (var c = 0, cLen = contacts.length; c < cLen; c++) {
			contacts[c].call = null;
			
			// find caller
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				if (contacts[c].xpid == data[i].xpid && data[i].xef001type != 'delete') {
					contacts[c].call = data[i];
					
					// attach full profile, if present
					if (data[i].contactId)
						contacts[c].call.fullProfile = angular.copy(service.getContact(data[i].contactId));
					
					break;
				}
			}
			
			if (contacts[c].call) {
				contacts[c].call.bargers = [];
			
				// find people barging call
				for (var i = 0, iLen = data.length; i < iLen; i++) {
					if (data[i].barge > 0 && data[i].xpid != contacts[c].xpid && (data[i].contactId == contacts[c].call.xpid || data[i].contactId == contacts[c].call.contactId)) {
						contacts[c].call.bargers.push(service.getContact(data[i].xpid));
					}
				}
			}
		}
	});
	
	$rootScope.$on('calldetails_synced', function(event, data) {
		for (var c = 0, cLen = contacts.length; c < cLen; c++) {
			if (contacts[c].call) {
				for (var i = 0, iLen = data.length; i < iLen; i++) {
					if (contacts[c].xpid == data[i].xpid) {
						contacts[c].call.details = data[i];
						break;
					}
				}
			}
		}
	});
	
    $rootScope.$on("fdpImage_synced", function(event,data) {
		for (var c = 0, cLen = contacts.length; c < cLen; c++) {
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				// update avatar version
				if (data[i].xpid == contacts[c].xpid) {
					contacts[c].icon_version = data[i].xef001iver;
					break;
				}
			}
		}
    });

	$rootScope.$on('contactpermissions_synced', function(event, data){
		for (var i = 0, iLen = contacts.length; i < iLen; i++){
			for (var j = 0, jLen = data.length; j < jLen; j++){
				if (contacts[i].xpid == data[j].xpid && data[j].permissions){
					contacts[i].permissions = data[j].permissions;					
					break;
				}
			}
		}
		
		deferred.resolve(contacts);
	});


}]);