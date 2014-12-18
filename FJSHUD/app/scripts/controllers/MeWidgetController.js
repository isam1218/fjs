/**
 * Created by vovchuk on 11/6/13.
 */fjs.core.namespace("fjs.ui");
/**
 * @param $scope
 * @param dataManager
 * @constructor
 */
fjs.ui.MeWidgetController = function($scope, dataManager, $http, myHttpService) {
    var context = this;

    fjs.ui.Controller.call(this, $scope);

    var meModel = dataManager.getModel("me");
    var locationsModel = dataManager.getModel("locations");

    meModel.addEventListener("complete", $scope.$safeApply);
    locationsModel.addEventListener("complete", $scope.$safeApply);
    $scope.getCurrentLocationTitle = function() {
        /**
         * @type {{name:string. phone:string}}
         */
        var currentLocation;
         if(meModel.itemsByKey["current_location"] && (currentLocation = locationsModel.items[meModel.itemsByKey["current_location"].propertyValue])) {
             return currentLocation.name+" ("+currentLocation.phone+")";
         }
         else {
             return "Loading...";
         }
    };
    /**
    * used to determine what tab is selected in the me widget controller
    *
    */
    $scope.tabs = ['General','Phone','Web Launcher', 'Queues', 'Account','Alerts', 'CP', 'About'];
    $scope.selected = 'General'

    /**
     * @type {{chat_status:{}, chat_custom_status:{}}}
     */

    $scope.meData = meModel.itemsByKey;
    $scope.chatStatuses = [{"title":"Available", "key":"available"}, {"title":"Away", "key":"away"}, {"title":"Busy", "key":"dnd"}];
    $scope.setChatStatus = function(chatStatus){
        dataManager.sendAction("me", "setXmppStatus", {"xmppStatus":$scope.meData.chat_status.propertyValue = chatStatus,"customMessage":$scope.meData.chat_custom_status.propertyValue});
    };
    $scope.setCustomStatus = function() {
        dataManager.sendAction("me", "setXmppStatus", {"xmppStatus":$scope.meData.chat_status.propertyValue ,"customMessage":$scope.meData.chat_custom_status.propertyValue});
    };
    $scope.showLocationsPopup = function(e) {
        e.stopPropagation();
        var eventTarget = context.getEventHandlerElement(e.target, e);
        var offset = fjs.utils.DOM.getElementOffset(eventTarget);
        $scope.showPopup({key:"LocationsPopup", x:offset.x-60, y:offset.y});
        return false;
    };

    $scope.getMeAvatarUrl = function(){
        return meModel.getMyAvatarUrl(90, 90);
    };

    $scope.$on("$destroy", function() {
        meModel.removeEventListener("complete", $scope.$safeApply);
        locationsModel.removeEventListener("complete", $scope.$safeApply);
    });
    $scope.somechild = "views/testTemplate.html";
    $scope.languages = [{id:1,label: 'United States (English)',value: '0_5'},
    {id:2,value: '0_3',label: 'Chinese Simplied',},
    {id:3,value: '0_1',label: 'English(Australia)',},
    {id:4,value: '0_4',label: 'Espanol',},
    {id:5,value: '0_9',label: 'Francais',}];
    $scope.languageSelect = $scope.languages[1];

    $scope.autoClearSettingOptions = [{id:1,value:30,label:'30 seconds'},
    {id:2,value:25,label:'25 Seconds'},
    {id:3,value:20,label:'20 Seconds'},
    {id:4,value:15,label:'15 Seconds'},
    {id:5,value:10,label:'10 Seconds'},
    {id:6,value:5,label:'5 Seconds'}];
    $scope.autoClearSelected = $scope.autoClearSettingOptions[1];

    $scope.hoverDelayOptions = [{id:1,value:1.2,label:'1.2'},
    {id:2,value:1.0,label:'1.0'},
    {id:3,value:0.7, label:'0.7'},
    {id:4,value:0.5, label:'0.5'},
    {id:5,value:0.2, label:'0.2'},
    {id:6,value:0.0, label:'0.0'}];
    $scope.hoverDelaySelected = $scope.hoverDelayOptions[1];

    $scope.searchAutoClear = true;
    $scope.enableBox=false;
    $scope.enableSound=false;
    $scope.soundOnChatMsgReceived=true;
    $scope.soundOnSentMsg=true;
    $scope.enableBusyRingBack = false;
    $scope.enableAutoAway = false;
    $scope.useColumnLayout = false;

    $scope.callLogSizeOptions = [{id:1,value:10,label:'10 items'},
    {id:2,value:20,label:'20 items'},
    {id:3,value:30,label:'30 items'},
    {id:4,value:40,label:'40 items'},
    {id:5,value:50,label:'50 items'},
    {id:6,value:60,label:'60 items'}];
    $scope.callLogSizeSelected = $scope.callLogSizeOptions[1];

    $scope.autoAwayOptions = [{id:1,value:30000,label:'30 Seconds'},
    {id:2,value:60000,label:'1 minute'},
    {id:3,value:120000,label:'2 minutes'},
    {id:4,value:240000,label:'4 minutes'},
    {id:5,value:360000, label:'6 minutes'},
    {id:6,value:600000, label:'10 minutes'},
    {id:7,value:900000,label:'15 minutes'},
    {id:8,value:1200000,label:'20 minutes'},
    {id:9,value:2400000,label:'40 minutes'}];
    $scope.autoAwaySelected = $scope.autoAwayOptions[1];

    $scope.update_settings = myHttpService.updateSettings; /*function(type,action,model){
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
        $http({
          method:'POST',
          url:requestURL,
          data:$.param(params),
          headers:{'Content-Type':'application/x-www-form-urlencoded',
          'Authorization':'auth='+dataManager.api.ticket,
          'node':dataManager.api.node,
          }
        }).success(function(){})

        //.post(requestURL,params);
    };*/

    $scope.reset_app_menu = function(){
        $scope.update_settings('HUDw_AppModel_callLog','delete');
        $scope.update_settings('HUDw_AppModel_conferences','delete');
        $scope.update_settings('HUDw_AppModel_callcenter','delete');
        $scope.update_settings('HUDw_AppModel_search','delete');
        $scope.update_settings('HUDw_AppModel_zoom','delete');
        $scope.update_settings('HUDw_AppModel_box','delete');
    }

};

fjs.core.inherits(fjs.ui.MeWidgetController, fjs.ui.Controller)
