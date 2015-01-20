fjs.hud.groupService = function($q, $rootScope) {
	// required to deliver promises
	var deferred = $q.defer();
	
	var groups = [];
	var favorites = {};
	var favoriteID;
	var mine = null;
	
	var formatData = function(data) {
		// format data that controller needs
		return {
			groups: groups,
			favorites: favorites,
			mine: mine
		};
	};

	$rootScope.$on('groups_synced', function(event, data) {
		// initial sync
		if (groups.length < 1) {
			groups = data;
			
			// find favorites group
			for (i = 0; i < data.length; i++) {
				if (data[i].name.toLowerCase() == 'favorites') {
					favoriteID = data[i].xpid;
					break;
				}
			}
		}
		
		deferred.resolve(formatData());
	});
	
	$rootScope.$on('groupcontacts_synced', function(event, data) {
		// need to add members to each group
		for (g in groups) {
			groups[g].members = [];
			
			for (key in data) {
				if (data[key].groupId == groups[g].xpid) {
					groups[g].members.push(data[key].contactId);
					
					// add to favorites object
					if (data[key].groupId == favoriteID)
						favorites[data[key].contactId] = 1;
					
					// mark as mine
					if (!mine && data[key].contactId == $rootScope.myPid)
						mine = groups[g];
				}
			}
		}
		
		deferred.resolve(formatData());
	});
	
	return deferred.promise;
}