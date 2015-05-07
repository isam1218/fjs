hudweb.controller('ConversationWidgetQueuesController', ['$scope', '$routeParams', '$timeout', '$filter', 'ContactService', 'QueueService', 'HttpService', function($scope, $routeParams, $timeout, $filter, contactService, queueService, httpService) {    
    $scope.contactId = $routeParams.contactId;
    $scope.contact = contactService.getContact($scope.contactId);
    $scope.data = {};
    $scope.log_out_reasons = [];     
    $scope.log_out_option;
    $scope.sort;
    $scope.queues = [];
    $scope.query = "";
    var localPid;
    var addedPid;

    $scope.$on('pidAdded', function(event, data){
        addedPid = data.info;
        if (localStorage['recents_of_' + addedPid] === undefined){
            localStorage['recents_of_' + addedPid] = '{}';
        }
        $scope.recent = JSON.parse(localStorage['recents_of_' + addedPid]);
    });
    
    $scope.storeRecentQueue = function(xpid){
        var localPid = JSON.parse(localStorage.me);
        $scope.recent = JSON.parse(localStorage['recents_of_' + localPid]);
        $scope.recent[xpid] = {
            type: 'queue',
            time: new Date().getTime()
        };
        localStorage['recents_of_' + localPid] = JSON.stringify($scope.recent);
        $rootScope.$broadcast('recentAdded', {id: xpid, type: 'queue', time: new Date().getTime()});
    };

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
		
		$scope.log_out_option = '';
    }

    $scope.sort_options = [{name:$scope.verbage.queue_name, id:1,type:'name'},
    {name:$scope.verbage.queue_sort_calls_wait,id:2, type:'waiting'},
    {name: $scope.verbage.queue_sort_avg_wait_time,id:3, type:'avgwaiting'},
    {name:$scope.verbage.queue_sort_avg_talk_time,id:4, type:'avgtalk'},
    {name:$scope.verbage.queue_sort_total_calls, id:5, type:'total'},
    {name:$scope.verbage.queue_abandoned_calls,id:6, type:'abandoned'},
    {name:$scope.verbage.queue_active_calls, id:7, type:'active'}
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

    queueService.getQueues().then(function(data) {
		$scope.log_out_reasons = data.reasons;
		
    	var queues = data.queues;
		
        for(var q = 0; q < queues.length; q++){
            if(queues[q].members){
                for(var i = 0; i < queues[q].members.length; i++){
                   if(queues[q].members[i].contactId == $scope.contactId){
                        queues[q].you = queues[q].members[i];
                        $scope.queues.push(queues[q]);
                   }
                }
            }
        }
    });
    
}]);