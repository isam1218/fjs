hudweb.service('SettingsService', ['$q', '$rootScope', 'HttpService','ContactService', function($q, $rootScope, httpService,contactService) {	
	var deferSettings = $q.defer();
	var deferPermissions = $q.defer();
	var settings = {};
	var permissions = {};
	var weblaunchers = [];
	var weblauncher_variables = [];
	
	if(localStorage.fon_lang_code){
		var code = localStorage.fon_lang_code.split(".")[1];
		$rootScope.verbage = fjs.i18n[code];
		$rootScope.fon_lang_code = code;
		if(!$rootScope.verbage){
			$rootScope.verbage = fjs.i18n.us;
		}
	}else{
		$rootScope.verbage = fjs.i18n.us;
	}
	
	this.getSettings = function() {
		// waits until data is present before sending back
		return deferSettings.promise;
	};

	this.getSetting = function(setting_key){
		return settings[setting_key];
	};
	
	this.getPermissions = function() {
		// waits until data is present before sending back
		return deferPermissions.promise;
	};
	
	this.getPermission = function(key) {
		return permissions[key];
	};

	this.getActiveWebLauncher = function(){
		return weblaunchers.filter(function(item){
			return item.id == settings['hudmw_launcher_config_id'];
		})[0];
	};
	
	this.reset_app_menu = function(){
		data = {};
		$rootScope.$broadcast('reset_app',data);
	};
	
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
	};

	/**
		SYNCING
	*/
	
	$rootScope.$on('me_synced', function(event, data) {
		// grab license permissions
		for (i = 0; i < data.length; i++) {
			if (data[i].propertyKey == 'personal_permissions') {
				// look at fj repository > MyPermissions.java for reference
				permissions.showCallCenter = ((data[i].propertyValue & (1 << 10)) == 0);
				permissions.showVideoCollab = ((data[i].propertyValue & (1 << 1)) == 0);
				
				deferPermissions.resolve(permissions);
				break;
			}
		}
	});

	$rootScope.$on('settings_synced', function(event, data) {
		settings = {};
		
		// convert to object
		for (key in data)
			settings[data[key].key] = data[key].value;
		
		deferSettings = $q.defer();
		deferSettings.resolve(settings);
		
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