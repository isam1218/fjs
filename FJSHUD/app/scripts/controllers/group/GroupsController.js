hudweb.controller('GroupsController', ['$q', '$scope', '$rootScope', '$routeParams', 'HttpService', 'GroupService', 'ContactService', function($q, $scope, $rootScope, $routeParams, myHttpService, groupService, contactService) {
  $scope.query = "";
  $scope.sortField = "name";
  $scope.sortReverse = false;
  $scope.groups = [];
  $scope.mine = null;
  $scope.favoriteID = null;
  $scope.my_id = $rootScope.meModel.my_pid;//.split('_')[1];
  var my_id = $rootScope.meModel.my_pid;
  var contactId = $routeParams.contactId;	
  var server_id = $rootScope.meModel.server_id;

    //request group data
  $scope.getGroups = function()
  {      	    	
			var myObj = {};
			var body = {};
			var d = new Date();									
			
	        myObj.reqType = "data/getGroupsForServer";						
			myObj.sender = 'U:'+ server_id + ':' + my_id;//"U:5549:126114";//serverId:current user id//156815					
			body.serverId = server_id;
			body.groupType = "group";
			myObj.body = JSON.stringify(body);
			var json = JSON.stringify(myObj);			
			//$scope.sock.send(json);
			$rootScope.sock.send(json);
  };
  var promise = $q(function(resolve, reject) {
		$scope.getGroups();
  }).then(callEmit);
	
  var callEmit = function(){};
	
  // pull group updates from service, including groups from local storage
  groupService.getGroups().then(function(data) {
    //$scope.groups = data.groups;
    //$scope.mine = data.mine;
   // $scope.favoriteID = data.favoriteID;
	  $scope.groups = data;
  });   
  
  $scope.sort = function(field) {
      if($scope.sortField!=field) {
          $scope.sortField = field;
          $scope.sortReverse = false;
      }
      else {
          $scope.sortReverse = !$scope.sortReverse;
      }
  };
	
	// filter groups down
	/*$scope.customFilter = function(type) {
		return function(group) {
			// remove mine
			if (group != $scope.mine && $scope.favoriteID != group.xpid) {
				switch (type) {
					case 'all':
						return (group.type == 0);
						break;
					case 'mine':
						return (group.ownerId == $rootScope.myPid);
						break;
					case 'shared':
						// find groups i don't own but that i belong to
						if (group.ownerId != $rootScope.myPid && group.members) {
							for (var i = 0, iLen = group.members.length; i < iLen; i++) {
								if (group.members[i].contactId == $rootScope.myPid)
									return true;
							}
						}
						break;
					case 'others':
						if (group.type == 4 && group.ownerId != $rootScope.myPid) {
							for (var i = 0, iLen = group.members.length; i < iLen; i++) {
								if (group.members[i].contactId == $rootScope.myPid)
									return false;
							}
							
							return true;
						}
						break;
				}
			}
		};
	};*/

  $scope.searchFilter = function(){
    var query = $scope.$parent.query.toLowerCase();
	
    return function(group){
      if ((group.name || group.extension || group.description) && (group.name.toLowerCase().indexOf(query) != -1 || group.extension.indexOf(query) != -1 || group.description.toLowerCase().indexOf(query) != -1))
        return true;
      else if (group.members.length > 0){
        for (var i = 0, iLen = group.members.length; i < iLen; i++){
          var singleMember = group.members[i].fullProfile;
		  
          if (singleMember.fullName.toLowerCase().indexOf(query) != -1 || singleMember.primaryExtension.indexOf(query) != -1 || singleMember.primaryExtension.replace(/\D/g,'').indexOf(query) != -1 || singleMember.phoneMobile.indexOf(query) != -1 || singleMember.phoneMobile.replace(/\D/g,'').indexOf(query) != -1)
            return true;
        }
      }
    };
  };
	
	$scope.getOwner = function(group) {
		if (group.ownerId == $rootScope.myPid)
			return 'owner: me';
		else {
			var contact = contactService.getContact(group.ownerId);
			return (contact ? 'owner: ' + contact.displayName : '');
		}
	};

}]);