hudweb.service('ContactService', ['$q', '$rootScope', 'HttpService', function($q, $rootScope, myHttpService) {
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
				return myHttpService.get_avatar(this.xpid, size, size); 
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
		for (key in data) {
			for (i = 0; i < contacts.length; i++) {
				// set contact's call status
				if (contacts[i].xpid == data[key].xpid) {
					contacts[i].call = data[key].xef001type == 'delete' ? null : contacts[i].call = data[key];
					
					break;
				}
			}
		}
		
		$rootScope.$broadcast('contacts_updated', contacts);
	});
}]);