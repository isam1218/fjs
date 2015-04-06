hudweb.service('SettingsService', ['$q', '$rootScope', 'HttpService','ContactService', function($q, $rootScope, httpService,contactService) {	
	var deferred = $q.defer();
	var settings = {};
	var weblaunchers = [];
	var weblauncher_variables = [];
	
	if(localStorage.fon_lang_code){
		var code = localStorage.fon_lang_code.split(".")[1]
		$rootScope.verbage = fjs.i18n[code];
		if(!$rootScope.verbage){
			$rootScope.verbage = fjs.i18n.us;
		}
	}
	
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
		
	this.formatWebString = function(url,call){
		var val = $rootScope.meModel;
		var me = contactService.getContact($rootScope.meModel.my_pid);
		//var callContact = contactService.getContact(call.contactId);
		var clean_number = call.phone.replace(/\D/g,'');
		url = url.replace('%%username%%',me.jid.split("@")[0]);
		url = url.replace('%%caller_name%%',call.displayName);
		if(call.incoming){
			url = url.replace('%%type%%',"inbound");
		}else{
			url = url.replace('%%type%%',"outbound");
			
		}
		url = url.replace('%%my_extension%%',me.primaryExtension);
		url = url.replace('%%caller_number%%',call.phone);
		url = url.replace('%%password%%','');
		url = url.replace('%%caller_number_raw%%',clean_number);
		return url;
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

	$rootScope.$on('i18n_langs_synced',function(event,data){
		if(data){
			
		}
		$rootScope.$evalAsync($rootScope.$broadcast('i18n_updated', data));
	
	});

	$rootScope.$on('weblaunchervariables_synced', function(event,data){
        if(data){
            weblauncher_variables = data;
        }

    });

	$rootScope.$on('weblauncher_synced', function(event,data){
        if(data){
           weblaunchers = data;
           $rootScope.$evalAsync($rootScope.$broadcast('weblauncher_updated', weblaunchers));
	
        }
    });
}]);