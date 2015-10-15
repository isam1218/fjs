hudweb.service('SettingsService', ['$q', '$rootScope', 'HttpService', 'ContactService', function($q, $rootScope, httpService, contactService) {	
	var service = this;
	
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
	
	service.getSettings = function() {
		// waits until data is present before sending back
		return deferSettings.promise;
	};

	service.getSetting = function(setting_key){
		return settings[setting_key];
	};

	service.setSetting = function(key,value){
		settings[key] = value;
	};
	
	service.getPermissions = function() {
		// waits until data is present before sending back
		return deferPermissions.promise;
	};
	
	service.getPermission = function(key) {
		return permissions[key];
	};

	service.getActiveWebLauncher = function(){
		return weblaunchers.filter(function(item){
			return item.id == settings['hudmw_launcher_config_id'];
		})[0];
	};
	
	service.reset_app_menu = function(){
		var data = {};
		$rootScope.$broadcast('reset_app_menu', data);
	};

	service.enable_box = function(){
		// console.error('in setting service');
		$rootScope.$broadcast('enable_box', {});
	};

	service.getMe = function(){
		return deferMe.promise;	
	};
	
	service.getWl = function(){
		return deferWl.promise;
	};

	service.formatWebString = function(url,call){
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
	
	service.isEnabled = function(permission, bit) {
		return ((permission & (1 << bit)) == 0);
	};

	/**
		SYNCING
	*/
	
	$rootScope.$on('me_synced', function(event,data){
        for(var i = 0, len = data.length; i < len; i++){
            $rootScope.meModel[data[i].propertyKey] = data[i].propertyValue;
			
			if(data[i].propertyKey == 'personal_permissions'){			
				// licenses from MyPermissions.java
				permissions.showCallCenter = service.isEnabled(data[i].propertyValue, 10);
				// Call Center license determines whether or not a user can record


				permissions.showIntellinote = service.isEnabled(data[i].propertyValue, 15);
				permissions.showZipwhip = service.isEnabled(data[i].propertyValue, 16);
				permissions.showZipwhip_Power = service.isEnabled(data[i].propertyValue, 17);
				permissions.showVideoCollab = service.isEnabled(data[i].propertyValue, 1);
				permissions.showIntellinote = service.isEnabled(data[i].propertyValue, 15);
				permissions.canTransferFrom = service.isEnabled(data[i].propertyValue, 4);

				// group permissions from MyPermissions.java
				permissions.recordingEnabled = service.isEnabled(data[i].propertyValue, 14);

				permissions.deleteMyRecordingEnabled = service.isEnabled(data[i].propertyValue, 15);
				permissions.deleteOtherRecordingEnabled = service.isEnabled(data[i].propertyValue, 16);

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
			
			// decode URLs
			for (var i = 0, len = weblaunchers.length; i < len; i++) {
				weblaunchers[i].inbound = weblaunchers[i].inbound.replace(/&amp;/g, '&');
				weblaunchers[i].outbound = weblaunchers[i].outbound.replace(/&amp;/g, '&');
			}
			
			deferWl.resolve(weblaunchers);
		}
    });
	
	$rootScope.$on('locations_synced', function(event,data){
	    for(var i = 0, iLen = data.length; i < iLen; i++){
				locations[data[i].xpid] = data[i];
				if(data[i].xpid == $rootScope.meModel.current_location){
					$rootScope.meModel.location = data[i];
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
			
			if(settings.hudmw_auto_away_timeout == undefined){
				settings.hudmw_auto_away_timeout = 240000;//30000;            	
            }
            if(settings.hudmw_searchautocleardelay == undefined){
            	settings.hudmw_searchautocleardelay = 30;
            }

            if(settings.avatar_hover_delay == undefined){
            	settings.avatar_hover_delay = 1;
            }

            if(settings.alert_show == undefined){
            	settings.alert_show = "true";
            }

            if(settings.alert_vm_show_new == undefined){
            	settings.alert_vm_show_new = "true";
            }

            if(settings.alert_call_incoming == undefined){
            	settings.alert_call_incoming = "true";
            }

            if(settings['alert_call_outgoing'] == undefined){
            	settings['alert_call_outgoing'] = "true";
            }

            if(settings['hudmw_show_alerts_always'] == undefined){
            	settings['hudmw_show_alerts_always'] = "false";
            }

            if(settings['hudmw_show_alerts_in_busy_mode'] == undefined){
            	settings['hudmw_show_alerts_in_busy_mode'] = "false";
            }
             if(settings['alert_call_display_for'] == undefined){
            	settings['alert_call_display_for'] = "all";
            }
           if(settings['alert_call_duration'] == undefined){
            	settings['alert_call_duration'] = "entire";
            }

            if(settings['hudmw_searchautocleardelay'] == undefined){
            	settings['hudmw_searchautoclear'] = "entire";
            }
          	if(settings['hudmw_box_enabled'] == undefined){
            	settings['hudmw_box_enabled'] = "true";
            }

            if(settings['hudmw_chat_sounds'] == undefined){
            	settings['hudmw_chat_sounds'] = "true";
            }
            if(settings['hudmw_chat_sound_received'] == undefined){
            	settings['hudmw_chat_sound_received'] = "true";
            }
             if(settings['hudmw_chat_sound_sent'] == undefined){
            	settings['hudmw_chat_sound_sent'] = "true";
            }

             if(settings['busy_ring_back'] == undefined){
            	settings['busy_ring_back'] = "false";
            }
			
			if(settings['use_column_layout'] == undefined){
            	settings['use_column_layout'] = "false";
            }
			if(settings['recent_call_history_length'] == undefined){
            	settings['recent_call_history_length'] = 50;
            }

            if(settings['queueWaitingThreshold'] == undefined){
            	settings['queueWaitingThreshold'] = 0;
            }
          
          	if(settings['queueAvgWaitThreshold'] == undefined){
            	settings['queueAvgWaitThreshold'] = 3;
            }
          if(settings['queueAvgTalkThresholdThreshold'] == undefined){
            	settings['queueAvgTalkThresholdThreshold'] = 20;
            }
          if(settings['queueAbandonThreshold'] == undefined){
            	settings['queueAbandonThreshold'] = 10;
            }
           
           deferSettings.resolve(settings);
			
			$rootScope.$evalAsync($rootScope.$broadcast('settings_updated', settings));
		}
	});

}]);
