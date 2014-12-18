fjs.hud.httpService = function($http,dataManager){

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
