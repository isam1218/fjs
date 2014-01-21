/**
 * Created by fnf on 15.01.14.
 */
namespace("fjs.ui");

/**
 *
 * @param $scope
 * @param $routeParams
 * @param dataManager
 * @constructor
 * @extends fjs.ui.ConversationWidgetController
 * @extends fjs.ui.VoicemailTab
 */
fjs.ui.ConversationWidgetVoicemailsController = function($scope, $routeParams, dataManager) {
    fjs.ui.ConversationWidgetController.call(this, $scope, $routeParams.contactId, dataManager);
    var filterVoicemail = function(){
        return function(voicemail){
            return voicemail.contactId == $routeParams.contactId;
        };
    };
    fjs.ui.VoicemailTab.call(this, $scope, $routeParams, dataManager, filterVoicemail);//TODO: parameters
    $scope.contactId = $routeParams.contactId;
    var context = this;


    $scope.$on("$destroy", function() {
    });
};

fjs.ui.ConversationWidgetVoicemailsController.extend(fjs.ui.ConversationWidgetController);
fjs.ui.ConversationWidgetVoicemailsController.extend(fjs.ui.VoicemailTab);
