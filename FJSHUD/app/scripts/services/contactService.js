hudweb.service('ContactService', ['$q', '$rootScope', 'NtpService', 'HttpService', function($q, $rootScope, ntpService, httpService) {
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
		for (var i = 0, iLen = data.length; i < iLen; i++) {
			var match = false;
			var contact;
				
			// initial sync doesn't need to do this comparison
			if (!$rootScope.isFirstSync) {
				for (var c = 0, cLen = contacts.length; c < cLen; c++) {
					if (contacts[c].xpid == data[i].xpid) {
						// contact was deleted
						if (data[i].xef001type == 'delete') {
							$rootScope.$broadcast('delete_gadget', 'GadgetConfig__empty_GadgetContact_' + contacts[c].xpid);
					
							contacts.splice(c, 1);
							cLen--;
						}
						// regular update
						else {
							angular.extend(contacts[c], data[i]);
							contact = contacts[c];
						}
						
						match = true;
						break;
					}
				}
			}
			
			// add new contact
			if (!match && data[i].xef001type != 'delete') {
				contacts.push(data[i]);
				contact = contacts[contacts.length-1];
			}
			
			// fill in missing meModel data
			if (data[i].xpid == $rootScope.myPid) {
				$rootScope.meModel.first_name = data[i].firstName;
				$rootScope.meModel.last_name = data[i].lastName;
				$rootScope.meModel.email = data[i].email;
				$rootScope.meModel.ims = data[i].ims;
			}
			
			// prevent blank name
			if (contact && contact.displayName == '' && contact.jid != '')
				contact.displayName = contact.jid;
		}
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
			var match = false;
			
			// find caller
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				if (contacts[c].xpid == data[i].xpid && data[i].xef001type != 'delete') {
					// recording status
					var time = 0;
					
					if (data[i].recorded) {
						// don't replace if already there
						if (contacts[c].call && contacts[c].call.recordedStartTime)
							time = contacts[c].call.recordedStartTime;
						else
							time = ntpService.calibrateTime(new Date().getTime());
					}
					else
						time = 0;
					
					// update call object
					if (contacts[c].call)
						angular.extend(contacts[c].call, data[i]);
					else
						contacts[c].call = data[i];
					
					contacts[c].call.recordedStartTime = time;
					
					// attach full profile, if present
					if (data[i].contactId)
						contacts[c].call.fullProfile = angular.extend({}, service.getContact(data[i].contactId));
					else
						contacts[c].call.fullProfile = null;
					
					match = true;
					break;
				}
			}
			
			// remove call object
			if (!match)
				contacts[c].call = null;
			else {
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
					
					// me
					if (data[i].xpid == $rootScope.myPid)
						$rootScope.meModel.icon_version = data[i].xef001iver;
					
					break;
				}
			}
		}
    });

	$rootScope.$on('contactpermissions_synced', function(event, data){
		for (var i = 0, iLen = contacts.length; i < iLen; i++){
			for (var j = 0, jLen = data.length; j < jLen; j++){
				if (contacts[i].xpid == data[j].xpid) {
					contacts[i].permissions = data[j].permissions;					
					break;
				}
			}
		}
		
		deferred.resolve(contacts);
	});


}]);