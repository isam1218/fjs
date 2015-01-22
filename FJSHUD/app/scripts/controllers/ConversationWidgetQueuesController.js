/**
 * Created by fnf on 15.01.14.
 */fjs.ui.ConversationWidgetQueuesController = function($scope, $routeParams, $timeout, $filter, contactService,httpService) {
    //fjs.ui.Controller.call(this,  $scope);
    
    $scope.contactId = $routeParams.contactId;
    $scope.contact = contactService.getContact($scope.contactId);
    $scope.data = {};
    $scope.log_out_reasons = [];     
    $scope.log_out_option;
    $scope.sort;
    $scope.queues = [];
    $scope.query = "";
    


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
    }

    $scope.queueLogoutAll = function(reasonId){
        httpService.sendAction("contacts", "agentLogoutAll", {contactId:$scope.contactId,reason:reasonId});
    }

    $scope.sort_options = [{name:"Queue name", id:1,type:'name'},
    {name:"Calls Waiting",id:2, type:'waiting'},
    {name:"Average wait time",id:3, type:'avgwaiting'},
    {name:"Average talk time",id:4, type:'avgtalk'},
    {name:"Totals calls(since last reset", id:5, type:'total'},
    {name:"Abandoned calls",id:6, type:'abandoned'},
    {name:"Active calls", id:7, type:'active'}
    ];

    $scope.sortQueues = function(type){

        switch(type){

            case 'name':
                $scope.queues.sort(function(a,b){
                        return a.name.localeCompare(b.name);
                }); 
                break;
            case 'waiting':
                $scope.queues.sort(function(a,b){
                    return a.info.waiting - b.info.waiting;
                }); 
            
                break;
            case 'avgwaiting':
                $scope.queues.sort(function(a,b){
                    return a.info.waiting - b.info.waiting;
                }); 
           
                break;
            case 'avgtalk':
                $scope.queues.sort(function(a,b){
                    return a.info.avgTalk - b.info.avgTalk;
                }); 
           
                break;
            case 'total':
                $scope.queues.sort(function(a,b){
                    return (a.info.waiting + a.info.abandoned + a.info.active) - (b.info.waiting + b.info.abandoned + b.info.active);
                }); 
           
                break;
            case 'abandoned':
                $scope.queues.sort(function(a,b){
                    return  a.info.abandoned  -  b.info.abandoned ;
                }); 
                break;
            case 'active':
                $scope.queues.sort(function(a,b){
                    return  a.info.active  -  b.info.active ;
                }); 
            
                break;
        }

        $scope.$safeApply();
    }


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
    

    httpService.getFeed('queuelogoutreasons');
    httpService.getFeed('queues');
    httpService.getFeed('queue_members');
    httpService.getFeed('queue_members_status');
    httpService.getFeed('queue_stat_calls');
    
    $scope.$on('queuelogoutreasons_synced',function(event,data){
    	$scope.log_out_reasons = [];
    	$scope.log_out_reasons = data;
    	$scope.log_out_reasons.push({name:"Logout All"});
    	$scope.log_out_option = data[$scope.log_out_reasons.length - 1];
    	$scope.$safeApply();
    });

    $scope.getChatStatus == function(){
        
    }

    $scope.$on('queues_updated',function(event,data){
    	queues = data.queues;
        for(queue in queues){
            if(queues[queue].members){
                for(i = 0; i < queues[queue].members.length; i++){
                   if(queues[queue].members[i].contactId == $scope.contactId){
                        inQueue = false;
                        queues[queue].status = queues[queue].members[i].status;
                        for(scopeQueue in $scope.queues){
                            if($scope.queues[scopeQueue].xpid == queues[queue].xpid){
                                inQueue = true;
                            }
                        }
                        if(!inQueue){
                            $scope.queues.push(queues[queue]);
                            inQueue = false;
                        }
                   } 
                }
            }
        }

        $scope.$apply();

    });
    
};

fjs.core.inherits(fjs.ui.ConversationWidgetVoicemailsController, fjs.ui.Controller)
