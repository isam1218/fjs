hudweb.controller('InphonexController', ['$scope', '$rootScope', '$http', 'SettingsService', '$location','$analytics', function($scope, $rootScope, $http, settingsService, $location,$analytics) {
	/* NOTES:
	- will need to ping pps w/ post request, paramters, authToken, etc
	- JSON obj will be returned w/ "launchurl" key
	- dynamically load the src attribute of the iframe w/ javascript using...
	- document.getElementById('Inphonexiframe').src = JSONOBJECT.launchurl;
	*/
	
	// ***construct url to ping pps with...
	var getInphonexUrl = function(action){
		// does the order of parameters matter?
		// wrapping in promise so that doesn't break upon refresh of inphonex page (a reload w/o the promise results in the $rootScope.myPid not being generated in time)...
		settingsService.getSettings().then(function(data){
			var url = action 
			+ '?callback=JSON_CALLBACK' 
			+ '&authToken=' + localStorage.authTicket
			+ '&fonalityUserId' + $rootScope.myPid.split('_')[1] 
			+ '&serverId=' + $rootScope.meModel.server_id
			+ '&serverType=' + ($rootScope.meModel.my_jid.indexOf('pbxtra') != -1 ? 'pbxtra' : 'trixbox');

			return url;
		});
	};

	// ***make sure to pass correct url-argument into getInphoneUrl-function
	// ping pps server, which should send back user-specific url to log into inphonex iframe with...
	$http.post(fjs.CONFIG.SERVER.ppsServer + getInphonexUrl('inphonexURLGOESHERE!'))
		.success(function(data, status, headers, config){
			if (data && data.launchurl){
				// if launchurl is present -> dynamically load the src attribute of iframe
				console.log('Success: Loading inphonex url in iframe');
				document.getElementById('Inphonexiframe').src = data.launchurl;
			}
			// google analytics
			// ga('send', 'event', {eventCategory: 'Inphonex', eventAction: 'Access', eventLabel: 'Center Column'});
		})
		.error(function(data, status, headers, cofig){
			// console.error('error resulting from pinging pps for inphonex url | error message:  ', data.status, data.error);
			console.error("Error: Loading the following dummy-inphonex url in iframe - 'https://www.postqueue.com/fonality/#/JTg3JUFDJUE3JUU3JTk2diVDNSVFMyVGRiVEMSU3RSUxMyVEODIlODMlRDQlREYlOTMlOUIlQjJFJUZDJTFCdSVFMCU5MUVBJTBEJTFGbSUxOCVGMyUwMSUyOCVGOSUzRkglMTAlQ0ElODYlQzcuJTQwJTIzJUVDJTdDJUMy/summary'");
			document.getElementById('Inphonexiframe').src = 'https://www.postqueue.com/fonality/#/JTg3JUFDJUE3JUU3JTk2diVDNSVFMyVGRiVEMSU3RSUxMyVEODIlODMlRDQlREYlOTMlOUIlQjJFJUZDJTFCdSVFMCU5MUVBJTBEJTFGbSUxOCVGMyUwMSUyOCVGOSUzRkglMTAlQ0ElODYlQzcuJTQwJTIzJUVDJTdDJUMy/summary';
		});

	// ***if don't have inphonex permission -> redirect to settings/home url
	// settingsService.getPermissions().then(function(data){
	// 	if (!data.showInphonex)
	// 		$location.path('/settings/');
	// });

}]);
