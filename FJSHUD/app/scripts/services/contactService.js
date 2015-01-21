fjs.hud.contactService = function($rootScope, myHttpService) {	
	var contacts = [];
	
	this.getContact = function(xpid) {
		for (i = 0; i < contacts.length; i++) {
			if (contacts[i].xpid == xpid)
				return contacts[i];
		}
	};
	
	/**
		SYNCING
	*/

	$rootScope.$on('contacts_synced', function(event, data) {
		// initial sync
		if (contacts.length < 1) {
			contacts = data;
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
					break;
				}
			}
		}
		
		$rootScope.$broadcast('contacts_updated', contacts);
	});
	
	$rootScope.$on('calls_synced', function(event, data) {
		for (key in data) {
			for (i = 0; i < contacts.length; i++) {
				// set contact's status
				if (contacts[i].xpid == data[key].xpid) {
					contacts[i].calls_startedAt = data[key].startedAt;
					break;
				}
			}
		}
		
		$rootScope.$broadcast('contacts_updated', contacts);
	});
}