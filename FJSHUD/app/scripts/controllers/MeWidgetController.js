hudweb.controller('MeWidgetController', ['$scope', '$http', 'HttpService','PhoneService','$routeParams','ContactService','$filter','$timeout', function($scope, $http, myHttpService,phoneService,$routeParam,$contactService,$filter,$timeout) {
    var context = this;

    var MAX_AUTO_AWAY_TIMEOUT = 2147483647;
    var CALL_ON_HOLD = 3
    var CALL_IN_PROGRESS = 2



    var settings = {};
    var queues = [];
    var callId = $routeParam.callId;
    $scope.avatar ={};
    //$scope.locations = []
    if($scope.currentCall){
        $scope.currentCall.isHeld = false;
        updateTime();
    }

    $scope.timeElapsed = "00:00";
    $scope.getCurrentLocationTitle = function() {
        /**
         * @type {{name:string. phone:string}}
         */
        var currentLocation;


         if($scope.meModel["current_location"] && $scope.locations[$scope.meModel["current_location"]]) {
             currentLocation = $scope.locations[$scope.meModel["current_location"]];
             return currentLocation.name+" ("+currentLocation.phone+")";
         }
         else {
             return "Loading...";
         }
    };

    var Months = ['January','February','March','April','May','June','July','August','October','September','November','December'];
    var Weekday = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];

    $scope.pbxtraVersion;
    $scope.hudserverVersion;
    $scope.fdpVersion;
    $scope.meModel={};
    $scope.locations = {};
    $scope.call_obj = {};
    $scope.call_obj.phoneNumber = "";
    $scope.calls = {};
    /* */
    /**
    * used to determine what tab is selected in the me widget controller
    *
    */
        //$scope.tabs = ['General','Phone','Web Launcher', 'Queues', 'Account','Alerts', 'CP', 'About'];
    $scope.tabs = [
    {label:$scope.verbage.general,option:'General'},
    {label:$scope.verbage.phone,option:'Phone'},
    {label:$scope.verbage.web_launcher,option:'Web Launcher'},
    {label:$scope.verbage.queues,option:'Queues'},
    {label:$scope.verbage.my_account,option:'Account'},
    {label:$scope.verbage.alerts,option:'Alerts'},
    {label:$scope.verbage.cp,option:'CP'},
    {label:$scope.verbage.about,option:'About'},
    ];

    $scope.selected = $scope.tabs[0];

    $scope.recentSelectSort = 'Date';
    myHttpService.getFeed('me');
    myHttpService.getFeed('settings');
    myHttpService.getFeed('queues');
    myHttpService.getFeed('locations');
    myHttpService.getFeed('calllog');   
    myHttpService.getFeed('calls');    
    myHttpService.getFeed('weblauncher');    
    myHttpService.getFeed('weblaunchervariables');
    myHttpService.getFeed('i18n_langs');
    


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
        myHttpService.sendAction("me", "setXmppStatus", {"xmppStatus":$scope.meModel.chat_status ,"customMessage":$scope.meModel.chat_custom_status});
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
    }

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
        $scope.showPopup({key:"LocationsPopup", x:offset.x-60, y:offset.y});
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

    $scope.somechild = "views/testTemplate.html";
    $scope.languages = [{id:1,label: 'United States (English)',value: '0_5'},
    {id:2,value: '0_3',label: 'Chinese Simplied',},
    {id:3,value: '0_1',label: 'English(Australia)',},
    {id:4,value: '0_4',label: 'Espanol',},
    {id:5,value: '0_9',label: 'Francais',}];
    $scope.languageSelect = $scope.languages[0];

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
    if($scope.meModel.my_jid){
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
                myHttpService.updateSettings(type,action,model.xpid); 
                localStorage.fon_lang_code = model.code;
                location.reload();
                break;
            default:
                myHttpService.updateSettings(type,action,model); 
            
        }

    }
    $scope.volume = {};
    $scope.volume.micVol;
    $scope.volume.spkVol;
    $scope.queueSummaryStats = {};

    $scope.reset_app_menu = function(){
        $scope.update_settings('HUDw_AppModel_callLog','delete');
        $scope.update_settings('HUDw_AppModel_conferences','delete');
        $scope.update_settings('HUDw_AppModel_callcenter','delete');
        $scope.update_settings('HUDw_AppModel_search','delete');
        $scope.update_settings('HUDw_AppModel_zoom','delete');
        $scope.update_settings('HUDw_AppModel_box','delete');
    }
    
    update_settings = function(){
        if($scope.meModel.my_jid){
            $scope.meModel.login = $scope.meModel.my_jid.split("@")[0];
            $scope.meModel.server = $scope.meModel.my_jid.split("@")[1];
        }
        if(settings){
            if(settings.hudw_lang){
                /*language = $scope.languages.filter(function(item){
                return (item.value== settings['hudw_lang']);
                })    
                
                $scope.languageSelect = language[0];*/
            }
            
            if(settings.hudmw_auto_away_timeout){
                autoAwayOption = $scope.autoAwayOptions.filter(function(item){
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
        }

        myHttpService.sendAction("weblauncher","update",data);
    }
    
    $scope.$on('settings_updated',function(event,data){
        if (data){
			$scope.settings = settings = data;
			update_queues();
            update_settings();
        }
    });

    $scope.change_avatar = function($file){
        $scope.avatar = $file;
        data = {
            'action':'updateAvatar',
            'a.attachment':$file.file,
            'alt':"",
            "a.lib":"https://huc-v5.fonality.com/repository/fj.hud/1.3/res/message.js",
            "a.taskId": "1_0"
        }
        myHttpService.update_avatar(data);
    }
     $scope.$on('contacts_synced', function(event, data) {
        
        if(data && data != undefined){
            meUser = data.filter(function(item){
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
  }
    $scope.showCallOvery = function(screen){
        var data = $contactService.getContact($scope.meModel.my_pid);
        if(!data){
            data = {};
            data.displayName = $scope.currentCall.displayName;
            data.xpid = $scope.currentCall.xpid;
        }
        data.screen = screen;
        data.call = $scope.currentCall;
        $scope.showOverlay(true, 'CallStatusOverlay', data);
    }
   
    $scope.formatDuration = function(calllog){
        var date = new Date(calllog.duration)
        var seconds = date.getSeconds();
        var minutes;
        if(seconds > 60){
            minutes = parseInt(seconds/60) 
            seconds = seconds - (60*minutes);
        }

        if(seconds < 10){
            seconds = "0" + seconds;
        }
        if(minutes){
            return minutes + ":" + seconds;
        }else{
            return "00:" + seconds;
        }
        
    }

    $scope.formatIncoming = function(calllog,type){
        switch(type){
            case "From":
                if(calllog.incoming){
                    return calllog.phone;
                }else{
                    return "You @ " + calllog.location;
                }
            case "To":
                if(calllog.incoming){
                    return "You @ " + calllog.location;
                }else{
                    return calllog.phone;
                }
        }
    }

    $scope.formatDate = function(calllog){
        var date = new Date(calllog.startedAt)
        var today = new Date();
        var DateString = "";
        hour = date.getHours();
        ampm = " am";
        dateString = date.getFullYear() + " " + Months[date.getMonth()] + " " + date.getDate();
        minutes = date.getMinutes();
        
        if(hour > 12){
            hour = hour - 12;
            ampm = " pm";
        }
        if(minutes < 10){
            minutes = "0" + date.getMinutes(); 
        }
        
        if(date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear()){
            if(date.getDate() == today.getDate()){
                dateString = "today"
            }else if(date.getDate() == today.getDate() - 1){
                dateString = "yesterday"
            }else if(parseInt(date.getDate()/7) == parseInt(today.getDate()/7)){
                dateString = Weekday[date.getDay];
            }
        }
        return  dateString + " " + hour + ":" + minutes + ampm;  
    }

    $scope.$on('groups_synced', function(event,data){
        meGroup = data.filter(function(item){
            return item.xpid == $scope.meModel['my_pid'];
        });

    });

    $scope.holdCall = function(call,isHeld){
        phoneService.holdCall(call.xpid,isHeld == 'True');
        $scope.currentCall.isHeld =isHeld == 'True';
    }
    $scope.makeCall = function(number){
        if($scope.locations[$scope.meModel['current_location']].locationType == 'w'){
                phoneService.makeCall(number);
        }else{
            myHttpService.sendAction('me','callTo',{phoneNumber: number});
        }
    }

    $scope.endCall = function(call){
        phoneService.hangUp(call.xpid);
    }

     $scope.hangup = function(){
        
        if($scope.locations[$scope.meModel['current_location']].locationType == 'w'){
            //phoneService.hangUp();
            for(call in $scope.calls){
                phoneService.hangUp(call);
                phoneService.removeNotification();
            }

        }else{
            myHttpService.sendAction('me','callTo',{phoneNumber: number});
        }
    }

    
    $scope.$on('weblauncher_updated', function(event,data){
        if(data){
            $scope.weblaunchervariables = data;
            activeWebLauncher = data.filter(function(item){
                return item.id == settings['hudmw_launcher_config_id'];
            })
            if (activeWebLauncher.length > 0){
                $scope.currentWebLauncher = activeWebLauncher[0];
            };

            $scope.weblauncher_profiles = data;
        }
    });
    
    $scope.$on('weblaunchervariables_synced', function(event,data){
        if(data){
            $scope.weblaunchervariables = data;
        }

    });

    $scope.$on('me_synced', function(event,data){
        if(data){
            var me = {};
            for(medata in data){
                $scope.meModel[data[medata].propertyKey] = data[medata].propertyValue;
            }
        }
    });

    $scope.$on('locations_synced', function(event,data){
        if(data){
            var me = {};
            for(index in data){
                $scope.locations[data[index].xpid] = data[index];
            }
        }
    });


    $scope.$on('current_call_control', function(event,currentCall){
         $scope.currentCall = currentCall;
        if($scope.currentCall){
            if($scope.currentCall.contactId){
                contact = $contactService.getContact(currentCall.contactId);
                currentCall.contact = contact;
            }
        }
        if(currentCall  == null){
            $scope.call_obj.phoneNumber = "";
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

    $scope.parkCall = function(currentCall){
       call =  phoneService.getCall(currentCall.contactId);
        phoneService.parkCall(currentCall.xpid);
    }

    $scope.muteCall = function(){
       phoneService.setVolume(0);
       $scope.volume.spkVol = 0;

    }

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
    $scope.$on('calls_updated',function(event,data){
        $scope.calls = {};
        if(data){
            for (i in data){
                if(data[i].xpid == $scope.meModel.my_pid){
                    $scope.calls[data[i].contactId] = data[i];
                }
            }
            if($scope.currentCall){
                if(data[i].sipId == $scope.currentCall.sipId){
                    $scope.currentCall = data[i];
                    if($scope.currentCall.state == CALL_ON_HOLD){
                        $scope.currentCall.isHeld = true;
                    }else{
                        $scope.currentCall.isHeld = false;
                    }
                }
            }
            if($scope.calls[[callId]]){
                $scope.currentCall = $scope.calls[$scope.callId];
                 
            }else{
                $scope.timeElapsed = "00:00";
            }
        }
        updateTime();
    });
    
    var dtmf_input = "";
    var icon_version;
    $scope.$on("fdpImage_synced",function(event,data){
        if(data){
            for(i in data){
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
                },200)

            if($scope.currentCall){
                
                
                var call = phoneService.getCall($scope.currentCall.xpid);
                setTimeout(function(){
                    call.dtmf(dtmf_input);
                    dtmf_input = "";
                },900);
            }
        
    });
    $scope.$on('i18n_updated',function(event,data){
		if(data){
			var language_id;
			$scope.languages = data;
		     if(localStorage.fon_lang_code){
                for(language in $scope.languages){
                    if($scope.languages[language].code == localStorage.fon_lang_code){
                        $scope.languageSelect = $scope.languages[language];
                        localStorage.fon_lang_code = $scope.languageSelect.code;
                        break;
                    }
                }
             }else{
                for(language in $scope.languages){
                    if($scope.languages[language].xpid == settings.hudw_lang){
                        $scope.languageSelect = $scope.languages[language];
                        localStorage.fon_lang_code = $scope.languageSelect.code;
                        break;
                    }
                }    
             }
        }
	});
    

    $scope.$on("queues_synced", function(event,data){
        if(data && data != undefined){
            $scope.queues = data;
        }
        update_queues();
    });

      $scope.$on("calls_updated", function(event,data){
         $scope.calls = data;
       });
}]);