hudweb.controller('PreferencesController', ['$scope', '$rootScope', '$http', 'HttpService','PhoneService','$routeParams','ContactService','$filter','$timeout','SettingsService', 'StorageService', 'ConferenceService', 'QueueService', 'GroupService','$modal','$modalInstance',
    function($scope, $rootScope, $http, myHttpService,phoneService,$routeParam,contactService,$filter,$timeout,settingsService, storageService, conferenceService, queueService, groupService,$modal,$modalInstance) {
    var context = this;
    var MAX_AUTO_AWAY_TIMEOUT = 2147483647;
    var soundManager;
    var settings = {};
    var queues = [];
    var callId = $routeParam.callId;
    $scope.phoneType = false;
    var queueThresholdUpdateTimeout;
    var weblauncherTimeout;
    var timer;
    var text;
    $scope.sortType = "Date";
    $scope.avatar ={};
    $scope.phoneType = false;
    $scope.settings = {};
    $scope.currentDevices = {};

    $scope.pbxtraVersion;
    $scope.hudserverVersion;
    $scope.fdpVersion;
    $scope.locations = {};
    $scope.call_obj = {};
    $scope.call_obj.phoneNumber = "";
    $scope.calls = {};
    $scope.onCall = false;
    /* */
    /**
    * used to determine what tab is selected in the me widget controller
    *
    */

    $scope.tabs = [
                   {label:$scope.verbage.general,option:'General',isActive:true},
                   /*{label:$scope.verbage.phone,option:'Phone',isActive:true},*/
                   {label:$scope.verbage.web_launcher,option:'Web Launcher',isActive:true},
                   {label:$scope.verbage.queues,option:'Queues',isActive:true},
                   {label:$scope.verbage.my_account,option:'Account',isActive:true},
                   {label:$scope.verbage.alerts,option:'Alerts',isActive:true},
                   {label:$scope.verbage.cp,option:'CP',isActive:true},
                   {label:$scope.verbage.about,option:'About',isActive:true},
                   ];

    settingsService.getSettings().then(function(data) {
		// grab settings from service (prevents conflict with dock)
		$scope.settings = settings = data;
		update_queues();
		update_settings();

		// localstorage logic
        $scope.globalXpid = $rootScope.myPid;
        $scope.selected = localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0];
        $scope.toggleObject = localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid]) : {item: 0};
        $scope.language = $rootScope.language || 'us';
    });

    $scope.closePreferences = function(){
        $modalInstance.close();

    };

    $scope.truncateLongString = function()
    {
    	return function(opt){
    		var truncated_name = opt.name;
    		var opt_name = opt.name;

    		if(opt.name.length > 20)
    			truncated_name = opt.name.substring(0, 19) + '...';
		    if(truncated_name == $scope.currentWebLauncher.name || opt_name == $scope.currentWebLauncher.name)
		    	opt.name =  truncated_name;
		    else
		    	opt.name = opt.orig_name;
		    return opt;
    	};
    };

    $scope.trancateSelectedName = function(){
    	if($scope.currentWebLauncher.name.length > 20)
    	{
    		$scope.currentWebLauncher.name = $scope.currentWebLauncher.name.substring(0, 19) + '...';
    	}
    };

    $scope.saveMeTab = function(tab, index){
        switch(tab){
            case "General":
                $scope.selected = $scope.tabs[0];
                localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                $scope.$parent.selected = $scope.selected;
                break;
/*            case "Phone":
                $scope.selected = $scope.tabs[1];
                localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                $scope.$parent.selected = $scope.selected;
                break;*/
            case "Web Launcher":
                $scope.selected = $scope.tabs[1];
                localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                $scope.$parent.selected = $scope.selected;
                break;
            case "Queues":
                $scope.selected = $scope.tabs[2];
                localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                $scope.$parent.selected = $scope.selected;
                break;
            case "Account":
                $scope.selected = $scope.tabs[3];
                localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                $scope.$parent.selected = $scope.selected;
                break;
            case "Alerts":
                $scope.selected = $scope.tabs[4];
                localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                $scope.$parent.selected = $scope.selected;
                break;
            case "CP":
                $scope.selected = $scope.tabs[5];
                localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                $scope.$parent.selected = $scope.selected;
                break;
            case "About":
                $scope.selected = $scope.tabs[6];
                localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                $scope.$parent.selected = $scope.selected;
                break;
        }
    };

	// only poll worker on subsequent page loads
	if (!$rootScope.isFirstSync) {
		myHttpService.getFeed('me');
		myHttpService.getFeed('queues');
		myHttpService.getFeed('weblauncher');
		myHttpService.getFeed('weblaunchervariables');
		myHttpService.getFeed('i18n_langs');
	}


    if(!phoneService.isPhoneActive()){
            for (var i = 0, iLen = $scope.tabs.length; i < iLen; i++) {
                if($scope.tabs[i].option == 'Phone'){
                    $scope.tabs[i].isActive = false;
                    break;
                }
            }
     }

    $scope.lastMillis = 0;

    $scope.languages;
    $scope.languageSelect;

    $scope.autoClearSettingOptions = [{id:1,value:30,label:'30 seconds'},
    {id:2,value:25,label:'25 Seconds'},
    {id:3,value:20,label:'20 Seconds'},
    {id:4,value:15,label:'15 Seconds'},
    {id:5,value:10,label:'10 Seconds'},
    {id:6,value:5,label:'5 Seconds'}];
    $scope.autoClearSelected;
    $scope.hoverDelayOptions = [{id:1,value:1.2,label:'1.2'},
    {id:2,value:1,label:'1.0'},
    {id:3,value:0.7, label:'0.7'},
    {id:4,value:0.5, label:'0.5'},
    {id:5,value:0.2, label:'0.2'},
    {id:6,value:0.0, label:'0.0'}];
    $scope.hoverDelaySelected;

    $scope.searchAutoClear;
    $scope.enableSound;
    $scope.soundOnChatMsgReceived;
    $scope.soundOnSentMsg;
    $scope.enableBusyRingBack;
    $scope.enableAutoAway;
    $scope.useColumnLayout;

    $scope.callLogSizeOptions = [{id:1,value:10,label:'10 items'},
    {id:2,value:20,label:'20 items'},
    {id:3,value:30,label:'30 items'},
    {id:4,value:40,label:'40 items'},
    {id:5,value:50,label:'50 items'},
    {id:6,value:60,label:'60 items'},
     {id:7,value:70,label:'70 items'},
    {id:8,value:80,label:'80 items'},
    {id:9,value:90,label:'90 items'},
    {id:10,value:100,label:'100 items'}];
    $scope.callLogSizeSelected;

    $scope.autoAwayOptions = [{id:1,value:30000,label:'30 Seconds'},
    {id:2,value:60000,label:'1 minute'},
    {id:3,value:120000,label:'2 minutes'},
    {id:4,value:240000,label:'4 minutes'},
    {id:5,value:360000, label:'6 minutes'},
    {id:6,value:600000, label:'10 minutes'},
    {id:7,value:900000,label:'15 minutes'},
    {id:8,value:1200000,label:'20 minutes'},
    {id:9,value:2400000,label:'40 minutes'}];
    $scope.autoAwaySelected;

    $scope.update_settings = function(type,action,model, currentObject){
        switch(type){
            case 'auto_away_timeout':
                if(model){
                    myHttpService.updateSettings(type,action,$scope.autoAwaySelected);
                }else{
                    myHttpService.updateSettings(type,action,MAX_AUTO_AWAY_TIMEOUT);
                }
                break;
            case 'hudmw_webphone_mic':
                myHttpService.updateSettings(type,action,model);
                phoneService.setMicSensitivity(model);
                break;
            case 'hudmw_webphone_speaker':
                myHttpService.updateSettings(type,action,model);
                phoneService.setVolume(model);
                break;
            case 'hudw_lang':
				if (model) {
					myHttpService.updateSettings(type,action,model.xpid);
					localStorage.fon_lang_code = model.code;
					location.reload();
				}
                break;
            case 'hudmw_searchautoclear':
                myHttpService.updateSettings(type, action, model);
                break;
            case 'hudmw_searchautocleardelay':
                myHttpService.updateSettings(type, action, model.value);
                break;
            case 'hudmw_launcher_config_id':
            	//$scope.truncateLongString();
            	$scope.currentWebLauncher = currentObject;
            	$scope.trancateSelectedName();
            	myHttpService.updateSettings(type,action,model);
            	break;
            default:
                myHttpService.updateSettings(type,action,model);
                break;

         }

    };

    $scope.queueSummaryStats = {};

    $scope.update_queue_treshold = function(type,value){
        if(queueThresholdUpdateTimeout){
            $timeout.cancel(queueThresholdUpdateTimeout);
        }
        queueThresholdUpdateTimeout = $timeout(function(){
            $scope.update_settings(type,'update',value);
            queueThresholdUpdateTimeout = undefined;
        },500);
    };

    var update_settings = function(){
        if($scope.meModel.my_jid){
            $scope.meModel.login = $scope.meModel.my_jid.split("@")[0];
            $scope.meModel.server = $scope.meModel.my_jid.split("@")[1];
        }
        if ($scope.meModel.my_department){
            var myDept = groupService.getGroup($scope.meModel.my_department);
            if (myDept)
                $scope.meModel.department = myDept.name;
        }

        if(settings){

           if(settings.hudmw_auto_away_timeout){
                var autoAwayOption = $scope.autoAwayOptions.filter(function(item){
                    return (item.value == settings['hudmw_auto_away_timeout']);
                });
                $scope.autoAwaySelected = autoAwayOption[0];
            }

            $scope.queueSummaryStats.waiting_calls = parseInt(settings['queueWaitingThreshold']);
            $scope.queueSummaryStats.avg_wait = parseInt(settings['queueAvgWaitThreshold']);
            $scope.queueSummaryStats.avg_talk = parseInt(settings['queueAvgTalkThresholdThreshold']);
            $scope.queueSummaryStats.abandoned = parseInt(settings['queueAbandonThreshold']);

            if(settings.auto_away_timeout && settings.auto_away_timeout != 2147483647){
                $scope.enableAutoAway = true;
            }else{
                $scope.enableAutoAway = false;
            }


            if(settings.hudmw_searchautocleardelay){
                var autoClearOption = $scope.autoClearSettingOptions.filter(function(item){
                    return (item.value == settings['hudmw_searchautocleardelay']);
                });
                $scope.autoClearSelected = autoClearOption[0];
            }

            if(settings['avatar_hover_delay']){
                var hoverDelaySelected = $scope.hoverDelayOptions.filter(function(item){
                    return (item.value == settings['avatar_hover_delay'])
                });
                $scope.hoverDelaySelected = hoverDelaySelected[0];
            }

            $scope.alertShow = settings['alert_show'] == "true";
            $scope.alertShowVM = settings['alert_vm_show_new'] == "true";
            $scope.alertShowIncoming = settings['alert_call_incoming'] == "true";
            $scope.alertShowOutgoing = settings['alert_call_outgoing'] == "true";
            $scope.alertOnAlways = settings['hudmw_show_alerts_always'] == "true";
            $scope.settings.alertOnBusy = settings['hudmw_show_alerts_in_busy_mode'] == "true";
            $scope.alertDisplayFor = settings['alert_call_display_for'];
            $scope.alertDuration = settings['alert_call_duration'];

            $scope.searchAutoClear = settings['hudmw_searchautoclear'] == "true";
            $scope.enableSound=settings['hudmw_chat_sounds'] == "true";
            $scope.soundOnChatMsgReceived=settings['hudmw_chat_sound_received'] == "true";
            $scope.soundOnSentMsg=settings['hudmw_chat_sound_sent'] == "true";
            $scope.enableBusyRingBack = settings['busy_ring_back'] == "true";

            $scope.useColumnLayout = settings['use_column_layout'] == 'true';
            var callLogSelected = $scope.callLogSizeOptions.filter(function(item){
                return (item.value==settings['recent_call_history_length']);
            });

            $scope.volume.micVol = parseFloat(settings['hudmw_webphone_mic']);
            $scope.volume.spkVol = parseFloat(settings['hudmw_webphone_speaker']);
            $scope.callLogSizeSelected = callLogSelected[0];

            if($scope.settings.queueWaitingThreshold){
                $scope.settings.queueWaitingThreshold = parseInt($scope.settings.queueWaitingThreshold);
            }
            if($scope.settings.queueAvgWaitThreshold){
                $scope.settings.queueAvgWaitThreshold = parseInt($scope.settings.queueAvgWaitThreshold);
            }
            if($scope.settings.queueAvgTalkThresholdThreshold){
                $scope.settings.queueAvgTalkThresholdThreshold = parseInt($scope.settings.queueAvgTalkThresholdThreshold);
            }
            if($scope.settings.queueAbandonThreshold){
                $scope.settings.queueAbandonThreshold = parseInt($scope.settings.queueAbandonThreshold);
            }

            if($scope.meModel.fon_core){
                $scope.pbxtraVersion = $scope.meModel["fon_core"];
            }
            if($scope.meModel.server_version){
                $scope.hudserverVersion = $scope.meModel["server_version"];
            }
            if($scope.meModel.fdp_version){
                $scope.fdpVersion = $scope.meModel["fdp_version"];
            }
        }
    };

    var alertFlags = {};

    $scope.selectAllBoxes = function(){
        // if user UNCHECKS --> deselect all other selected checkboxes + save what was selected to LS
        if ($scope.alertShow){
            // Show when status is "Busy"
            if ($scope.settings.alertOnBusy){
                $scope.settings.alertOnBusy = false;
                alertFlags.alertOnBusyFlag = "selected_before";
            }
            // Show when app is in focus
            if ($scope.alertOnAlways){
                $scope.alertOnAlways = false;
                alertFlags.alertOnAlwaysFlag = "selected_before";
            }
            // Show when new VM arrives
            if ($scope.alertShowVM){
                $scope.alertShowVM = false;
                alertFlags.alertShowVMFlag = "selected_before";
            }
            // Incoming Calls
            if ($scope.alertShowIncoming){
                $scope.alertShowIncoming = false;
                alertFlags.alertShowIncoming = "selected_before";
            }
            // Outgoing Calls
            if ($scope.alertShowOutgoing){
                $scope.alertShowOutgoing = false;
                alertFlags.alertShowOutgoing = "selected_before";
            }
            // Display For Bubbles
            switch($scope.alertDisplayFor){
                case "all":
                    alertFlags.alertDisplayFor = "all";
                    break;
                case "known":
                    alertFlags.alertDisplayFor = "known";
                    break;
                case "never":
                    alertFlags.alertDisplayFor = "never";
                    break;
            }
            // Duration
            switch($scope.alertDuration){
                case "entire":
                    alertFlags.alertDuration = "entire";
                    break;
                case "while_ringing":
                    alertFlags.alertDuration = "while_ringing";
                    break;
            }
            for (var i = 0, iLen = $scope.queues.length; i < iLen; i++){
                // if the ng-model for that particular queue Long Waiting Desktop Alert is set to true...
                if (settings['HUDw_QueueAlertsLW_' + $scope.queues[i].xpid]){
                    settings['HUDw_QueueAlertsLW_' + $scope.queues[i].xpid] = false;
                    alertFlags['HUDw_QueueAlertsLW_' + $scope.queues[i].xpid] = "selected_before";
                }
                // Abandoned Call Desktop Alerts
                if (settings['HUDw_QueueAlertsAb_' + $scope.queues[i].xpid]){
                    settings['HUDw_QueueAlertsAb_' + $scope.queues[i].xpid] = false;
                    alertFlags['HUDw_QueueAlertsAb_' + $scope.queues[i].xpid] = "selected_before";
                }
            }
            localStorage.alertFlags = JSON.stringify(alertFlags);
            $scope.alertShow = !$scope.alertShow;
            $scope.update_settings('alert_show','update',$scope.alertShow);
        }
        else{
            // if user CHECKS show alerts box -> load previously set checkboxes from LS and set those
            alertFlags = localStorage.alertFlags ? JSON.parse(localStorage.alertFlags) : {};
            if (alertFlags.alertOnBusyFlag == "selected_before")
                $scope.settings.alertOnBusy = true;

            if (alertFlags.alertOnAlways == "selected_before")
                $scope.alertOnAlways = true;

            if (alertFlags.alertShowVMFlag == "selected_before")
                $scope.alertShowVM = true;

            if (alertFlags.alertShowIncoming == "selected_before")
                $scope.alertShowIncoming = true;

            if (alertFlags.alertShowOutgoing == "selected_before")
                $scope.alertShowOutgoing = true;

            switch(alertFlags.alertDisplayFor){
                case "all":
                    $scope.alertDisplayFor = "all";
                    break;
                case "known":
                    $scope.alertDisplayFor = "known";
                    break;
                case "never":
                    $scope.alertDisplayFor = "never";
                    break;
            }
            switch(alertFlags.alertDuration){
                case "entire":
                    $scope.alertDuration = "entire";
                    break;
                case "while_ringing":
                    $scope.alertDuration = "while_ringing";
                    break;
            }
            for (var j = 0, jLen = $scope.queues.length; j < jLen; j++){
                if (alertFlags['HUDw_QueueAlertsLW_' + $scope.queues[j].xpid] == "selected_before")
                    settings['HUDw_QueueAlertsLW_' + $scope.queues[j].xpid] = true;
                if (alertFlags['HUDw_QueueAlertsAb_' + $scope.queues[j].xpid] == "selected_before")
                    settings['HUDw_QueueAlertsAb_' + $scope.queues[j].xpid] = true;
            }
            $scope.alertShow = !$scope.alertShow;
            $scope.update_settings('alert_show','update',$scope.alertShow);
        }
    };

    var update_queues = function(){
		if ($scope.settings && $scope.queues) {
			for (var i = 0, len = $scope.queues.length; i < len; i++) {
                var QueueNotificationsLW = $scope.settings['HUDw_QueueNotificationsLW_' + $scope.queues[i].xpid];
                var QueueAlertsLW = $scope.settings['HUDw_QueueAlertsLW_' + $scope.queues[i].xpid];
                var QueueNotificationsAb = $scope.settings['HUDw_QueueNotificationsAb_' + $scope.queues[i].xpid];
                var QueueAlertsAb = $scope.settings['HUDw_QueueAlertsAb_' + $scope.queues[i].xpid];

				$scope.settings['HUDw_QueueNotificationsLW_'+$scope.queues[i].xpid] = QueueNotificationsLW == "true" ? true : (QueueNotificationsLW == true ? QueueNotificationsLW : false);
				$scope.settings['HUDw_QueueAlertsLW_'+ $scope.queues[i].xpid] =  QueueAlertsLW == "true" ? true : (QueueAlertsLW == true ? QueueAlertsLW : false);
				$scope.settings['HUDw_QueueNotificationsAb_'+ $scope.queues[i].xpid] = QueueNotificationsAb == "true" ? true : (QueueNotificationsAb == true ? QueueNotificationsAb : false);
				$scope.settings['HUDw_QueueAlertsAb_'+ $scope.queues[i].xpid] = QueueAlertsAb == "true" ? true : (QueueAlertsAb == true ? QueueAlertsAb : false);

			}
		}
    };

    $scope.update_queue_settings = function(type,isActive){
        for (var i = 0, len = $scope.queues.length; i < len; i++) {
            $scope.settings[type +$scope.queues[i].xpid] = isActive;
            $scope.update_settings(type+$scope.queues[i].xpid,'update',isActive ? "true" : "false");
        }
    };
    $scope.currentWebLauncher = {};

    $scope.update_weblauncher_settings = function(){
        var data = {
            "id":$scope.currentWebLauncher.id,
            "launchWhenCallAnswered":$scope.currentWebLauncher.launchWhenCallAnswered,
            "inHref":$scope.currentWebLauncher.inbound,
            "inSilent":$scope.currentWebLauncher.inboundSilent,
            "inAuto":$scope.currentWebLauncher.inboundAuto,
            "inHHref":$scope.currentWebLauncher.inboundHangup,
            "inHSilent":$scope.currentWebLauncher.inboundHangupSilent,
            "inHAuto":$scope.currentWebLauncher.inboundHangupAuto,
            "outHref":$scope.currentWebLauncher.outbound,
            "outSilent":$scope.currentWebLauncher.outboundSilent,
            "outAuto":$scope.currentWebLauncher.outboundAuto,
            "outHHref":$scope.currentWebLauncher.outboundHangup,
            "outHSilent":$scope.currentWebLauncher.outboundHangupSilent,
            "outHAuto":$scope.currentWebLauncher.outboundHangupAuto,
        };

        myHttpService.sendAction("weblauncher","update",data);
    };

    $scope.update_weblauncher = function(){
        if(weblauncherTimeout){
            $timeout.cancel(weblauncherTimeout);
        }
        weblauncherTimeout = $timeout(function(){
            $scope.update_weblauncher_settings();
            weblauncherTimeout = undefined;
        }, 500, false);
    };

	// grab settings from service (prevents conflict with dock)
	settingsService.getSettings().then(function(data) {
		$scope.settings = settings = data;
		update_queues();
        update_settings();
        $scope.recentSelectSort = localStorage['MeWidget_RecentCalls_recentSelectSort_of_' + $rootScope.myPid] ? JSON.parse(localStorage['MeWidget_RecentCalls_recentSelectSort_of_' + $rootScope.myPid]) : 'Date';
        $scope.isAscending = localStorage['MeWidget_RecentCalls_isAscending_of_' + $rootScope.myPid] ? JSON.parse(localStorage['MeWidget_RecentCalls_isAscending_of_' + $rootScope.myPid]) : true;
	});

    $scope.$on('settings_updated',function(event,data){
        if (data){
			$scope.settings = settings = data;
			update_queues();
            update_settings();
        }
    });

    //this is needed to clear ng flow cache files for flow-files-submitted because ng flow will preserve previous uploads so the upload attachment will not receive it
    $scope.flow_cleanup = function($files){
        $scope.avatar.flow.cancel();
    };
    $scope.change_avatar = function($file){
        //$scope.avatar = $file;

        var data = {
            'action':'updateAvatar',
            'a.attachment':$file.file,
            'alt':"",
            "a.lib":"https://huc-v5.fonality.com/repository/fj.hud/1.3/res/message.js",
            "a.taskId": "1_0"
        };
        myHttpService.update_avatar(data);
    };


    settingsService.getWl().then(function(data){
        if(data){
            var activeWebLauncher = data.filter(function(item){
                return item.id == settings['hudmw_launcher_config_id'];
            });

            if (activeWebLauncher.length > 0){
                $scope.currentWebLauncher = activeWebLauncher[0];
            }else{
                //if no web launcher is set find the default web launcher and set it for the user
                for(var i = 0, iLen = data.length; i < iLen; i++){
                    if(data[i].id == "user_default"){
                        $scope.currentWebLauncher = data[i];
                        $scope.update_settings('hudmw_launcher_config_id','update',$scope.currentWebLauncher.id);
                    }
                }
            };

            for(var j = 0, jLen = data.length; j < jLen; j++){
            	data[j].orig_name = data[j].name;
            }
            $scope.weblauncher_profiles = data;
            $scope.trancateSelectedName();
        }
    });

    $scope.$on('weblaunchervariables_synced', function(event,data){
        if(data){
            $scope.weblaunchervariables = data;
        }

    });


    // this is for determining whether to show old transfer UI vs new transfer UI. If CP14 & cloud server --> show new transfer UI
    $scope.cpFourteen = false;
    $scope.serverVersionCloud = false;
    // only checking for cp14 (and fcs staging environments for dev testing) -> need to make sure to add checks for any new versions of CP that are released thereafter
    var possibleCpVersions = ["cp14"];

    $scope.$on("me_synced", function(event, data){
        for (var i = 0; i < data.length; i++){
            if (data[i].propertyKey == "cp_location"){
                var cpLocationParsed = data[i].propertyValue;
                var parseReturnsFcs = cpLocationParsed.indexOf('fcs') != -1 && cpLocationParsed.indexOf('fcs') == 0 ? true : false;
                // check for "cp14" or "fcs-stg3-cp" or "fcs-stg-cp", etc (1st three letters of cp_location propertyValue string will be 'fcs')

                for (var j = 0; j < possibleCpVersions.length; j++){
                    if (data[i].propertyValue == possibleCpVersions[j]){
                        $scope.cpFourteen = true;
                        break;
                    }
                }

                if (parseReturnsFcs)
                    $scope.cpFourteen = true;

            }
            if (data[i].propertyKey == "server_version"){
                var serverVersionSplit = data[i].propertyValue.split('.');
                var sv1 = serverVersionSplit[0];
                var sv2 = serverVersionSplit[1];
                var sv3 = serverVersionSplit[2];
                var sv4 = serverVersionSplit[3]
                // if (<3) or (<= 3-3.5) or (3.5.0-3.5.1)
                if ( (parseInt(sv1) < 3) || (parseInt(sv1) === 3 && parseInt(sv2) < 5) || (parseInt(sv1) === 3 && parseInt(sv2) === 5 && parseInt(sv3) < 1) )
                    $scope.serverVersionCloud = false;
                else
                    $scope.serverVersionCloud = true;

            }
        }
    });

    $scope.$on('i18n_langs_synced',function(event,data){
		if(data){
			var language_id;
			var default_language;
			$scope.languages = data;
		     if(localStorage.fon_lang_code){
				for (var i = 0, len = $scope.languages.length; i < len; i++) {


                    if($scope.languages[i].code == localStorage.fon_lang_code){
                        $scope.languageSelect = $scope.languages[i];
                        localStorage.fon_lang_code = $scope.languageSelect.code;
                		$rootScope.language = localStorage.fon_lang_code.split(".")[1];

                        break;
                    }
                }
             }else{
                for (var i = 0, len = data.length; i < len; i++) {
                    if($scope.languages[i].code == "lang.us"){
                           default_language = $scope.languages[i];
                    }

                    if($scope.languages[i].xpid == settings.hudw_lang){
                        $scope.languageSelect = $scope.languages[i];
                        localStorage.fon_lang_code = $scope.languageSelect.code;
                		$rootScope.language = localStorage.fon_lang_code.split(".")[1];
                        break;
                    }
                }
             }
             if($scope.languageSelect == undefined && default_language != undefined){
                 $scope.languageSelect = default_language;
                 localStorage.fon_lang_code = $scope.languageSelect.code;
         		 $rootScope.language = localStorage.fon_lang_code.split(".")[1];

                 myHttpService.updateSettings('hudw_lang','update',$scope.languageSelect.xpid);

             }
        }
	});


    $scope.$on("queues_synced", function(event,data){
        if(data && data != undefined){
            $scope.queues = data;
            $scope.queues = $scope.queues.sort(function(a,b){
                if(a.name < b.name){return -1;}
                else if(a.name > b.name){return 1;}
                else { return 0;}
            });
        }
        update_queues();
    });

    queueService.getQueues().then(function(data){
         if(data && data != undefined){
            $scope.queues = data.queues;
            $scope.queues = $scope.queues.sort(function(a,b){
                if(a.name < b.name){return -1;}
                else if(a.name > b.name){return 1;}
                else { return 0;}
            });
        }
        update_queues();
    });

}]);
