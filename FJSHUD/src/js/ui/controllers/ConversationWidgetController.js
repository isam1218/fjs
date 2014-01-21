/**
 * Created by fnf on 15.01.14.
 */
namespace("fjs.ui");

fjs.ui.ConversationWidgetController = function($scope, contactId, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    var context = this;
    this.contactId = contactId;
    this.contactsModel = dataManager.getModel("contacts");
    $scope.contactId = this.contactId;
    $scope.contact = this.contactsModel.getEntry(this.contactId);
    this.contactsModel.addXpidListener(this.contactId, function(data){
        var type = data.eventType||data.type;//TODO: in some cases used type, in some - eventType/ see fjs.hud.FeedModel
        if(type == 'change'){
            $scope.contact = context.contactsModel.getEntry(context.contactId);
            $scope.$safeApply();
        }else if (data.eventType == 'delete'){
            //TODO: go to home
        }
    });

    $scope.$on("$destroy", function() {
        context.contactsModel.removeXpidListener(context.contactId, $scope.$safeApply);
    });
};

fjs.ui.ConversationWidgetController.extend(fjs.ui.Controller);
