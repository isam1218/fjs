/**
 * Created by vovchuk on 11/6/13.
 */fjs.core.namespace("fjs.ui");
/**
 * @param $scope
 * @param dataManager
 * @constructor
 */
fjs.ui.MeWidgetController = function($scope, dataManager, $http, myHttpService) {
    var context = this;

    fjs.ui.Controller.call(this, $scope);
    var MAX_AUTO_AWAY_TIMEOUT = 2147483647;

    var settings = {};
    var queues = [];

    var meModel = dataManager.getModel("me");
    var locationsModel = dataManager.getModel("locations");

    meModel.addEventListener("complete", $scope.$safeApply);
    locationsModel.addEventListener("complete", $scope.$safeApply);
    $scope.getCurrentLocationTitle = function() {
        /**
         * @type {{name:string. phone:string}}
         */
        var currentLocation;
         if(meModel.itemsByKey["current_location"] && (currentLocation = locationsModel.items[meModel.itemsByKey["current_location"].propertyValue])) {
             return currentLocation.name+" ("+currentLocation.phone+")";
         }
         else {
             return "Loading...";
         }
    };

    $scope.pbxtraVersion;
    $scope.hudserverVersion;
    $scope.fdpVersion;
    /* */
    //$scope.fon
    /**
    * used to determine what tab is selected in the me widget controller
    *
    */
    $scope.tabs = ['General','Phone','Web Launcher', 'Queues', 'Account','Alerts', 'CP', 'About'];
    $scope.selected = 'General';

    $scope.meModel = meModel.itemsByKey;

    myHttpService.getFeed('settings');
    myHttpService.getFeed('queues');

    /**
     * @type {{chat_status:{}, chat_custom_status:{}}}
     */

    $scope.meData = meModel.itemsByKey;
    $scope.chatStatuses = [{"title":"Available", "key":"available"}, {"title":"Away", "key":"away"}, {"title":"Busy", "key":"dnd"}];
    $scope.setChatStatus = function(chatStatus){
        dataManager.sendAction("me", "setXmppStatus", {"xmppStatus":$scope.meData.chat_status.propertyValue = chatStatus,"customMessage":$scope.meData.chat_custom_status.propertyValue});
    };
    $scope.setCustomStatus = function() {
        dataManager.sendAction("me", "setXmppStatus", {"xmppStatus":$scope.meData.chat_status.propertyValue ,"customMessage":$scope.meData.chat_custom_status.propertyValue});
    };
    $scope.showLocationsPopup = function(e) {
        e.stopPropagation();
        var eventTarget = context.getEventHandlerElement(e.target, e);
        var offset = fjs.utils.DOM.getElementOffset(eventTarget);
        $scope.showPopup({key:"LocationsPopup", x:offset.x-60, y:offset.y});
        return false;
    };

    $scope.getMeAvatarUrl = function(){
        return meModel.getMyAvatarUrl(90, 90);
    };

    
    $scope.somechild = "views/testTemplate.html";
    $scope.languages = [{id:1,label: 'United States (English)',value: '0_5'},
    {id:2,value: '0_3',label: 'Chinese Simplied',},
    {id:3,value: '0_1',label: 'English(Australia)',},
    {id:4,value: '0_4',label: 'Espanol',},
    {id:5,value: '0_9',label: 'Francais',}];
    $scope.languageSelect;// = $scope.languages[1];

    $scope.autoClearSettingOptions = [{id:1,value:30,label:'30 seconds'},
    {id:2,value:25,label:'25 Seconds'},
    {id:3,value:20,label:'20 Seconds'},
    {id:4,value:15,label:'15 Seconds'},
    {id:5,value:10,label:'10 Seconds'},
    {id:6,value:5,label:'5 Seconds'}];
    $scope.autoClearSelected; //= $scope.autoClearSettingOptions[1];

    $scope.hoverDelayOptions = [{id:1,value:1.2,label:'1.2'},
    {id:2,value:1,label:'1.0'},
    {id:3,value:0.7, label:'0.7'},
    {id:4,value:0.5, label:'0.5'},
    {id:5,value:0.2, label:'0.2'},
    {id:6,value:0.0, label:'0.0'}];
    $scope.hoverDelaySelected;// = $scope.hoverDelayOptions[1];

    $scope.searchAutoClear;
    $scope.enableBox;
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
    {id:6,value:60,label:'60 items'}];
    $scope.callLogSizeSelected;// = $scope.callLogSizeOptions[1];

    $scope.autoAwayOptions = [{id:1,value:30000,label:'30 Seconds'},
    {id:2,value:60000,label:'1 minute'},
    {id:3,value:120000,label:'2 minutes'},
    {id:4,value:240000,label:'4 minutes'},
    {id:5,value:360000, label:'6 minutes'},
    {id:6,value:600000, label:'10 minutes'},
    {id:7,value:900000,label:'15 minutes'},
    {id:8,value:1200000,label:'20 minutes'},
    {id:9,value:2400000,label:'40 minutes'}];
    $scope.autoAwaySelected;// = $scope.autoAwayOptions[1];
    if(meModel.itemsByKey.my_jid){
            $scope.meModel.login = meModel.itemsByKey.my_jid.propertyValue.split("@")[0];
            $scope.meModel.server = meModel.itemsByKey.my_jid.propertyValue.split("@")[1];
        }
    $scope.update_settings = function(type,action,model){
        
        switch(type){
            case 'auto_away_timeout':
                if(model){
                    myHttpService.updateSettings(type,action,$scope.autoAwaySelected); 
                }else{
                    myHttpService.updateSettings(type,action,MAX_AUTO_AWAY_TIMEOUT);
                }
            default:
                myHttpService.updateSettings(type,action,model); 
            
        }

    }

    $scope.micVol = .6;
    $scope.spkVol = .6;

    $scope.reset_app_menu = function(){
        $scope.update_settings('HUDw_AppModel_callLog','delete');
        $scope.update_settings('HUDw_AppModel_conferences','delete');
        $scope.update_settings('HUDw_AppModel_callcenter','delete');
        $scope.update_settings('HUDw_AppModel_search','delete');
        $scope.update_settings('HUDw_AppModel_zoom','delete');
        $scope.update_settings('HUDw_AppModel_box','delete');
    }
    
    update_settings = function(){
        $scope.meModel = meModel.itemsByKey;
        if(meModel.itemsByKey.my_jid){
            $scope.meModel.login = meModel.itemsByKey.my_jid.propertyValue.split("@")[0];
            $scope.meModel.server = meModel.itemsByKey.my_jid.propertyValue.split("@")[1];
        }
        if(settings){
            if(settings.hudw_lang){
                language = $scope.languages.filter(function(item){
                return (item.value== settings['hudw_lang']);
                })    
                
                $scope.languageSelect = language[0];
            }
            
            if(settings.hudmw_auto_away_timeout){
                autoAwayOption = $scope.autoAwayOptions.filter(function(item){
                    return (item.value == settings['hudmw_auto_away_timeout']);
                });   
                $scope.autoAwaySelected = autoAwayOption[0];
                
            }

            if(settings.auto_away_timeout){
                $scope.enableAutoAway = true;    
            }else{
                $scope.enableAutoAway = false;
             //= settings['auto_away_timeout'] 
            }
            

            if(settings.hudmw_searchautocleardelay){
                autoClearOption = $scope.autoClearSettingOptions.filter(function(item){
                    return (item.value == settings['hudmw_searchautocleardelay']);
                });
                $scope.autoClearSelected = autoClearOption[0];
            }

            if(settings['avatar_hover_delay']){
                hoverDelaySelected = $scope.hoverDelayOptions.filter(function(item){
                    return (item.value == settings['avatar_hover_delay'])
                });
                $scope.hoverDelaySelected = hoverDelaySelected[0];
            }

            $scope.alertShow = settings['alert_show'] == "true";
            $scope.alertShowVM = settings['alert_vm_show_new'] == "true";
            $scope.alertShowIncoming = settings['alert_call_incoming'] == "true";
            $scope.alertShowOutgoing = settings['alert_call_outgoing'] == "true";
            $scope.alertOnAlways = settings['hudmw_show_alerts_always'] == "true";
            $scope.alertOnBusy = settings['hudmw_show_alerts_in_busy_mode'] == "true";
            $scope.alertDisplayFor = settings['alert_call_display_for'];
            $scope.alertDuration = settings['alert_call_duration'];

            $scope.searchAutoClear = settings['hudmw_searchautoclear'] == "true";
            $scope.enableBox=settings['hudmw_box_enabled'] == "true";
            $scope.enableSound=settings['hudmw_chat_sounds'] == "true";
            $scope.soundOnChatMsgReceived=settings['hudmw_chat_sound_received'] == "true";
            $scope.soundOnSentMsg=settings['hudmw_chat_sound_sent'] == "true";
            $scope.enableBusyRingBack = settings['busy_ring_back'] == "true";
            
            $scope.useColumnLayout = settings['use_column_layout'] == 'true';
            callLogSelected = $scope.callLogSizeOptions.filter(function(item){
                return (item.value==settings['recent_call_history_length']);
            });

            $scope.micVol = parseFloat(settings['hudmw_webphone_mic']);
            $scope.spkVol = parseFloat(settings['hudmw_webphone_speaker']);
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
            
            if(meModel.itemsByKey.fon_core){
                $scope.pbxtraVersion = meModel.itemsByKey["fon_core"].propertyValue;
            }    
            if(meModel.itemsByKey.server_version){
                $scope.hudserverVersion = meModel.itemsByKey["server_version"].propertyValue;
            }   
            if(meModel.itemsByKey.fdp_version){
                $scope.fdpVersion = meModel.itemsByKey["fdp_version"].propertyValue;
            }
        }
        $scope.$apply();
    }

    update_queues = function(){
        for(queue in $scope.queues){
            $scope.settings['HUDw_QueueNotificationsLW_'+$scope.queues[queue].xpid] = $scope.settings['HUDw_QueueNotificationsLW_' + $scope.queues[queue].xpid] == "true";
            $scope.settings['HUDw_QueueAlertsLW_'+ $scope.queues[queue].xpid] = $scope.settings['HUDw_QueueAlertsLW_' + $scope.queues[queue].xpid] == "true";
            $scope.settings['HUDw_QueueNotificationsAb_'+ $scope.queues[queue].xpid] = $scope.settings['HUDw_QueueNotificationsAb_' + $scope.queues[queue].xpid] == "true";
            $scope.settings['HUDw_QueueAlertsAb_'+ $scope.queues[queue].xpid] = $scope.settings['HUDw_QueueAlertsAb_' + $scope.queues[queue].xpid] == "true";
        }
    }

    $scope.update_queue_settings = function(type,isActive){
        for(queue in $scope.queues){
            $scope.settings[type +$scope.queues[queue].xpid] = isActive;
            $scope.update_settings(type+$scope.queues[queue].xpid,'update',isActive);    
        }
    }

    $scope.$on('settings_synced',function(event,data){
        if (data && data != undefined){
			for(i = 0; i < data.length; i++){
                key = data[i].key;
                value = data[i].value;
                settings[key] = value;
            }

            $scope.settings = settings;
			update_queues();
            update_settings();
        }
    });

     $scope.$on('contacts_synced', function(event, data) {
        
        if(data && data != undefined){
            meUser = data.filter(function(item){
                return item.xpid == meModel.itemsByKey['my_pid'].propertyValue;
            });
            if(meUser.length >  0){
                $scope.meModel.first_name=meUser[0].firstName;
                $scope.meModel.last_name=meUser[0].lastName;
                $scope.meModel.email = meUser[0].email;
                $scope.meModel.ims = meUser[0].ims;
            }
        }
    });

    $scope.$on('groups_synced', function(event,data){
        meGroup = data.filter(function(item){
            return item.xpid == meModel.itemsByKey['my_pid'].propertyValue;
        });
    });

    $scope.$on('weblaunchervariables_synced', function(event,data){
        if(data){
            $scope.weblaunchervariables = data;
        }

    });

    $scope.$on("$destroy", function() {
        meModel.removeEventListener("complete", $scope.$safeApply);
        locationsModel.removeEventListener("complete", $scope.$safeApply);
    });
    $scope.$on("queues_synced", function(event,data){
        if(data && data != undefined){
            $scope.queues = data;
        }
        update_queues();
    });
};

fjs.core.inherits(fjs.ui.MeWidgetController, fjs.ui.Controller)