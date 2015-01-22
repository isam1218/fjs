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
    $scope.sort_options = [{name:"Queue name", id:1},
    {name:"Calls Waiting",id:2},
    {name:"Average wait time",id:3},
    {name:"Average talk time",id:4},
    {name:"Totals calls(since last reset", id:5},
    {name:"Abandoned calls",id:6},
    {name:"Active calls", id:7}
    ];


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
