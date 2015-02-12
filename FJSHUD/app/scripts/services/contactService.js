hudweb.service('ContactService', ['$q', '$rootScope', 'HttpService', function($q, $rootScope, httpService) {
	var deferred = $q.defer();	
	var contacts = [];
	
	this.getContact = function(xpid) {
		for (i = 0; i < contacts.length; i++) {
			if (contacts[i].xpid == xpid)
				return contacts[i];
		}
		
		return null;
	};
	
	this.getContacts = function() {
		// waits until data is present before sending back
		return deferred.promise;
	};
	
	/**
		SYNCING
	*/

	$rootScope.$on('contacts_synced', function(event, data) {
		contacts = data;
		
		// initial sync
		if (!$rootScope.loaded) {
			deferred.resolve(contacts);
			$rootScope.loaded = true;
		}
		
		for (i = 0; i < contacts.length; i++) {
			// add avatar function
			contacts[i].getAvatar = function(size) {
				return httpService.get_avatar(this.xpid, size, size); 
			};
			
			// contact was deleted
			if (contacts[i].xef001type == 'delete')
				contacts.splice(i, 1);
		}
		
		// let other feeds push update
		httpService.getFeed('contactstatus');
		httpService.getFeed('calls');
	});
	
	$rootScope.$on('contactstatus_synced', function(event, data) {
		for (key in data) {
			for (i = 0; i < contacts.length; i++) {
				// set contact's status
				if (contacts[i].xpid == data[key].xpid) {
					contacts[i].hud_status = data[key].xmpp;
					contacts[i].queue_status = data[key].queueStatus;
					break;
				}
			}
		}
		
		$rootScope.$broadcast('contacts_updated', contacts);
	});
	
	$rootScope.$on('calls_synced', function(event, data) {
		for (i = 0; i < contacts.length; i++) {
			contacts[i].call = null;
			
			// find caller
			for (key in data) {
				if (contacts[i].xpid == data[key].xpid)
					contacts[i].call = data[key];
			}
			
			if (contacts[i].call) {
				contacts[i].call.bargers = [];
			
				// find people barging call
				for (key in data) {
					if (data[key].barge > 0 && data[key].xpid != contacts[i].xpid && (data[key].contactId == contacts[i].call.xpid || data[key].contactId == contacts[i].call.contactId)) {
						for (c = 0; c < contacts.length; c++) {
							if (contacts[c].xpid == data[key].xpid) {
								contacts[i].call.bargers.push(contacts[c]);
								break;
							}
						}
					}
				}
			}
		}
		
		$rootScope.$broadcast('contacts_updated', contacts);
	});
}]);