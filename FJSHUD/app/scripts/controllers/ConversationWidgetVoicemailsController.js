hudweb.controller('ConversationWidgetVoicemailsController', ['$scope', '$routeParams', '$timeout', '$filter', 'ContactService', 'VoicemailService', 'HttpService', 'UtilService', function($scope, $routeParams, $timeout, $filter, contactService,voicemailService,httpService,utilService) {
    //fjs.ui.Controller.call(this,  $scope);
    
    $scope.contactId = $routeParams.contactId;
    $scope.data = {};
    $scope.voicemails;     
    $scope.query = "";
    $scope.meModel = {};
    $scope.sort_options = [{display_name:"Alphabetically", type:"name"},
    {display_name:"Newest First", type:"new"},
    {display_name:"Oldest First", type:"old"},
    {display_name:"read_status", type:"read"}
    ];

    $scope.contact = contactService.getContact($scope.contactId);

    $scope.selectedSort = $scope.sort_options[0];

    $scope.emptyVoiceLabel = $scope.contact.displayName;

    $scope.actions = [
    {display_name:"Actions", type:"unknown"},
    {display_name:"Mark all incoming voicemails as read", type:"read"},
    {display_name:"Mark all incoming voicemails as unread", type:"unread"},
    {display_name:"Delete all read incoming voicemails", type:"delete"},
    
    ];

    $scope.selectedAction = $scope.actions[0];


    //$scope.contact = contactModel.items[$routeParams.contactId];
	httpService.getFeed('voicemailbox');
    httpService.getFeed('me');
    $scope.$on(function(event,data) {
        // find this contact
        for (i in data) {
            if (data[i].xpid == $scope.contactID)
                $scope.contact = data[i];
                break;
        }
    });

    $scope.data.contactId = $routeParams.contactId;
	
	 $scope.getMeAvatarUrl = function(xpid,width,height){
        
        return myHttpService.get_avatar(xpid,width,height);
    };

    voicemailService.then(function(data){

        voiceMails = [];


        for(voicemail in data){
                if(data[voicemail].contactId == $scope.contactId){
                    voiceMails.push(data[voicemail]);
                }
        }   
        $scope.voicemails = voiceMails;
        $scope.data.voicemails = voiceMails;
    });

    //var voicemail = 
	// override data, where "stack" comes from ng-repeat
    if (typeof $scope.stack !== "undefined") {
		$scope.contactId = $scope.stack.id;
		$scope.contact = contactModel.items[$scope.stack.id];
	}
	
     $scope.formate_date = function(time){
        return utilService.formatDate(time,true);
    }

    $scope.formatDuration = function(duration){
        var time =   duration/1000;
        var seconds = time;
        var minutes;
        secString = "00";
        minString = "00";
        if(time >= 60){
            minutes = time/60;
            seconds = seconds - minutes*60;
        }  

        if(minutes < 10){
            minString = "0" + minutes; 
        }
        if(seconds < 10){
            secString = "0" + seconds;  
        }
        return minString + ":" + secString;

    }

    $scope.handleVoiceMailAction = function(type){
        switch(type){
            case "read":
                MarkReadVoiceMails(true);
                break;
            case "unread":
                MarkReadVoiceMails(false);
                break;
            case "delete":
                DeleteReadVoiceMails();
                break;
        }
    }

    MarkReadVoiceMails = function(isRead){
        voicemailIds = "";
        for(voicemail in $scope.voicemails){
            $scope.voicemails[voicemail].readStatus = isRead;
            xpid = $scope.voicemails[voicemail].xpid;
            voicemailIds = voicemailIds.concat(xpid.toString() + ",");
        }
        httpService.sendAction("voicemailbox","setReadStatusAll",{'read':isRead, ids: voicemailIds});
    	$scope.$safeApply();
    }


    DeleteReadVoiceMails = function(){
        voicemailIds = "";
        for(voicemail in $scope.voicemails){
            if($scope.voicemails[voicemail].readStatus){
                xpid = $scope.voicemails[voicemail].xpid;
                voicemailIds = voicemailIds.concat(xpid.toString() + ",");
        		$scope.voicemails.splice(voicemail,1);
       
            }
        }
        httpService.sendAction("voicemailbox","removeReadMessages",{messages: voicemailIds});

    }

    $scope.sortBy = function(type){
        switch(type){
            case "name":
                $scope.voicemails.sort(function(a,b){
                    return a.displayName.localeCompare(b.displayName);
                });
                break;
            case "new":
                $scope.voicemails.sort(function(a,b){
                    return b.date - a.date;
                });
                break;
            case "old":
                $scope.voicemails.sort(function(a,b){
                    return a.date - b.date;
                });
                break;
            case "read":
                $scope.voicemails.sort(function(a,b){
                    if(a.readStatus){
                        return 1;
                    }else{
                        return -1;
                    }
                });
                break;

        }
    }

    var update = function(data) {
        if(data.xpid == $scope.contactId) {
            if(!$scope.contact) {
                $scope.contact = contactModel.items[$scope.contactId];
            }
            updateFavicon();
            $scope.$safeApply();
        }
    };
   

    $scope.$on("me_synced",function(event,data){
        if(data){
            var me = {};
            for(medata in data){
                $scope.meModel[data[medata].propertyKey] = data[medata].propertyValue;
            }
        }
       $scope.$apply();
    });

}]);