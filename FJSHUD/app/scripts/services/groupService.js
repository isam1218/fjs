hudweb.service('GroupService', ['$q', '$rootScope', function($q, $rootScope) {	
	var deferred = $q.defer();
	var groups = [];
	var favorites = {};
	var favoriteID;
	var mine = null;
	
	this.getGroup = function(xpid) {
		for (i = 0; i < groups.length; i++) {
			if (groups[i].xpid == xpid)
				return groups[i];
		}
		
		return null;
	};
	
	this.getGroups = function() {
		// waits until data is present before sending back
		return deferred.promise;
	};
	
	this.isMine = function(xpid) {
		if (mine)
			return (xpid == mine.xpid);
		else
			return false;
	};

	var doesMemberExist = function(group,contact){
		if(group.members){
			for(member in group.members){
				if(group.members[member].contactId  == contact.contactId){
					return true;
				}
			}

			return false;
		}
	};
	
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
		for (key in data) {			
			for (i = 0; i < groups.length; i++) {
				if (!groups[i].members)
					groups[i].members = [];
			
				// add member to groups
				if (data[key].groupId == groups[i].xpid) {
					if(!doesMemberExist(groups[i],data[key])){
						groups[i].members.push(data[key]);
					}
					// add to favorites object
					if (data[key].groupId == favoriteID)
						favorites[data[key].contactId] = 1;
					
					// mark as mine
					if (!mine && data[key].contactId == $rootScope.myPid)
						mine = groups[i];
						
					break;
				}
				// delete member
				else if (data[key].xef001type == 'delete') {
					for (m = 0; m < groups[i].members.length; m++) {
						if (data[key].xpid == groups[i].members[m].xpid) {
							// was this a favorite?
							if (groups[i].xpid == favoriteID)
								delete favorites[groups[i].members[m].contactId];
								
							// delete from main group regardless
							groups[i].members.splice(m, 1);
							
							break;
						}
					}
				}
			}
		}
		
		$rootScope.$broadcast('groups_updated', formatData());
	});
}]);