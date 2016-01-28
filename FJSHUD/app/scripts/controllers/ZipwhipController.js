hudweb.controller('ZipwhipController', ['$scope', '$rootScope', '$http', 'SettingsService', '$location', function($scope, $rootScope, $http, settingsService, $location) {
	$scope.addedContacts = [];
	$scope.workspaces = [];
	$scope.showInvite = false;
	$scope.inviteStatus = '';
	
	// pps url
	var getURL = function(action) {

		var url = 
			 action
			+ '?callback=JSON_CALLBACK'
			+ '&fonalityUserId=' + $rootScope.myPid.split('_')[1]
			+ '&serverId=' + $rootScope.meModel.server_id
			+ '&serverType=' + ($rootScope.meModel.my_jid.indexOf('pbxtra') != -1 ? 'pbxtra' : 'trixbox')
			+ '&authToken=' + localStorage.authTicket;
		
		return url;
	};
	
	 settingsService.getPermissions().then(function(data) {
	    if(data.showZipwhip == false){
	      $location.path('/settings/');
	    }
	  });
	
	$scope.verifyLicense = function() {
		//window.open(getURL('loadApp'));


		  $http.post(fjs.CONFIG.SERVER.ppsServer + getURL('loginZipwhipURL') + '&workspaceId=').
				  success(function(data, status, headers, config) {
						  if (data && data.url) {
							window.open(data.url);
						}

				  }).
				  error(function(data, status, headers, config) {
				    // called asynchronously if an error occurs
				    // or server returns response with an error status.

				  });
	};
}]);