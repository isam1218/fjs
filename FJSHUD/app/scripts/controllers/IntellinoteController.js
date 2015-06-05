hudweb.controller('IntellinoteController', ['$scope', '$rootScope', '$http', 'HttpService', function($scope, $rootScope, $http, httpService) {
	
	$scope.verifyLicense = function() {
		// loginURL?
		window.open('https://pps1.stage3.arch.fonality.com:8443/pps/loadApp?'
			+ 'fonalityUserId=' + $rootScope.myPid.split('_')[1]
			+ '&serverId=' + $rootScope.meModel.server_id
			+ '&serverType=' + ($rootScope.meModel.server.indexOf('pbxtra') != -1 ? 'pbxtra' : 'trixbox')
			+ '&workspaceId=&authToken=' + localStorage.authTicket
		);
	};
}]);