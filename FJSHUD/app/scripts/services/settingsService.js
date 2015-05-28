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
		$rootScope.$broadcast('reset_app_menu', data);
	};

	this.enable_box = function(){
		// console.error('in setting service');
		$rootScope.$broadcast('enable_box', {});
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
	
	$rootScope.$on('me_synced', function(event, data) {
		for (var i = 0, len = data.length; i < len; i++) {
			// look at fj repository > MyPermissions.java for reference
			if (data[i].propertyKey == 'personal_permissions') {
				// console.error('!prop value - ', data[i].propertyValue);
				
				// licenses from MyPermissions.java
				permissions.showCallCenter = isEnabled(data[i].propertyValue, 10);
				// Call Center license determines whether or not a user can record
				permissions.showVideoCollab = isEnabled(data[i].propertyValue, 1);

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
				break;
			}
		}
	});

	$rootScope.$on('callpermissions_synced', function(event, data){
		console.error('callperm synced - ', data);
	});

	$rootScope.$on('queuecallpermissions_synced', function(event, data){
		console.error('q call perm synced - ', data);
	});
	
	$rootScope.$on('settings_synced', function(event, data) {
		// convert to object
		for (key in data)
			settings[data[key].key] = data[key].value;
		
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