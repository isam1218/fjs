hudweb.service('GroupService', ['$q', '$rootScope', '$routeParams', 'ContactService', 'HttpService', 'SettingsService', function($q, $rootScope, $routeParams, contactService, httpService, settingsService) {
	var service = this;
	var deferred = $q.defer();
	var deferredSingle = $q.defer();
	
	var groups = [];
	var favorites = {};
	var favoriteID;
	var mine;
	var group = {};
	
	var getCurGroup = function()
	{
		var myObj = {};
		var body = {};
		var d = new Date();	
		if($rootScope.sock == null)
			$rootScope.sock = new WebSocket($rootScope.wsuri);	
		var current_user = settingsService.getMe().$$state.value;
		var my_id = current_user.my_pid;//.split('_')[1];		
		var server_id = current_user.server_id;			
		
	    myObj.reqType = "data/getUsersInGroup";						
		myObj.sender = 'U:'+ server_id + ':' + my_id;//"U:5549:126114";//serverId:current user id//156815		
		body.groupType = "group";
		body.groupId = $routeParams.groupId;
		body.serverId = server_id;		
		
		myObj.body = JSON.stringify(body);
		var json = JSON.stringify(myObj);	
		if($rootScope.sock != null)
			$rootScope.sock.send(json);	
		
	};
	
	var callSingleEmit = function(){};
	
	service.getSingleGroup = function()
	{     	    											
		settingsService.getMe().then(function(data) {  
		  var singlePromise = $q(function(resolve, reject) {
			  getCurGroup();
		  }).then(callSingleEmit);
		});		 				  		
	};  			
	
	service.getGroup = function() {		
		//deferredSingle = $q.defer();
		return deferredSingle.promise;
	};
	
	service.getGroupById = function(id) {
		for (var i = 0, len = groups.length; i < len; i++) {
			if (groups[i].id == id)
				return groups[i];
		}
		
		return null;
	};
	
	service.getGroups = function() {
		//deferred = $q.defer();
		// waits until data is present before sending back
		return deferred.promise;
	};
	
	service.removeGroup = function(xpid) {
		for (var i = 0, len = groups.length; i < len; i++) {
			if (groups[i].xpid == xpid) {
				groups.splice(i, 1);
				break;
			}
		}
	};
	
	service.isMine = function(xpid) {
		if (mine && mine.xpid == xpid)
			return true;
		else {
			for (var g = 0, gLen = groups.length; g < gLen; g++) {
				var group = groups[g];
				
				if (group.xpid == xpid) {
					for (var m = 0, mLen = group.members.length; m < mLen; m++) {
						if (group.members[m].contactId == $rootScope.myPid)
							return true;
					}
				}
			}
		}
		
		return false;
	};
	
	service.isFavorite = function(xpid) {
		if (favorites[xpid])
			return true;
		else
			return false;
	};

	service.isMember = function(group,contact){
		if(group.members){
			for(var m = 0, len = group.members.length; m < len; m++){
				if (group.members[m].contactId == contact || group.members[m].contactId == contact.contactId){
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
	
	$rootScope.$on("groups_loaded", function(event, data) {		
			groups = data;
			$rootScope.$apply(deferred.resolve(groups));
	});
	
	$rootScope.$on("single_group_loaded", function(event, data) {		
		    group = data;
			$rootScope.$apply(deferredSingle.resolve(group));
	});

	/*$rootScope.$on('groups_synced', function(event, data) {
		// first time
		if (groups.length == 0) {
			groups = data;
				
			for (var i = 0, len = groups.length; i < len; i++) {
				groups[i].members = [];
				groups[i].originator = '';
				
				// find favorites group
				if (groups[i].name.toLowerCase() == 'favorites')
					favoriteID = groups[i].xpid;
			
				// add avatars
				groups[i].getAvatar = function(index, size) {
					if (this.members && this.members[index] !== undefined)
						return httpService.get_avatar(this.members[index].contactId, size, size);
					else
						return 'img/Generic-Avatar-' + size + '.png';
				};
			}
		}
		else {
			// look for removals
			for (var g = 0, gLen = groups.length; g < gLen; g++) {
				var match = false;
				
				for (var i = 0, iLen = data.length; i < iLen; i++) {
					if (groups[g].xpid == data[i].xpid) {
						// group was deleted the right way
						if (data[i].xef001type == 'delete') {
							$rootScope.$broadcast('delete_gadget', 'GadgetConfig__empty_GadgetGroup_' + groups[g].xpid);
					
							groups.splice(g, 1);
							gLen--;
						}
						
						match = true;
						break;
					}
				}
				
				// group was deleted the lame way
				if (!match) {
					$rootScope.$broadcast('delete_gadget', 'GadgetConfig__empty_GadgetGroup_' + groups[g].xpid);
					
					groups.splice(g, 1);
					gLen--;
				}
			}

			// update or add
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				var match = false;
					
				for (var g = 0, gLen = groups.length; g < gLen; g++) {
					if (groups[g].xpid == data[i].xpid) {
						angular.extend(groups[g], data[i]);
						
						match = true;
						break;
					}
				}
				
				// add new group
				if (!match && data[i].xef001type != 'delete') {
					groups.push(data[i]);
					
					groups[groups.length-1].members = [];
					groups[groups.length-1].originator = '';
					
					// add avatar
					groups[groups.length-1].getAvatar = function(index, size) {
						if (this.members && this.members[index] !== undefined)
							return httpService.get_avatar(this.members[index].contactId, size, size);
						else
							return 'img/Generic-Avatar-' + size + '.png';
					};
				}
			}
		}
			
		// populate members via different feed
		httpService.getFeed('groupcontacts');
		httpService.getFeed('group_page_member');
	});
	
	$rootScope.$on('groupcontacts_synced', function(event, data) {
		for (var g = 0, gLen = groups.length; g < gLen; g++) {
			var group = groups[g];
			
			// check existing members first
			for (var m = 0, mLen = group.members.length; m < mLen; m++) {
				var match = false;
				
				for (var i = 0, iLen = data.length; i < iLen; i++) {
					if (data[i].xpid == group.members[m].xpid) {
						// keep member as is
						if (data[i].xef001type != 'delete')
							match = true;
							
						break;
					}
				}
				
				// remove member
				if (!match) {
					// was this a favorite?
					if (group.xpid == favoriteID)
						delete favorites[group.members[m].contactId];
						
					// delete from main group regardless
					group.members.splice(m, 1);
					mLen--;
				}
			}
		}
		
		for (var i = 0, iLen = data.length; i < iLen; i++) {
			// check for new members
			if (data[i].groupId) {
				for (var g = 0, gLen = groups.length; g < gLen; g++) {
					var group = groups[g];
					
					// add member to groups
					if (data[i].groupId == group.xpid) {
						if (!service.isMember(group, data[i].contactId)) {
							data[i].fullProfile = contactService.getContact(data[i].contactId);
							group.members.push(data[i]);
						}
						
						// add to favorites object
						if (data[i].groupId == favoriteID)
							favorites[data[i].contactId] = 1;
						// mark as mine
						else if (!mine && !group.ownerId && data[i].contactId == $rootScope.myPid)
							mine = group;
						
						break;
					}
				}
			}
		}
		
		deferred.resolve(formatData());
	});
	
	$rootScope.$on('grouppermissions_synced', function(event, data) {		
		for (var g = 0, gLen = groups.length; g < gLen; g++) {
			for (var i = 0, iLen = data.length; i < iLen; i++) {
				if (groups[g].xpid == data[i].xpid) {
					groups[g].permissions = data[i].permissions;
					break;
				}
			}
		}
	});
	
	$rootScope.$on('group_page_member_synced', function(event, data) {		
		for (var g = 0, gLen = groups.length; g < gLen; g++) {
			var group = groups[g];
			group.originator = '';
			
			for (var m = 0, mLen = group.members.length; m < mLen; m++) {
				var member = group.members[m];
				member.onPage = false;
				
				for (var i = 0, iLen = data.length; i < iLen; i++) {
					// is contact involved in page
					if (data[i].groupId == group.xpid) {
						// mark originator (may not be a member of this group)
						if (group.originator == '' && data[i].originator)
							group.originator = contactService.getContact(data[i].contactId).displayName;
						
						// is member and on page
						if (member.fullProfile.xpid == data[i].contactId)
							member.onPage = true;
					}
				}
			}
		}
	});*/
}]);