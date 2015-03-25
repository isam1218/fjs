hudweb.service('SettingsService', ['$q', '$rootScope', 'HttpService', function($q, $rootScope, httpService) {	
	var deferred = $q.defer();
	var settings = {};
	var weblaunchers = [];
	this.getSettings = function() {
		// waits until data is present before sending back
		return deferred.promise;
	};

	this.getSetting = function(setting_key){
		return settings[setting_key];
	}

	this.getActiveWebLauncher = function(){
		return weblaunchers.filter(function(item){
			return item.id == settings['hudmw_launcher_config_id'];
		})[0];
	}
	
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

	$rootScope.$on('weblauncher_synced', function(event,data){
        if(data){
           weblaunchers = data;
           $rootScope.$evalAsync($rootScope.$broadcast('weblauncher_updated', weblaunchers));
	
        }
    });
}]);