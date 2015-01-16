fjs.hud.groupService = function($q, $rootScope) {
	// required to deliver promises
	var deferred = $q.defer();
	
	// data to be sent back
	var service = {};
	service.groups = [];
	service.favorites = {};
	service.mine = null;
	
	// internal variables
	var favoriteID;

	$rootScope.$on('groups_synced', function(event, data) {
		// initial sync
		if (service.groups.length < 1) {
			service.groups = data;
			
			// find favorites group
			for (i = 0; i < data.length; i++) {
				if (data[i].name.toLowerCase() == 'favorites') {
					favoriteID = data[i].xpid;
					break;
				}
			}
		}
		
		deferred.resolve(service);
	});
	
	$rootScope.$on('groupcontacts_synced', function(event, data) {
		// need to add members to each group
		for (g in service.groups) {
			service.groups[g].members = [];
			
			for (key in data) {
				if (data[key].groupId == service.groups[g].xpid) {
					service.groups[g].members.push(data[key].contactId);
					
					// add to favorites object
					if (data[key].groupId == favoriteID)
						service.favorites[data[key].contactId] = 1;
					
					// mark as mine
					if (!service.mine && data[key].contactId == $rootScope.myPid)
						service.mine = service.groups[g];
				}
			}
		}
		
		deferred.resolve(service);
	});
	
	return deferred.promise;
}