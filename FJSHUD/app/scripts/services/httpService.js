fjs.hud.httpService = function($http,dataManager,$rootScope){
  /**
    shared worker 
  
  */
  var worker = undefined;

  if(SharedWorker != 'undefined'){
    worker = new SharedWorker("scripts/services/fdpSharedWorker.js");
    worker.port.addEventListener("message",function(event){
      switch(event.data.action){
        case "init":
            worker.port.postMessage({"action":"sync"});
            break;
        case "sync_completed":
            if(event.data.data){
				synced_data = event.data.data;
			  
			    for (feed in synced_data)
					$rootScope.$broadcast(feed+'_synced', synced_data[feed]);
            }
            break;
        case "feed_request":
            $rootScope.$broadcast(event.data.feed +'_synced',event.data.data);
            break;

      }
    },false);

    worker.port.start();
    var node = dataManager.api.node;
    var auth = dataManager.api.ticket;

    var events = {
      "action":"authorized",
      "data":{
        "node":node,
        "auth":"auth="+auth,
      }

    };

    worker.port.postMessage(events);
  }

  //this.login = function(type)
  this.getFeed = function(feed){
      worker.port.postMessage({
        "action": "feed_request",
        "feed":feed
      })
  }

  this.isFirstSync = function(){
    return;
  }


  this.updateSettings = function(type,action,model){
    var params = {
      'a.name':type,
      't':'web',
      'action':action
    }
    if(model){
      if(model.value){
        params['a.value']=model.value;
      }else{
        params['a.value']=model;
      }
    }
    //?Authorization=" + dataManager.api.ticket+"&node="+dataManager.api.node
    var requestURL = fjs.CONFIG.SERVER.serverURL+"/v1/settings";
    return $http({
      method:'POST',
      url:requestURL,
      data:$.param(params),
      headers:{'Content-Type':'application/x-www-form-urlencoded',
      'Authorization':'auth='+dataManager.api.ticket,
      'node':dataManager.api.node,
    }
    });
  //.post(requestURL,params);
  };



}
