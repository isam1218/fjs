hudweb.service('SettingsService', ['$q', '$rootScope', 'HttpService', function($q, $rootScope, httpService) {	
	var deferred = $q.defer();
	var settings = {};
	
	this.getSettings = function() {
		// waits until data is present before sending back
		return deferred.promise;
	};
	
	/**
		SYNCING
	*/

	$rootScope.$on('settings_synced', function(event, data) {
		settings = {};
		
		// convert to object
		for (key in data)
			settings[data[key].key] = data[key].value;
		
		deferred = $q.defer();
		deferred.resolve(settings);
		
		$rootScope.$evalAsync($rootScope.$broadcast('settings_updated', settings));
	});
}]);