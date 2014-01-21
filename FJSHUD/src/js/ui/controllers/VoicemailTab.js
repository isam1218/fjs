/**
 * Created by fnf on 15.01.14.
 */
namespace("fjs.ui");

fjs.ui.VoicemailTab = function($scope, $routeParams, dataManager, filterVoicemailFn) {
    var sortMenuItems = {alphabetically:"Alphabetically", newest: "Newest First", oldest: "Oldest First", readStatus: "Read Status"};
    var sortClb = function(){
        if($scope.orderBy && $scope.getSortBy){
            //inited
            $scope.orderBy = $scope.getSortBy();
        }
    };
    fjs.ui.SortableController.call(this, $scope, dataManager, "voicemails", "newest", sortMenuItems, sortClb);
    this.actionMenuItems = {allAsRead:"Mark all incoming voicemails as read", allAsUnread: "Mark all incoming voicemails as unread", deleteAllRead: "Delete all read incoming voicemails"};
    var context = this;
    this.voicemailModel = dataManager.getModel("voicemailbox");
    this.voicemailModel.addListener("complete", $scope.$safeApply);
    $scope.voicemails = this.voicemailModel.order;
    $scope.query = "";
    $scope.filterSearch = function(query){
        return function(voicemail){
            return voicemail.pass(query);
        };
    };
    $scope.getSortBy = function(){
        switch($scope.getSortMode()){
            case 'readStatus':
                return "-[-readStatus, date]";
            case 'alphabetically':
                return '-[-displayName, date]';
            case 'oldest':
                return 'date';
            case 'newest':
            default:
                return '-date';
        }
    };
    $scope.orderBy = $scope.getSortBy();

    $scope.filterVoicemail = filterVoicemailFn;
    this.doAction = function(actionId){
        var xpids = [];
        for(var i = 0; i<$scope.voicemails.length; i++){
            var voicemail = $scope.voicemails[i];
            if(filterVoicemailFn(voicemail) && !voicemail.isFromMe()){
                xpids.push(voicemail.xpid);
            }
        }
        if(xpids.length != 0){
            switch (actionId){
                case 'allAsRead':
                    context.voicemailModel.actionSetReadStatusAll(xpids.join(','), true);
                    break;
                case 'allAsUnread':
                    context.voicemailModel.actionSetReadStatusAll(xpids.join(','), false);
                    break;
                case 'deleteAllRead':
                    context.voicemailModel.actionRemoveReadMessages(xpids.join(','));
                    break;
            }
        }
    };

    $scope.callBack = function(voicemail){
        voicemail.actionCallback();
    };
    $scope.select = function(voicemail){
//        MediaPlayerApi.getInstance().selectVoicemail(this.model);
//        select();
//        return false;
    };
    $scope.showActionMenu = function(e) {
        e.stopPropagation();
        var items = [];
        for (var id in context.actionMenuItems){
            if(context.actionMenuItems.hasOwnProperty(id)){
                items.push({"id": id, "name": context.actionMenuItems[id]});
            }
        }
        var model = {};
        model.items = items;
        model.callback = context.doAction;
        var eventTarget = context.getEventHandlerElement(e.target, e);
        var offset = fjs.utils.DOM.getElementOffset(eventTarget);
        $scope.$emit("showPopup", {key:"ActionMenuPopup", x:offset.x, y:offset.y+30, model: model, id:"voicemailAction"});
        return false;
    };

    $scope.$on("$destroy", function() {
        context.voicemailModel.removeListener("complete", $scope.$safeApply);
    });


};
fjs.ui.VoicemailTab.extend(fjs.ui.SortableController);