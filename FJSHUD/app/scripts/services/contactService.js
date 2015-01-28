fjs.hud.contactService = function($q, $rootScope, myHttpService) {
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
		// initial sync
		if (contacts.length < 1) {
			contacts = data;
			deferred.resolve(contacts);
			$rootScope.loaded = true;
			
			// add avatar to each contact
			for (i = 0; i < contacts.length; i++) {
				contacts[i].getAvatar = function(size) {
					return myHttpService.get_avatar(this.xpid, size, size); 
				};
			}
		}
		else {
			for (i = 0; i < data.length; i++) {	
				for (c = 0; c < contacts.length; c++) {
					// found contact
					if (contacts[c].xpid == data[i].xpid) {
						// update or delete
						if (data[i].xef001type == 'delete')
							contacts.splice(c, 1);
						else
							contacts[c] = data[i];
							
						break;
					}
					
					// no match, so new record
					if (c == contacts.length-1)
						contacts.push(data[i]);
				}
			}
		}
		
		$rootScope.$broadcast('contacts_updated', contacts);
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
}