hudweb.controller('FonalityDialerController', ['$scope', '$rootScope', '$http', 'SettingsService', '$location','$analytics', function($scope, $rootScope, $http, settingsService, $location,$analytics) {
	


	var getURL = function(action) {

		var url = action 
		+ '?authToken=' + localStorage.authTicket
		+ '&fonalityUserId=' + $rootScope.myPid.split('_')[1] 
		+ '&serverId=' + $rootScope.meModel.server_id
		+ '&serverType=' + ($rootScope.meModel.my_jid.indexOf('pbxtra') != -1 ? 'pbxtra' : 'trixbox');

		return url;
	};
	
	 settingsService.getPermissions().then(function(data) {
	    if(data.showFonalityDialer == false){
	      $location.path('/settings/');
	    }
	  });
	
	$scope.verifyLicense = function() {


		  $http.post(fjs.CONFIG.SERVER.ppsServer + getURL('dialer/launchurl')).
				  success(function(data, status, headers, config) {
						  if (data && data.launchurl) {
							window.open(data.launchurl);
						}
						ga('send', 'event', {eventCategory:'FonalityDialer', eventAction:'Access', eventLabel: 'Center Column'});
				  }).
				  error(function(data, status, headers, config) {
				    // called asynchronously if an error occurs
				    // or server returns response with an error status.
				    alert('Error fetching Fonality Dialer data - check console for details.');
					console.error('error resulting from pinging pps for Fonality Dialer url | error message:  ', data, status, headers, config);
				  });
	};


}]);
