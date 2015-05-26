hudweb.service('SettingsService', ['$q', '$rootScope', 'HttpService', 'ContactService', function($q, $rootScope, httpService, contactService) {	
	var deferSettings = $q.defer();
	var deferPermissions = $q.defer();
	var deferMe = $q.defer();
	var deferWl = $q.defer();
	var settings = {};
	var permissions = {};
	var weblaunchers = [];
	var weblauncher_variables = [];
	var locations = {};	

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
		var data = {};
		$rootScope.$broadcast('reset_app_menu', data);
	};

	this.enable_box = function(){
		// console.error('in setting service');
		$rootScope.$broadcast('enable_box', {});
	};

	this.getMe = function(){
		return deferMe.promise;	
	};
	
	this.getWl = function(){
		return deferWl.promise;
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
	
	var isEnabled = function(permission, bit) {
		return ((permission & (1 << bit)) == 0);
	};

	/**
		SYNCING
	*/
	
<<<<<<< HEAD
	$rootScope.$on('me_synced', function(event,data){
        for(var i = 0, len = data.length; i < len; i++){
            $rootScope.meModel[data[i].propertyKey] = data[i].propertyValue;
			
			if(data[i].propertyKey == 'personal_permissions'){			
=======
	$rootScope.$on('me_synced', function(event, data) {
		for (var i = 0, len = data.length; i < len; i++) {
			// look at fj repository > MyPermissions.java for reference
			if (data[i].propertyKey == 'personal_permissions') {
				
>>>>>>> @clnielsen HUDF-290 addded holding and resuming call and added more semicolons
				// licenses from MyPermissions.java
				permissions.showCallCenter = isEnabled(data[i].propertyValue, 10);
				// Call Center license determines whether or not a user can record
				permissions.showVideoCollab = isEnabled(data[i].propertyValue, 1);
				permissions.showIntellinote = false; //isEnabled(data[i].propertyValue, 15);

				// group permissions from MyPermissions.java
				permissions.enableAgentLogin = isEnabled(data[i].propertyValue, 7);
				permissions.recordingEnabled = isEnabled(data[i].propertyValue, 14);
				permissions.deleteMyRecordingEnabled = isEnabled(data[i].propertyValue, 15);
				permissions.deleteOtherRecordingEnabled = isEnabled(data[i].propertyValue, 16);

				// // QUEUE PERMISSIONS... from QueuePermissions.java
				// permissions.isEditQueueDetailsEnabled = isEnabled(data[i].propertyValue, 2);
				// permissions.isViewQueueDetailsEnabled = isEnabled(data[i].propertyValue, 1);
				// // this is the same as showVideoCollab

				// // Call Permission from CallPermissions.java
				// permissions.isRecordEnabled = isEnabled(data[i].propertyValue, 0);
				deferPermissions.resolve(permissions);
            }
			// assign other useful goodies
			else if (data[i].propertyKey == 'my_pid') {
				$rootScope.myPid = data[i].propertyValue;
			}
			else if (data[i].propertyKey == 'my_jid'){
        		$rootScope.meModel.login = data[i].propertyValue.split("@")[0];
        		$rootScope.meModel.server = data[i].propertyValue.split("@")[1];
            }
        }

		$rootScope.meModel.location = locations[$rootScope.meModel.current_location];
		
        if($rootScope.meModel.login){
        	deferMe.resolve($rootScope.meModel);
		}
    });

    $rootScope.$on('weblauncher_synced', function(event,data){
    	if(data && data.length > 0){
			weblaunchers = data;
			deferWl.resolve(weblaunchers);
		}
    });
	
	$rootScope.$on('locations_synced', function(event,data){
    for(var i = 0, iLen = data.length; i < iLen; i++){
			locations[data[i].xpid] = data[i];
			if(data[i].xpid == $rootScope.meModel.current_location){
				$rootScope.meModel.location = data[i];
				break;	
			}
    }

        if($rootScope.meModel){
        	$rootScope.meModel.location = locations[$rootScope.meModel.current_location];
        }
    });

	$rootScope.$on('settings_synced', function(event, data) {
		if (data.length > 0) {
			// clear old object (but retain reference)
			for (var key in settings)
				delete settings[key];
			
			// convert new object
			for (var i = 0, len = data.length; i < len; i++)
				settings[data[i].key] = data[i].value;
			
			deferSettings.resolve(settings);
			
			$rootScope.$evalAsync($rootScope.$broadcast('settings_updated', settings));
		}
	});
}]);