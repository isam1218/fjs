hudweb.service('SettingsService', ['$q', '$rootScope', 'HttpService','ContactService', function($q, $rootScope, httpService,contactService) {	
	var deferred = $q.defer();
	var settings = {};
	var weblaunchers = [];
	var weblauncher_variables = [];
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

/*business_phone: ""
chat_custom_status: ""
chat_status: "away"
cp_location: "cp52-2"
current_location: "0_78577"
display_name: "The Bug Guy Von"
fdp_version: "3.7.0.010642"
fon_core: "1.6.0.28-samy-r118(3.7.0.009943)"
license: "mobility pack"
missed_calls_count: "1"
mobile: ""
my_department: "1000023b0_292894"
my_jid: "9136_3024@s9136.pbxtra.fonality.com"
my_phone_location: "0_78577"
my_pid: "1000023b0_1180903"
parker_number: "9000"
personal_permissions: "12290"
phone_config_device: "HUD_FOR_EXT3085-9136"
phone_config_domain: "s9136.pbxtra.fonality.com"
phone_config_port: "5060"
phone_config_proxy: "s9136.pbxtra.fonality.com,s9136i.pbxtra.fonality.com,s9136x.pbxtra.fonality.com"
phone_config_red5_url: "red5.fonality.com"
phone_config_secret: "U5KHoR8sqs6t"
phone_config_security_rtp: "rtp"
phone_config_username: "HUD_FOR_EXT3085-9136"
primary_extension: "3024"
primary_location: "0_76185"
primary_vm_box: "3024"
queue_agent_logout_reason: ""
queue_agent_status: "login"
queue_list_login: "4294976432_13575,4294976432_13565"
queue_list_logout: ""
queue_list_permanent: "4294976432_13579"
server_id: "9136"
server_offline: "false"
server_version: "3.7.0.010660"
unread_chat_sessions_count: "1"
voicemail_message_count: "10"*/

/*%%username%%  Your username for accounts that require authentication
%%duration%%  The duration of your call in seconds
%%caller_name%%  Name of the party on the other end of the call
%%type%%  Call type: either "inbound", "outbound" or "queue"
%%my_extension%%  Your extension
%%caller_number%%  Number of the party on the other end of the call
%%password%%  Your password for accounts that require authentication
%%caller_number_raw%%  %%caller_number%% stripped for all non-numerical characters*/


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