hudweb.controller('ConversationWidgetQueuesController', ['$scope', '$rootScope', '$routeParams', 'ContactService', 'QueueService', 'HttpService', function($scope, $rootScope, $routeParams, contactService, queueService, httpService) {    
    $scope.contactId = $routeParams.contactId;
    $scope.contact = contactService.getContact($scope.contactId);
    $scope.data = {};
    $scope.log_out_reasons = [];     
    $scope.log_out_option;
    $scope.sort;
    $scope.queues = [];
    $scope.search = {};
    $scope.search.query = '';

    $scope.getAvatarUrl = function(queue, index) {
        
        if(queue.members){
            if (queue.members[index] !== undefined) {
                var xpid = queue.members[index];
                return httpService.get_avatar(xpid,14,14);
            }
            else
                return 'img/Generic-Avatar-14.png';

        }
    };

    $scope.queueLoginAll = function(){
        httpService.sendAction("contacts","agentLoginAll", {contactId:$scope.contactId});
    };

    $scope.queueLogoutAll = function(reasonId){
        httpService.sendAction("contacts", "agentLogoutAll", {contactId:$scope.contactId,reason:reasonId});
		
		$scope.log_out_option = '';
    };

    var initialAction = {name: "Logout All"};
    $scope.actionObj = {};
    $scope.actionObj.selectedAction = $scope.actionObj.currentAction = initialAction;
    $scope.handleLogoutAction = function(reasonId){
        $scope.actionObj.selectedAction = initialAction;
        switch(reasonId){
            case "0_130083":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("7670_Reason");
                break;
            case "0_142483":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("7978_Reason");
                break;                
            case "0_118808":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("Do we need a reason?");
                break;
            case "0_80843":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("just got fired");
                break;
            case "0_116580":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("Public Affair");
                break;
            case "0_13":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("Smoking break");
                break;
            case "0_78033":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("rational reasoning");
                break;                            
            case "0_19":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("Slacking off");
                break;
            case "0_37":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("Hiding from the customers");
                break;
            case "0_71485":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("i have my reasons");
                break;
            case "0_132627":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("Reason_for_Build_7673");
                break;
            case "0_39":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("Playing games");
                break;
            case "0_67456":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("Taking a nap");
                break;
            case "0_114866":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("A New Test Reason");
                break;
            case "0_3164":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("feeding the geese");
                break;
            case "0_29":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("Walking the company dog");
                break;
            case "0_31":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("Feeding the ducks");
                break;
            case "0_122102":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("HUDweb Test");
                break;
            case "0_130085":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("Doing The Harlem Shake");
                break;
            case "0_73873":
                $scope.actionObj.selectedAction = initialAction;
                $scope.queueLogoutAll(reasonId);
                // console.log("give me a reason to login");
                break;
        }
    };

    $scope.trancateSelectedName = function(){
    	if($scope.selectedConversationQueueOption.name.length > 13)
    	{
    		$scope.selectedConversationQueueOption.name = $scope.selectedConversationQueueOption.name.substring(0, 12) + '...';
    	}    	
    };
    
    $scope.truncateLongString = function()
    { 
    	return function(opt){
    		var truncated_name = opt.name;
    		if(opt.name.length > 13)
    			truncated_name = opt.name.substring(0, 12) + '...';
		    if(truncated_name == $scope.selectedConversationQueueOption.name)
		    	opt.name =  truncated_name;
		    else
		    	opt.name = opt.orig_name;
		    return opt;
    	};
    };
    
    $scope.truncateLongAction = function()
    {
    	return function(opt){
    		var truncated_name = opt.name;
    		if(opt.name.length > 13)
    			truncated_name = opt.name.substring(0, 12) + '...';
		    if(truncated_name == $scope.actionObj.selectedAction.name)
		    	opt.name =  truncated_name;
		    else
		    	opt.name = opt.orig_name;
		    return opt;
    	};
    };
    
    $scope.sort_options = [{name:$scope.verbage.queue_name, orig_name:$scope.verbage.queue_name, id:1,type:'name'},
    {name:$scope.verbage.queue_sort_calls_wait, orig_name:$scope.verbage.queue_sort_calls_wait, id:2, type:'waiting'},
    {name: $scope.verbage.queue_sort_avg_wait_time, orig_name:$scope.verbage.queue_sort_avg_wait_time,id:3, type:'avgwaiting'},
    {name:$scope.verbage.queue_sort_avg_talk_time, orig_name:$scope.verbage.queue_sort_avg_talk_time,id:4, type:'avgtalk'},
    {name:$scope.verbage.queue_sort_total_calls, orig_name:$scope.verbage.queue_sort_total_calls, id:5, type:'total'},
    {name:$scope.verbage.queue_abandoned_calls, orig_name:$scope.verbage.queue_abandoned_calls,id:6, type:'abandoned'},
    {name:$scope.verbage.queue_active_calls, orig_name:$scope.verbage.queue_active_calls, id:7, type:'active'}
    ];

    $scope.selectedConversationQueueOption = localStorage.selectedConversationQueueOption ? JSON.parse(localStorage.selectedConversationQueueOption) : $scope.sort_options[0];    

    $scope.sortConversationQueue = function(queueSelection){
        $scope.selectedConversationQueueOption = queueSelection;
        $scope.trancateSelectedName();
        
        switch(queueSelection.type){
            case "name":
                $scope.queues.sort(function(a,b){
                    return a.name.localeCompare(b.name);
                });                    
                localStorage.selectedConversationQueueOption = JSON.stringify(queueSelection);
                break;
            case 'waiting':
                $scope.queues.sort(function(a,b){
                    return b.info.waiting - a.info.waiting;
                }); 
                localStorage.selectedConversationQueueOption = JSON.stringify(queueSelection);
                break;
            case 'avgwaiting':
                $scope.queues.sort(function(a,b){
                    return b.info.esa - a.info.esa;
                }); 
                localStorage.selectedConversationQueueOption = JSON.stringify(queueSelection);
                break;
            case "avgtalk":
                $scope.queues.sort(function(a,b){
                    return b.info.avgTalk - a.info.avgTalk;
                });
                localStorage.selectedConversationQueueOption = JSON.stringify(queueSelection);
                break;
            case 'total':
                $scope.queues.sort(function(a,b){
                    return (b.info.completed + b.info.abandon + b.info.active) - (a.info.completed + a.info.abandon + a.info.active);
                }); 
                localStorage.selectedConversationQueueOption = JSON.stringify(queueSelection);
                break;
            case 'abandoned':
                $scope.queues.sort(function(a,b){
                    return  b.info.abandonPercent - a.info.abandonPercent;
                }); 
                localStorage.selectedConversationQueueOption = JSON.stringify(queueSelection);
                break;
            case 'active':
                $scope.queues.sort(function(a,b){
                    return  b.info.active - a.info.active ;
                });
                localStorage.selectedConversationQueueOption = JSON.stringify(queueSelection);
                break;
        }
    };

    status = $scope.contact.hud_status;
    switch(status){
            case 'offline':
                $scope.chatStatus  = "XIcon-ChatStatus-offline";
                break;
            case 'available':
                $scope.chatStatus = "XIcon-ChatStatus-available";
                break;
            case 'busy':
                $scope.chatStatus = "XIcon-ChatStatus-offline";
                break;
            case 'away':
                $scope.chatStatus = "XIcon-ChatStatus-away";
                break;
            default: 
                $scope.chatStatus = "XIcon-ChatStatus-offline";
    }

    $scope.sort = $scope.sort_options[0];

    queueService.getQueues().then(function(data) {
		$scope.log_out_reasons = data.reasons;
		
    	var queues = data.queues;
		
        for(var q = 0, qLen = queues.length; q < qLen; q++){
            if(queues[q].members){
                for(var i = 0, iLen = queues[q].members.length; i < iLen; i++){
                   if(queues[q].members[i].contactId == $scope.contactId){
                        queues[q].you = queues[q].members[i];
                        $scope.queues.push(queues[q]);
                   }
                }
            }
        }

        // need to set the sort option upon initial load
        switch($scope.selectedConversationQueueOption.type){
            case "name":
                $scope.queues.sort(function(a,b){
                    return a.name.localeCompare(b.name);
                });
                break;
            case 'waiting':
                $scope.queues.sort(function(a,b){
                    return b.info.waiting - a.info.waiting;
                }); 
                break;
            case 'avgwaiting':
                $scope.queues.sort(function(a,b){
                    return b.info.esa - a.info.esa;
                }); 
                break;
            case "avgtalk":
                $scope.queues.sort(function(a,b){
                    return b.info.avgTalk - a.info.avgTalk;
                });
                break;
            case 'total':
                $scope.queues.sort(function(a,b){
                    return (b.info.completed + b.info.abandon + b.info.active) - (a.info.completed + a.info.abandon + a.info.active);
                }); 
                break;
            case 'abandoned':
                $scope.queues.sort(function(a,b){
                    return b.info.abandonPercent - a.info.abandonPercent;
                })
                break;
            case 'active':
                $scope.queues.sort(function(a,b){
                    return  b.info.active - a.info.active ;
                });
                break;
        }

    });
    
}]);