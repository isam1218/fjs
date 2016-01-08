hudweb.service('GroupService', ['$q', '$rootScope', '$routeParams', 'ContactService', 'HttpService', 'SettingsService', function($q, $rootScope, $routeParams, contactService, httpService, settingsService) {
	var service = this;
	var deferred = $q.defer();
	var deferredSingle = $q.defer();
	var deferredIsMine = $q.defer();
	
	var groups = [];
	var members = [];
	var favorites = {};
	var favoriteID;
	var mine;
	var isMine;		
	
	service.getGroup = function() {	
		deferredSingle = $q.defer();
		return deferredSingle.promise;
	};
	
	service.isMine = function() {	
		return deferredIsMine.promise;
	};
	
	service.getGroupById = function(id) {
		for (var i = 0, len = groups.length; i < len; i++) {
			if (groups[i].id == id)
				return groups[i];
		}
		
		return null;
	};
	
	service.getGroups = function() {		
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
	$rootScope.$on("isMine", function(event, data) {	
		deferredIsMine.resolve(data);
	});
	
	$rootScope.$on("groups_loaded", function(event, data) {
		    groups = data;
			$rootScope.$apply(deferred.resolve(data));
	});
	
	$rootScope.$on("single_group_loaded", function(event, data) {	
		for(var key in data) 
		     var groupId  = key;
		
		    members = data[groupId];	
		    var newData = [];
		    
		    if(!deferredSingle)
				deferredSingle = $q.defer();
		    else{
		    	if(deferredSingle.promise.$$state)
		    	{
		    		var stateObj = deferredSingle.promise.$$state;
		    		if(stateObj.status && stateObj.status == 1)
		    			deferredSingle = $q.defer();
		    	}	
		    }
		    
		    
		    if(members.length > 0)
		    {
			    contactService.getContacts().then(function(data) {
			    	var length = data.length;
			    	var mLen = members.length;			    	 
			    	
			    	for(var l = 0; l < length; l++)
			    	{
			    		var contact = data[l];
			    		for(var n = 0; n < mLen; n++)
			    		{
			    			var member = members[n];
			    			if(member ==  contact.id)
			    			{
			    				newData.push(contact);
			    			}		    						    			
			    		}	
			    	}
			    	
			    	if(members.length > newData.length){
			    		var memLen = members.length;
			    		for(var j=0; j < memLen; j++)
			    		{
			    			var member = members[j];
			    			if(member == $rootScope.meModel.fullProfile.id)
				    			newData.push($rootScope.meModel.fullProfile);
			    		}				    		
			    	}
	    				
			    	deferredSingle.resolve(newData);
			    });	
		    }
		    else
		    {		    	
		    	deferredSingle.resolve(members);
		    }
		    	
	});
}]);