fjs.hud.httpService = function($http,dataManager,$rootScope){

  if(SharedWorker != 'undefined'){
    var worker = new SharedWorker("scripts/services/fdpSharedWorker.js");
    worker.port.addEventListener("message",function(event){
      
      switch(event.data.action){
        case "init":
            worker.port.postMessage({"action":"sync"});
            break;
        case "sync_completed":
            if(event.data.data){
              synced_data = JSON.parse(event.data.data);
              $rootScope.$broadcast('sync_completed',synced_data);
            }
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
