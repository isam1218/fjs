hudweb.controller('InphonexController', ['$scope', '$rootScope', '$http', 'SettingsService', '$location','$analytics', function($scope, $rootScope, $http, settingsService, $location,$analytics) {

	// ***construct url to ping pps with...
	var getInphonexUrl = function(action){

		var url = action 
		+ '?authToken=' + localStorage.authTicket
		+ '&fonalityUserId=' + $rootScope.myPid.split('_')[1] 
		+ '&serverId=' + $rootScope.meModel.server_id
		+ '&serverType=' + ($rootScope.meModel.my_jid.indexOf('pbxtra') != -1 ? 'pbxtra' : 'trixbox');

		return url;
	};

	// ***make sure to pass correct url-argument into getInphoneUrl-function
	// ping pps server, which should send back user-specific url to log into inphonex iframe with...
	// wrapping in promise so that doesn't break upon refresh of inphonex page (a reload w/o the promise results in the $rootScope.myPid not being generated in time)...
	settingsService.getSettings().then(function() {
		$http.post(fjs.CONFIG.SERVER.ppsServer + getInphonexUrl('inphonex/launchurl'))
			.success(function(data, status, headers, config){
				if (data && data.launchurl){
					// if launchurl is present -> dynamically load the src attribute of iframe
					console.log('Success: inphonex pps post request sent to - ', fjs.CONFIG.SERVER.ppsServer + getInphonexUrl('inphonex/launchurl'));
					console.log('Success: pps returns the following launch url to load in iframe - ', data.launchurl);
					document.getElementById('Inphonexiframe').src = data.launchurl;
				}
				// google analytics
				// ga('send', 'event', {eventCategory: 'Inphonex', eventAction: 'Access', eventLabel: 'Center Column'});
			})
			.error(function(data, status, headers, config){
				console.error('error resulting from pinging pps for inphonex url | error message:  ', data, status, headers, config);
				// console.error("Error: Loading the following dummy-inphonex url in iframe - 'https://www.postqueue.com/fonality/#/JTg3JUFDJUE3JUU3JTk2diVDNSVFMyVGRiVEMSU3RSUxMyVEODIlODMlRDQlREYlOTMlOUIlQjJFJUZDJTFCdSVFMCU5MUVBJTBEJTFGbSUxOCVGMyUwMSUyOCVGOSUzRkglMTAlQ0ElODYlQzcuJTQwJTIzJUVDJTdDJUMy/summary'");
				// document.getElementById('Inphonexiframe').src = 'https://www.postqueue.com/fonality/#/JTg3JUFDJUE3JUU3JTk2diVDNSVFMyVGRiVEMSU3RSUxMyVEODIlODMlRDQlREYlOTMlOUIlQjJFJUZDJTFCdSVFMCU5MUVBJTBEJTFGbSUxOCVGMyUwMSUyOCVGOSUzRkglMTAlQ0ElODYlQzcuJTQwJTIzJUVDJTdDJUMy/summary';
			});

	})


	// ^ maybe wrap above post request in this getPermissions promise rather than the getSettings promise so can kill 2 birds w/ 1 stone...
	// ***if don't have inphonex permission -> redirect to settings/home url
	// settingsService.getPermissions().then(function(data){
	// 	if (!data.showInphonex)
	// 		$location.path('/settings/');
	// });

}]);
