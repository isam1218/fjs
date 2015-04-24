hudweb.service('GroupService', ['$q', '$rootScope', 'HttpService', function($q, $rootScope, httpService) {	
	var deferred = $q.defer();
	var groups = [];
	var favorites = {};
	var favoriteID;
	var mine = null;
	
	this.getGroup = function(xpid) {
		for (var i = 0, len = groups.length; i < len; i++) {
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
	
	this.isFavorite = function(xpid) {
		if (favorites[xpid])
			return true;
		else
			return false;
	};

	var doesMemberExist = function(group,contact){
		if(group.members){
			for(var m = 0, len = group.members.length; m < len; m++){
				if (group.members[m].contactId == contact.contactId){
					return true;
				}
			}
		}

		return false;
	};
	
	var formatData = function() {
		// format data that controller needs
		return {
			groups: groups,
			favorites: favorites,
			favoriteID: favoriteID,
			mine: mine
		};
	};
	
	/**
		SYNCING
	*/

	$rootScope.$on('groups_synced', function(event, data) {
		groups = data;
		deferred.resolve(groups);
			
		for (var i = 0, len = groups.length; i < len; i++) {
			// find favorites group
			if (groups[i].name.toLowerCase() == 'favorites')
				favoriteID = groups[i].xpid;
				
			// add avatar function
			groups[i].getAvatar = function(index, size) {
				if (this.members) {
					if (this.members[index] !== undefined) {
						var xpid = this.members[index].contactId;
						return httpService.get_avatar(xpid, size, size);
					}
					else
						return 'img/Generic-Avatar-' + size + '.png';
				}
				else
					return 'img/Generic-Avatar-' + size + '.png';
			};
		}
		
		// populate members via different feed
		httpService.getFeed('groupcontacts');
	});
	
	$rootScope.$on('groupcontacts_synced', function(event, data) {
		for (var i = 0, iLen = data.length; i < iLen; i++) {
			// delete member
			if (data[i].xef001type == 'delete') {
				for (var g = 0, gLen = groups.length; g < gLen; g++) {
					var group = groups[g];
					
					// no members, so skip to next
					if (!group.members)
						continue;
				
					for (var m = 0, mLen = group.members.length; m < mLen; m++) {
						if (data[i].xpid == group.members[m].xpid) {
							// was this a favorite?
							if (group.xpid == favoriteID)
								delete favorites[group.members[m].contactId];
								
							// delete from main group regardless
							group.members.splice(m, 1);
							
							break;
						}
					}
				}
			}
			// add member
			else {
				for (var g = 0, gLen = groups.length; g < gLen; g++) {
					if (!groups[g].members)
						groups[g].members = [];
				
					// add member to groups
					if (data[i].groupId == groups[g].xpid) {
						if (!doesMemberExist(groups[g],data[i]))
							groups[g].members.push(data[i]);
						
						// add to favorites object
						if (data[i].groupId == favoriteID)
							favorites[data[i].contactId] = 1;
						
						// mark as mine
						if (!mine && data[i].contactId == $rootScope.myPid)
							mine = groups[g];
							
						break;
					}
				}
			}
		}
		
		$rootScope.loaded.groups = true;
		$rootScope.$evalAsync($rootScope.$broadcast('groups_updated', formatData()));
	});
}]);