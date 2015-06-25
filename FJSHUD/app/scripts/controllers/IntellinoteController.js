hudweb.controller('IntellinoteController', ['$scope', '$rootScope', '$http', 'SettingsService', function($scope, $rootScope, $http, settingsService) {
	$scope.addedContacts = [];
	$scope.workspaces = [];
	$scope.showInvite = false;
	$scope.inviteStatus = '';
	
	// pps url
	var getURL = function(action) {
		var url = 'https://pps1.stage3.arch.fonality.com:8443/pps/'
			+ action
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
		$.ajax({
			url: getURL('workspaceListString') + '&admin=1',
			dataType: "jsonp",
			jsonpCallback: 'JSON_CALLBACK',
			success: function(data) {
				if (data && data.workspace_list) {
					$scope.workspaces = data.workspace_list;
				}
			}
		});
	});
	
	$scope.verifyLicense = function() {
		//window.open(getURL('loadApp'));

		$http.get("https://pps-dev.fonality.com:8443/pps/loginURL?callback=JSON_CALLBACK&fonalityUserId=1624931&serverId=53035&serverType=pbxtra&authToken=8e4d52b47d967b8f51a90b10358c915159d87da65c4a2412&workspaceId=&callback=JSON_CALLBACK&_=1435254004816").
		  success(function(data) {
		  	if (data && data.url) {
					window.open(data.url);
				}
		    console.log("success");
		  }).
		  error(function(data, status, headers, config) {
		    console.log("error");

		  });
	};
	
	// from search contacts directive
    $scope.searchContact = function(contact) {
		// avoid dupes
        for (var i = 0; i < $scope.addedContacts.length; i++) {
			if (contact == $scope.addedContacts[i])
				return;
		}
		
        $scope.addedContacts.push(contact);
    };

    $scope.deleteContact = function(xpid){
        for (var i = 0; i < $scope.addedContacts.length; i++) {
            if ($scope.addedContacts[i].xpid == xpid) {
                $scope.addedContacts.splice(i, 1);
				break;
            }
        }
    };
	
	$scope.showList = function($event) {
		$event.stopPropagation();
		$scope.showInvite = true;
	};
	
	$scope.addToWorkspace = function(workspace) {
		$scope.showInvite = false;
		$scope.inviteStatus = '<img src="img/XLoading.gif" />';
		
		// get user ids
		var users = [];
		
		for (var i = 0; i < $scope.addedContacts.length; i++)
			users.push($scope.addedContacts[i].xpid.split('_')[1]);
		
		$.ajax({
			url: getURL('userListToWorkspaceString') + '&workspaceId=' + workspace.workspace_id + '&fonalityUserList=' + users.join(','),
			dataType: "jsonp",
			jsonpCallback: 'JSON_CALLBACK',
			success: function(data) {
				if (data && data.status) {
					if (data.status == 0)
						$scope.inviteStatus = 'All contacts were added.';
					else if (data.status == -1)
						$scope.inviteStatus = 'Failed to add contacts.';
					else if (data.user && data.user.length > 0) {
						// get list of failed contacts
						$scope.inviteStatus = 'The following users were not added: ';
						var users = [];
						
						for (var i = 0; i < data.user.length; i++) {
							for (var c = 0; c < $scope.addedContacts.length; c++) {
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
			}
		})
		.error(function() {
			$scope.inviteStatus = 'Failed to add contacts.';
		});
	};
}]);