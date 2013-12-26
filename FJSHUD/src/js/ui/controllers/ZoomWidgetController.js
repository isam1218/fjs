namespace("fjs.ui");
/**
 * @param $scope
 * @param dataManager
 * @constructor
 */
fjs.ui.ZoomWidgetController = function($scope, dataManager) {
    fjs.ui.Controller.call(this, $scope);

    var context = this;
    this.addedContactsId=[];
    var contactsModel = dataManager.getModel("contacts");

    $scope.contacts = contactsModel.order;
    $scope.addContactsMenu = "templates/AddContactPopupMenu.html";
    $scope.joinMeeting = function(meetingId){
        window.open("https://api.zoom.us/j/" + meetingId,'_blank');
    };
    $scope.hasResult = false;
    $scope.startUrl = "";
    $scope.joinUrl = "";

    $scope.startMeeting = function(topic){
        var data = {};
        data["topic"]=topic;
        data["users"]= context.addedContactsId;
        data["option_start_type"]= "video";
        dataManager.sendFDPRequest("/v1/zoom", data, function(xhr, data, isOk) {
               context.onAjaxResult(isOk, data)
            });
    };
    $scope.filterFn = function(contact){
        return (context.addedContactsId.indexOf(contact.xpid)!=-1);
    };
    $scope.deleteContact = function(contactId){
        var index = context.addedContactsId.indexOf(contactId);
        if (index != -1) {
            context.addedContactsId.splice(index, 1);
        }
        $scope.$broadcast('deleteContact', contactId);
    };
    $scope.$on('addContact', function(e, contactId){
        context.addedContactsId.push(contactId);
    });
    $scope.bodyDisplay='block';
    $scope.bodyStartedDisplay='none';
    $scope.bodyErrorDisplay='none';
    $scope.startUrl = "";
    $scope.joinUrl = "";

    /**
     *
     * @param {boolean} isOk
     * @param {string} _data
     */
    fjs.ui.ZoomWidgetController.prototype.onAjaxResult = function(isOk, _data){
        $scope.hasResult = true;
        if(!isOk){
            $scope.$safeApply(function(){
                $scope.bodyDisplay='none';
                $scope.bodyStartedDisplay='none';
                $scope.bodyErrorDisplay='block';
            });
            return;
        }
        var data = JSON.parse(_data);
        window.open(data["start_url"], '_blank');
        $scope.$safeApply(function(){
            $scope.startUrl = data["start_url"];
            $scope.joinUrl = data["join_url"];

            $scope.bodyDisplay='none';
            $scope.bodyStartedDisplay=(data["start_url"]&&data["join_url"])?'block':'none';
            $scope.bodyErrorDisplay=(data["start_url"]&&data["join_url"])?'none':'block';
        });
    }
};

fjs.ui.ZoomWidgetController.extend(fjs.ui.Controller);