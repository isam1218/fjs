hudweb.controller('ZipwhipController', ['$scope', '$rootScope', '$http', 'SettingsService', function($scope, $rootScope, $http, settingsService) {
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
			+ '&serverType=' + ($rootScope.meModel.server.indexOf('pbxtra') != -1 ? 'pbxtra' : 'trixbox')
			+ '&authToken=' + localStorage.authTicket;
		
		return url;
	};
	
	
	$scope.verifyLicense = function() {
		//window.open(getURL('loadApp'));


		  $http.get(fjs.CONFIG.SERVER.ppsServer + getURL('loginZipwhipURL') + '&workspaceId=').
				  success(function(data, status, headers, config) {
						  if (data && data.url) {
							window.open(data.url);
						}
						console.log("SUCCESS " + fjs.CONFIG.SERVER.ppsServer + getURL('loginZipwhipURL') + '&workspaceId=');

				  }).
				  error(function(data, status, headers, config) {
				    // called asynchronously if an error occurs
				    // or server returns response with an error status.
						console.log("NOT SUCCESS " + fjs.CONFIG.SERVER.ppsServer + getURL('loginZipwhipURL') + '&workspaceId=');

				  });
	};
}]);