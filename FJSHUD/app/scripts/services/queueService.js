hudweb.service('QueueService', ['$http', '$rootScope', '$location', '$q', function($http, $rootScope, $location, $q){

	var queues = [];
	var formatData = function() {
		// format data that controller needs
		return {
			queues: queues
		};
	};

	$rootScope.$on("queues_synced", function(event,data){
		if(queues.length < 1){
			queues = data;
		}

		$rootScope.$broadcast('queues_updated',formatData());
	});

	$rootScope.$on("queue_members_synced", function(event,data){
		for(i = 0; i < queues.length; i++){
			queues[i].members = [];
			for(key in data){
				if(data[key].queueId == queues[i].xpid){
					queues[i].members.push(data[key]);
				}
			}
		}
		$rootScope.$broadcast('queues_updated',formatData());
	});

	$rootScope.$on("queue_members_status_synced",function(event,data){
		for(i = 0; i < queues.length; i++){

			if(queues[i].members && queues[i].members.length > 0){
				for(j = 0; j < queues[i].members.length; j++){
					for (key in data){
						if(data[key].xpid == queues[i].members[j].xpid){
							queues[i].members[j].status = data[key];
						}
					}
				}
			}
		}

		$rootScope.$broadcast('queues_updated',formatData());
	});

	$rootScope.$on("queue_stat_calls_synced",function(event,data){
		for(i = 0; i < queues.length; i++){
			for(key in data){
				if(data[key].xpid == queues[i].xpid){
					queues[i].info = data[key];
				}
			}
		}
		$rootScope.$broadcast('queues_updated',formatData());
	});


}]);