hudweb.controller('MeWidgetController', ['$scope', '$rootScope', '$http', 'HttpService','PhoneService','$routeParams','ContactService','$filter','$timeout','SettingsService', 'StorageService', 
    function($scope, $rootScope, $http, myHttpService,phoneService,$routeParam,contactService,$filter,$timeout,settingsService, storageService) {
    var context = this;
    var MAX_AUTO_AWAY_TIMEOUT = 2147483647;
    var CALL_ON_HOLD = 3;
    var CALL_IN_PROGRESS = 2;
    var soundManager;
    var settings = {};
    var queues = [];
    var callId = $routeParam.callId;
    var queueThresholdUpdateTimeout;
    var weblauncherTimeout;
    var timer;
    var text;

    $scope.avatar ={};

    
    //we get the call meta data based on call id provided by the route params if tehre is no route param provided then we display the regular recent calls
    
    $scope.currentCall = phoneService.getCallDetail(callId);
  

    $scope.phoneState = phoneService.getPhoneState();
    $scope.timeElapsed = "00:00";
    
    $scope.getCurrentLocationTitle = function() {
        /**
         * @type {{name:string. phone:string}}
         */
        var currentLocation;
        if($scope.meModel["current_location"] && $scope.locations[$scope.meModel["current_location"]]) {        	 
             currentLocation = $scope.locations[$scope.meModel["current_location"]];
             
             if($scope.meModel["current_location"])
             {	
            	if(!$scope.settings) 
            		$scope.settings = {};
         		$scope.settings["current_location"] = currentLocation;
             }
             
             if(currentLocation.locationType != 'a' && currentLocation.locationType != 'w' && currentLocation.locationType != 'm')
            	 return currentLocation.shortName+" ("+currentLocation.phone+")";
             else
            	 return currentLocation.shortName;                          
         }
         else { 
        	 if($scope.settings && $scope.settings["current_location"])
        	    {
             	return $scope.setCurrentLocation($scope.settings["current_location"]);   		   
        	 }
        	 else
              return "Loading...";
         }
   		
    };

    $scope.setCurrentLocation = function(location){
    	var current_location = location;
       
        if(current_location.locationType != 'a' && current_location.locationType != 'w')
       	 return current_location.shortName+" ("+current_location.phone+")";
        else
       	 return current_location.shortName; 
    };
    
    var Months = ['January','February','March','April','May','June','July','August','October','September','November','December'];
    var Weekday = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

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
    {label:$scope.verbage.phone,option:'Phone',isActive:true},
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
    });

    $scope.saveMeTab = function(tab, index){
        switch(tab){
            case "General":
                $scope.selected = $scope.tabs[0];
                localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                $scope.$parent.selected = $scope.selected;
                break;
            case "Phone":
                $scope.selected = $scope.tabs[1];
                localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                $scope.$parent.selected = $scope.selected;
                break;
            case "Web Launcher":
                $scope.selected = $scope.tabs[2];
                localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                $scope.$parent.selected = $scope.selected;
                break;
            case "Queues":
                $scope.selected = $scope.tabs[3];
                localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                $scope.$parent.selected = $scope.selected;
                break;
            case "Account":
                $scope.selected = $scope.tabs[4];
                localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                $scope.$parent.selected = $scope.selected;
                break;
            case "Alerts":
                $scope.selected = $scope.tabs[5];
                localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                $scope.$parent.selected = $scope.selected;
                break;
            case "CP":
                $scope.selected = $scope.tabs[6];
                localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                $scope.$parent.selected = $scope.selected;
                break;
            case "About":
                $scope.selected = $scope.tabs[7];
                localStorage['MeWidgetController_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['MeWidgetController_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                $scope.$parent.selected = $scope.selected;
                break;
        }
    };

    $scope.recentCallToFunction = function(calllog){
        if (calllog.incoming)
            return calllog.incoming;
        else {
            $scope.makeCall(calllog.phone);
        }
    };

    $scope.recentSelectSort = 'Date';
    myHttpService.getFeed('me');
    myHttpService.getFeed('queues');
    myHttpService.getFeed('locations');
    myHttpService.getFeed('calllog');   
    myHttpService.getFeed('calls');    
    myHttpService.getFeed('weblauncher');    
    myHttpService.getFeed('weblaunchervariables');
    myHttpService.getFeed('i18n_langs');
   

    var phonePromise = phoneService.getDevices();
    

    if(!phoneService.isPhoneActive()){
            for (var i = 0, iLen = $scope.tabs.length; i < iLen; i++) {
                if($scope.tabs[i].option == 'Phone'){
                    $scope.tabs[i].isActive = false;
                    break;
                }
            }
    }


    phonePromise.then(function(data){
        
        if(!phoneService.isPhoneActive()){
            for (var i = 0, iLen = $scope.tabs.length; i < iLen; i++) {
                if($scope.tabs[i].option == 'Phone'){
                    $scope.tabs[i].isActive = false;
                    break;
                }
            }
        }
        
            $scope.inputDevices = data.filter(function(item){
                return item.input_count > 0;
            });
            soundManager = phoneService.getSoundManager();
            
            $scope.selectedInput = $scope.inputDevices.filter(function(item){
                 return item.id == soundManager.inpdefid; 
            })[0];
            

            $scope.outputDevices = data.filter(function(item){
                return item.output_count > 0;
            });
            
            $scope.selectedOutput = $scope.outputDevices.filter(function(item){
                 return item.id == soundManager.outdefid; 
            })[0];
            
            $scope.selectedRingput = $scope.outputDevices.filter(function(item){
                 return item.id == soundManager.ringdefid; 
            })[0];

            if($scope.selectedRingput == undefined){
                $scope.selectedRingput = $scope.outputDevices[0];
                $scope.updateAudioSettings($scope.selectedRingput.id,'Ring');
            }

            if($scope.selectedOutput == undefined){
                $scope.selectedOutput = $scope.outputDevices[0];
                $scope.updateAudioSettings($scope.selectedOutput.id,'Output');
            }
           if($scope.selectedInput == undefined){
                $scope.selectedInput = $scope.inputDevices[0];
                $scope.updateAudioSettings($scope.selectedInput.id,'Input');
            }
        
    });

    $scope.updateAudioSettings = function(value, type){
        switch(type){
            case 'Ring':
                phoneService.getSoundManager().ringdefid = value;   
                break;
            case 'Input':
                phoneService.getSoundManager().inpdefid = value;   
                break;
            case 'Output':
                phoneService.getSoundManager().outdefid = value;   
                break;
        }
    };

    
    
    /**
     * @type {{chat_status:{}, chat_custom_status:{}}}
     */
     /*

    May need to move the settings into its own seperate controller
     */
    $scope.chatStatuses = [{"title":$scope.verbage.available, "key":"available"}, {"title":$scope.verbage.away, "key":"away"}, {"title":$scope.verbage.busy, "key":"dnd"}];

    $scope.setChatStatus = function(chatStatus){
        myHttpService.sendAction("me", "setXmppStatus", {"xmppStatus":$scope.meModel.chat_status = chatStatus,"customMessage":$scope.meModel.chat_custom_status});
    };
    
    $scope.setCustomStatus = function() {
        $timeout.cancel(timer);
        timer = $timeout(function(){
            if ($scope.meModel.chat_custom_status.length >= 25)
                text = $scope.meModel.chat_custom_status.substr(0, 22) + '...';
            else
                text = $scope.meModel.chat_custom_status;
			
            myHttpService.sendAction("me", "setXmppStatus", {"xmppStatus":$scope.meModel.chat_status ,"customMessage":text});
        }, 3000, false);
    };

    this.getElementOffset = function(element) {
        if(element != undefined)
        {
            var box = null;
            try {
                box = element.getBoundingClientRect();
            }
            catch(e) {
                box = {top : 0, left: 0, right: 0, bottom: 0};
            }
            var body = document.body;
            var docElem = document.documentElement;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;
            var clientTop = docElem.clientTop || body.clientTop || 0;

            var left = box.left + scrollLeft - clientLeft;
            var top = box.top +  scrollTop - clientTop;
            return {x:left, y:top};
        }
    };

    this.getEventHandlerElement = function(target, event) {
      if(target.getAttribute("data-ng-"+event.type)) {
          return target;
      }
      else if(target.parentNode) {
          return this.getEventHandlerElement(target.parentNode, event);
      }
};

    $scope.showLocationsPopup = function(e) {
        e.stopPropagation();
        var eventTarget = context.getEventHandlerElement(e.target, e);
        var offset = context.getElementOffset(eventTarget);
        $scope.showPopup({key:"LocationsPopup", x:offset.x-60, y:offset.y}, eventTarget);
        return false;
    };

    $scope.showDialPad = function(e) {
        e.stopPropagation();
        var eventTarget = context.getEventHandlerElement(e.target, e);
        var offset = context.getElementOffset(eventTarget);
        $scope.showPopup({key:"DialPadPopup", x:offset.x-60, y:offset.y + 25});
        return true;
    };
    $scope.lastMillis = 0;
    $scope.getMeAvatarUrl = function(width,height){
        var pid;  
        if($scope.meModel["my_pid"]){
            pid = $scope.meModel["my_pid"];
        }

        var imageUrl = myHttpService.get_avatar(pid,width,height,icon_version);
        return imageUrl;
    };

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
    $scope.boxObj = {};
    $scope.boxObj.enableBox;
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
  
    $scope.update_settings = function(type,action,model){
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
            case 'hudmw_box_enabled':
                if (!$scope.boxObj.enableBox)
                    $scope.boxObj.enableBox;
                else
                    !$scope.boxObj.enableBox
                myHttpService.updateSettings(type, action, model);
                break;
            default:
                myHttpService.updateSettings(type,action,model); 
            
        }

    };
	
    $scope.volume = {};
    $scope.volume.micVol;
    $scope.volume.spkVol;
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

    $scope.reset_app_menu = function(){
        $scope.update_settings('HUDw_AppModel_callLog','delete');
        $scope.update_settings('HUDw_AppModel_conferences','delete');
        $scope.update_settings('HUDw_AppModel_callcenter','delete');
        $scope.update_settings('HUDw_AppModel_search','delete');
        $scope.update_settings('HUDw_AppModel_zoom','delete');
        $scope.update_settings('HUDw_AppModel_box','delete');
		
        $scope.boxObj.enableBox = true;
        settingsService.reset_app_menu();
    };

    
    var update_settings = function(){
        if($scope.meModel.my_jid){
            $scope.meModel.login = $scope.meModel.my_jid.split("@")[0];
            $scope.meModel.server = $scope.meModel.my_jid.split("@")[1];
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
            
            if(settings.auto_away_timeout){
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
            $scope.boxObj.enableBox=settings['hudmw_box_enabled'] == "true";
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
        $scope.$safeApply();
    };


    var update_queues = function(){
		if ($scope.settings && $scope.queues) {
			for (var i = 0, len = $scope.queues.length; i < len; i++) {
				$scope.settings['HUDw_QueueNotificationsLW_'+$scope.queues[i].xpid] = $scope.settings['HUDw_QueueNotificationsLW_' + $scope.queues[i].xpid] == "true";
				$scope.settings['HUDw_QueueAlertsLW_'+ $scope.queues[i].xpid] = $scope.settings['HUDw_QueueAlertsLW_' + $scope.queues[i].xpid] == "true";
				$scope.settings['HUDw_QueueNotificationsAb_'+ $scope.queues[i].xpid] = $scope.settings['HUDw_QueueNotificationsAb_' + $scope.queues[i].xpid] == "true";
				$scope.settings['HUDw_QueueAlertsAb_'+ $scope.queues[i].xpid] = $scope.settings['HUDw_QueueAlertsAb_' + $scope.queues[i].xpid] == "true";
			}
		}
		$scope.$safeApply();
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
    
    $scope.$on('settings_updated',function(event,data){
        if (data){
			$scope.settings = settings = data;
			update_queues();
            update_settings();
        }
    });

    $scope.change_avatar = function($file){
        $scope.avatar = $file;
		
        var data = {
            'action':'updateAvatar',
            'a.attachment':$file.file,
            'alt':"",
            "a.lib":"https://huc-v5.fonality.com/repository/fj.hud/1.3/res/message.js",
            "a.taskId": "1_0"
        };
        myHttpService.update_avatar(data);
    };

     $scope.$on('contacts_synced', function(event, data) {
        
        if(data && data != undefined){
            var meUser = data.filter(function(item){
                return item.xpid == $scope.meModel['my_pid'];
            });
            if(meUser.length >  0){
                $scope.meModel.first_name=meUser[0].firstName;
                $scope.meModel.last_name=meUser[0].lastName;
                $scope.meModel.email = meUser[0].email;
                $scope.meModel.ims = meUser[0].ims;
            }
        }
    });
    $scope.calllogs = [];
    $scope.isAscending = false;
    $scope.$on('calllog_synced',function(event,data){
        if(data){
            $scope.calllogs = data;
            $scope.calllogs.sort(function(a,b){
                return b.startedAt - a.startedAt;
            });
        }
    });
    $scope.sortCallLog = function(sortType){
        switch(sortType){
            case "Date":
                if($scope.isAscending){
                    $scope.calllogs.sort(function(a,b){
                        return b.startedAt - a.startedAt;
                    }); 
                    $scope.isAscending = false;   
                }else{
                    $scope.calllogs.sort(function(a,b){
                        return a.startedAt - b.startedAt;
                    });
                    $scope.isAscending = true;
                }
                
                break;
            case "From":
                 if($scope.isAscending){
                    $scope.calllogs.sort(function(a,b){
                        if(a.incoming && b.incoming){
                            return b.phone.localeCompare(b.phone);
                        }else if(a.incoming){
                            return b.phone.localeCompare(a.location);
                        }else if(b.incoming){
                            return b.location.localeCompare(a.phone);
                        }else{
                            return b.location.localeCompare(b.location)
                        }
                    });
                   
                    $scope.isAscending = false;   
                }else{
                     $scope.calllogs.sort(function(a,b){
                        if(a.incoming && b.incoming){
                            return a.phone.localeCompare(b.phone);
                        }else if(a.incoming){
                            return a.phone.localeCompare(b.location);
                        }else if(b.incoming){
                            return a.location.localeCompare(b.phone);
                        }else{
                            return a.location.localeCompare(b.location);
                        }
                    }); 
                    
                    $scope.isAscending = true;
                }
                break;
            case "To":
                if($scope.isAscending){
                    $scope.calllogs.sort(function(a,b){
                        if(a.incoming && b.incoming){
                            return b.location.localeCompare(b.location);
                        }else if(a.incoming){
                            return b.phone.localeCompare(a.location);
                        }else if(b.incoming){
                            return b.location.localeCompare(a.phone);
                        }else{
                            return b.phone.localeCompare(a.phone);
                        }
                    });
                    
                    $scope.isAscending = false;   
                }else{

                    $scope.calllogs.sort(function(a,b){
                        if(a.incoming && b.incoming){
                            return a.location.localeCompare(b.location);
                        }else if(a.incoming){
                            return a.location.localeCompare(b.phone);
                        }else if(b.incoming){
                            return a.phone.localeCompare(b.location);
                        }else{
                            return a.phone.localeCompare(b.phone);
                        }
                    }); 
                    
                    $scope.isAscending = true;
                }
                break;

            case "Duration":
                if($scope.isAscending){
                    
                    $scope.calllogs.sort(function(a,b){
                        return b.duration - a.duration;
                    }); 
                    $scope.isAscending = false;   
                }else{
                    $scope.calllogs.sort(function(a,b){
                        return a.duration - b.duration;
                    });
                    $scope.isAscending = true;
                }
                break;
        }

        $scope.recentSelectSort = sortType;
  };
    $scope.showCallOvery = function(screen){
        var data = contactService.getContact($scope.meModel.my_pid);
        if(!data){
            data = {};
            data.displayName = $scope.currentCall.displayName;
            data.xpid = $scope.currentCall.xpid;
        }
        data.screen = screen;
        data.call = $scope.currentCall;
        data.close = true;
        
        $scope.showOverlay(true, 'CallStatusOverlay', data);
    };
    $scope.formatIncoming = function(calllog,type){
        switch(type){
            case "From":
                if(calllog.incoming){
                    return calllog.phone;
                }else{
                    return $scope.verbage.you + " @ " + calllog.location;
                }
            case "To":
                if(calllog.incoming){
                    return $scope.verbage.you + " @ " + calllog.location;
                }else{
                    return calllog.phone;
                }
        }
    };
    
    $scope.$on('groups_synced', function(event,data){
        var meGroup = data.filter(function(item){
            return item.xpid == $scope.meModel['my_pid'];
        });

    });

    $scope.holdCall = function(call,isHeld){
        phoneService.holdCall(call.xpid,isHeld == 'True');
    };

    $scope.makeCall = function(number){
        phoneService.makeCall(number);
		
		storageService.saveRecentByPhone(number);
    };

    $scope.endCall = function(call){
        phoneService.hangUp(call.xpid);
    };

     $scope.hangup = function(){
        
        if($scope.locations[$scope.meModel['current_location']].locationType == 'w'){
            //phoneService.hangUp();
            for(var call in $scope.calls){
                phoneService.hangUp(call);
                phoneService.removeNotification();
            }

        }else{
            myHttpService.sendAction('me','callTo',{phoneNumber: number});
        }
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

            $scope.weblauncher_profiles = data;
        }
    });

    $scope.$on('weblaunchervariables_synced', function(event,data){
        if(data){
            $scope.weblaunchervariables = data;
        }

    });

    $scope.$on('locations_synced', function(event,data){
        if(data){
            for (var i = 0, len = data.length; i < len; i++) {
                $scope.locations[data[i].xpid] = data[i];
            }
        }
    });


    $scope.$on('current_call_control', function(event,currentCall){
         $scope.currentCall = currentCall;
        if($scope.currentCall){
        	$scope.onCall = true;
            if($scope.currentCall.contactId){
                var contact = contactService.getContact(currentCall.contactId);
                currentCall.contact = contact;
            }
        }
        if(currentCall  == null){
            $scope.call_obj.phoneNumber = "";
            $scope.onCall = false;
        }

    });



    $scope.recordCall = function(action) {
        var action = '';
        
        if (!$scope.currentCall.record) {
            $scope.recordingElapsed = '00:00';
            localStorage.recordedAt = new Date().getTime();
            action = 'startCallRecording';
        }
        else
            action = 'stopCallRecording';
        
        if($scope.currentCall){
        	$scope.onCall = true;
            if($scope.currentCall.contactId){
               myHttpService.sendAction('contacts', action, {contactId: $scope.currentCall.contactId});
            }else{
               if(!$scope.currentCall.record){
                    action = 'startRecord';
               }else{
                   action = 'stopRecord';
               }
               myHttpService.sendAction('mycalls', action, {mycallId: $scope.currentCall.xpid});
                
            }
        }
    };

    $scope.callKeyPress = function($event){
        if ($event.keyCode == 13 && !$event.shiftKey) {
            $scope.makeCall($scope.call_obj.phoneNumber);
            $scope.call_obj.phoneNumber = '';
            $event.preventDefault();
        }
    };

    $scope.parkCall = function(currentCall){
        var call =  phoneService.getCall(currentCall.contactId);
        phoneService.parkCall(currentCall.xpid);
    };

    $scope.muteCall = function(){
       if($scope.volume.micVol == 0){
            phoneService.setMicSensitivity($rootScope.volume.mic);
            $scope.volume.micVol = $rootScope.volume.mic;
            $rootScope.volume.mic = 0;
        }else{
            phoneService.setMicSensitivity(0);
            $rootScope.volume.mic = angular.copy($scope.volume.micVol);
            $scope.volume.micVol = 0;
       }
    };

    $scope.silentSpk = function(){
        if($scope.volume.spkVol == 0){
             phoneService.setVolume($rootScope.volume.spk);
             $scope.volume.spkVol = $rootScope.volume.spk;
             

        }else{
            phoneService.setVolume(0);
            $rootScope.volume.spk = angular.copy($scope.volume.spkVol);
            $scope.volume.spkVol = 0;
        }
    };

    var updateTime = function() {
        if ($scope.currentCall && $scope.currentCall.startedAt) {
            // format date
            var date = new Date().getTime();
            $scope.timeElapsed = $filter('date')(date - $scope.currentCall.startedAt, 'mm:ss');
            
            // also get recorded time
            if ($scope.currentCall.recorded)
                $scope.recordingElapsed = $filter('date')(date - localStorage.recordedAt, 'mm:ss');
            // increment
            $timeout(updateTime, 1000);

        }
    };

    $scope.$on('make_phone_call',function(event,data){
        $scope.callKeyPress(data);

    });
    
    $scope.$on('calls_updated',function(event,data){
        $scope.calls = data;
        var call_exist = false;
        $scope.onCall = false;
        
        if(data && !$.isEmptyObject(data)){
            for (var i in data){
                if(data[i].xpid == $scope.meModel.my_pid){
                    $scope.calls[data[i].contactId] = data[i];
                }
                if($scope.currentCall){
                    if(data[i].sipId == $scope.currentCall.sipId){
                        $scope.currentCall = data[i];
                    }else if(data[i].phone == $scope.currentCall.phone){
                        $scope.currentCall = data[i];
                        call_exist = true;
                        $scope.onCall = true;
                    }else if(data[i].xpid == $scope.currentCall.xpid){
                        $scope.currentCall = data[i];
                    }
                }
            }
            
            if($scope.calls[[callId]]){
                $scope.currentCall = $scope.calls[callId];
            }else{
                $scope.timeElapsed = "00:00";
            }
            
            if($scope.currentCall && !data[$scope.currentCall.xpid]){
                $scope.currentCall = null;
                $scope.onCall = false;
            }
        }else{
            $scope.currentCall = null;
            $scope.onCall = false;
        }
        /*
        if(!data[$scope.currentCall.xpid]){
            $scope.currentCall = null;
        }*/
        updateTime();
    });
    
    var dtmf_input = "";
    var icon_version;
    $scope.$on("fdpImage_synced",function(event,data){
        if(data){
            for (var i = 0, len = data.length; i < len; i++) {
                if(data[i].xpid == $scope.meModel.my_pid){
                    icon_version = data[i].xef001iver;
                }
            }
        } 
    });

    //listen for key_press broadcasted from a root_controller
    $scope.$on("key_press", function(event,data){
            dtmf_input = dtmf_input + data;
            $scope.call_obj.phoneNumber = $scope.call_obj.phoneNumber + data;
            phoneService.getDtmfToneGenerator().play(data);
            setTimeout(function(){
                    phoneService.getDtmfToneGenerator().stop();
                },200);

            if($scope.currentCall){
                
                
                var call = phoneService.getCall($scope.currentCall.xpid);
                setTimeout(function(){
                    call.dtmf(dtmf_input);
                    dtmf_input = "";
                },900);
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
                        break;
                    }
                }    
             }
             if($scope.languageSelect == undefined && default_language != undefined){
                 $scope.languageSelect = default_language;
                 myHttpService.updateSettings('hudw_lang','update',$scope.languageSelect.xpid); 

             }
        }
	});


    $scope.$on('phone_event',function(event,data){
        if(data){
            if(data.event == 'state'){
                $scope.phoneState = data.registration;
            }
            if(data.event == 'onclose'){


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

      
}]);