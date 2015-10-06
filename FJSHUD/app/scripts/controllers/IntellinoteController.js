hudweb.controller('IntellinoteController', ['$scope','$timeout', '$rootScope', '$http', 'SettingsService', function($scope,$timeout, $rootScope, $http, settingsService) {
	$scope.addedContacts = [];
	$scope.workspaces = [];
	$scope.showInvite = false;
	$scope.inviteStatus = '';
	$scope.disableInvite = true;
	
	$scope.myColor = {};
	$scope.myColor.myVar ='WorkspaceButtonEnabled';
	
	$scope.removeText = function(){
		$scope.inviteStatus = "";
	}
	$scope.checkContacts = function(){
		if($scope.addedContacts.length > 0){
    $scope.disableInvite = false;
    $scope.myColor.myVar ='WorkspaceButtonEnabled';
	}if($scope.addedContacts.length == 0){
    $scope.disableInvite = true;
    $scope.myColor.myVar ='WorkspaceButtonDisabled';
	}
	$scope.inviteStatus = "";
	}


	
	
	// pps url
	var getURL = function(action) {

		var url = 
			 action
			+ '?callback=JSON_CALLBACK'
			+ '&fonalityUserId=' + $rootScope.myPid.split('_')[1]
			+ '&serverId=' + $rootScope.meModel.server_id
			+ '&serverType=' + ($rootScope.meModel.server.indexOf('pbxtra') != -1 ? 'pbxtra' : 'trixbox')
			+ '&authToken=' + localStorage.authTicket;
		
		return url;
	};
	
	// init
	settingsService.getSettings().then(function() {
		// get workspaces

		$http.get(fjs.CONFIG.SERVER.ppsServer + getURL('workspaceList') + '&admin=1').
			  success(function(data, status, headers, config) {
			   if (data && data.workspace_list) {
								$scope.workspaces = data.workspace_list;
							}
							console.log("SUCCESS "+ fjs.CONFIG.SERVER.ppsServer + getURL('workspaceList') + '&admin=1');
			  }).
			  error(function(data, status, headers, config) {

							console.log("FAIL "+ fjs.CONFIG.SERVER.ppsServer + getURL('workspaceList') + '&admin=1');

			  });


	});
	
	$scope.verifyLicense = function() {
		//window.open(getURL('loadApp'));

		  $http.get(fjs.CONFIG.SERVER.ppsServer + getURL('loginURL') + '&workspaceId=').
				  success(function(data, status, headers, config) {
						  if (data && data.url) {
							window.open(data.url);
						}
						console.log("SUCCESS " + fjs.CONFIG.SERVER.ppsServer + getURL('loginURL') + '&workspaceId=');

				  }).
				  error(function(data, status, headers, config) {
   						console.log("FAIL " + fjs.CONFIG.SERVER.ppsServer + getURL('loginURL') + '&workspaceId=');

				  });
	};
	
	// from search contacts directive
  $scope.searchContact = function(contact) {
		// avoid dupes
    for (var i = 0, iLen = $scope.addedContacts.length; i < iLen; i++) {
			if (contact == $scope.addedContacts[i])
				return;
		}
		
    $scope.addedContacts.push(contact);
    if($scope.addedContacts.length > 0){
    $scope.disableInvite = false;
    $scope.myColor.myVar ='WorkspaceButtonEnabled';
	}if($scope.addedContacts.length == 0){
    $scope.disableInvite = true;
    $scope.myColor.myVar ='WorkspaceButtonDisabled';
	}
	
  };

  $scope.deleteContact = function(xpid){
	  for (var i = 0, iLen = $scope.addedContacts.length; i < iLen; i++) {
	  	if ($scope.addedContacts[i].xpid == xpid) {
	    	$scope.addedContacts.splice(i, 1);
				break;

	    }
	  }
	  if($scope.addedContacts.length > 0){
    $scope.disableInvite = false;
    $scope.myColor.myVar ='WorkspaceButtonEnabled';
	}if($scope.addedContacts.length == 0){
    $scope.disableInvite = true;
    //$scope.myColor.myVar ='WorkspaceButtonDisabled';
	}

  };
	
	$scope.showList = function($event,color) {

    
	
			$http.get(fjs.CONFIG.SERVER.ppsServer + getURL('workspaceList') + '&admin=1').
			  success(function(data, status, headers, config) {
			   if (data && data.workspace_list) {

								$scope.workspaces = data.workspace_list;
							}
					console.log("SUCCESS "+ fjs.CONFIG.SERVER.ppsServer + getURL('workspaceList') + '&admin=1');

			  }).
			  error(function(data, status, headers, config) {

				console.log("FAIL "+ fjs.CONFIG.SERVER.ppsServer + getURL('workspaceList') + '&admin=1');

			  });
		$event.stopPropagation();
		$scope.showInvite = true;	


	};


	
	$scope.addToWorkspace = function(workspace) {
		$scope.showInvite = false;
		$scope.inviteStatus = '<img src="img/XLoading.gif" />';
		
		// get user ids
		var users = [];
		
		for (var i = 0, iLen = $scope.addedContacts.length; i < iLen; i++)
			users.push($scope.addedContacts[i].xpid.split('_')[1]);
		

		$http.post(fjs.CONFIG.SERVER.ppsServer + getURL('userListToWorkspace') + '&workspaceId=' + workspace.workspace_id + '&fonalityUserList=' + users.join(',')).success(function(data) {
				console.log(data);
				if (data && data.status) {
					if (data.status == 0){
						$scope.inviteStatus = 'All contacts were added.';
						$scope.disableInvite = true;
					}
					else if (data.status == -1)
						$scope.inviteStatus = 'Failed to add contacts.';
					else if (data.user && data.user.length > 0) {
						// get list of failed contacts
						$scope.inviteStatus = 'The following users were not added: ';
						var users = [];
						
						for (var i = 0, iLen = data.user.length; i < iLen; i++) {
							for (var c = 0, cLen = $scope.addedContacts.length; c < cLen; c++) {
								if (data.user[i].user_Id == $scope.addedContacts[c].xpid.split('_')[1]) {
									users.push($scope.addedContacts[c].displayName);
									break;
								}
							}
						}
						
						$scope.inviteStatus += users.join(', ') + '.';
					}

					
				}
				
				$scope.addedContacts = [];

			}).
		error(function() {
			$scope.inviteStatus = 'Failed to add contacts.';
		});
	};
}]);