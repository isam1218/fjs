fjs.hud.contactService = function($q, $rootScope) {
	// required to deliver promises
	var deferred = $q.defer();
	
	var contacts = [];

	$rootScope.$on('contacts_synced', function(event, data) {
		// initial sync
		if (contacts.length < 1) {
			contacts = data;
			$rootScope.loaded = true;
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
		
		deferred.resolve(contacts);
	});
	
	$rootScope.$on('contactstatus_synced', function(event, data) {
		for (key in data) {
			for (c in contacts) {
				// set contact's status
				if (contacts[c].xpid == data[key].xpid) {
					contacts[c].hud_status = data[key].xmpp;
					break;
				}
			}
		}
		
		deferred.resolve(contacts);
	});
	
	$rootScope.$on('calls_synced', function(event, data) {
		for (key in data) {
			for (c in contacts) {
				// set contact's status
				if (contacts[c].xpid == data[key].xpid) {
					contacts[c].calls_startedAt = data[key].startedAt;
					break;
				}
			}
		}
		
		deferred.resolve(contacts);
	});
	
	return deferred.promise;
}