fjs.hud.groupService = function($rootScope) {	
	var groups = [];
	var favorites = {};
	var favoriteID;
	var mine = null;
	
	var formatData = function() {
		// format data that controller needs
		return {
			groups: groups,
			favorites: favorites,
			mine: mine
		};
	};
	
	/**
		SYNCING
	*/

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
		
		$rootScope.$broadcast('groups_updated', formatData());
	});
	
	$rootScope.$on('groupcontacts_synced', function(event, data) {
		// need to add members to each group
		for (i = 0; i < groups.length; i++) {
			groups[i].members = [];
			
			for (key in data) {
				if (data[key].groupId == groups[i].xpid) {
					groups[i].members.push(data[key].contactId);
					
					// add to favorites object
					if (data[key].groupId == favoriteID)
						favorites[data[key].contactId] = 1;
					
					// mark as mine
					if (!mine && data[key].contactId == $rootScope.myPid)
						mine = groups[i];
				}
			}
		}
		
		$rootScope.$broadcast('groups_updated', formatData());
	});
}