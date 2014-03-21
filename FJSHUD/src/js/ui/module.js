var hud_web = angular.module('HUDWeb', ['ngRoute', 'HUD_model']);



hud_web.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/me', {templateUrl: 'templates/MeWidgetController.html',   controller:['$scope', 'DataManager', fjs.ui.MeWidgetController]}).
        when('/conferences', {templateUrl: 'templates/MyConferencesWidgetController.html', controller: ['$scope', 'DataManager', fjs.ui.ConferencesWidgetController]}).
        when('/conferences/my', {templateUrl: 'templates/MyConferencesWidgetController.html', controller: ['$scope', 'DataManager', fjs.ui.ConferencesWidgetController]}).
        when('/conferences/all', {templateUrl: 'templates/AllConferencesWidgetController.html', controller: ['$scope', 'DataManager', fjs.ui.ConferencesWidgetController]}).
        when('/test', {templateUrl: 'templates/TestWidget.html', controller: ['$scope', fjs.ui.TestWidget]}).
        when('/contact/:contactId', {templateUrl: 'templates/ConversationWidgetVoicemails.html', controller: ['$scope', '$routeParams', 'DataManager', fjs.ui.ConversationWidgetVoicemailsController]}).
//      when('/contact/:contactId', {templateUrl: 'templates/ContactWidgetChatController.html', controller: fjs.ui.ContactWidgetChatController}).
//      when('/contact/:contactId/chat', {templateUrl: 'templates/ContactWidgetChatController.html', controller: fjs.ui.ContactWidgetChatController}).
        when('/contact/:contactId/groups', {templateUrl: 'templates/ConversationWidgetGroups.html', controller:  ['$scope', '$routeParams', 'DataManager', fjs.ui.ConversationWidgetGroupsController]}).
        when('/contact/:contactId/voicemails', {templateUrl: 'templates/ConversationWidgetVoicemails.html', controller: ['$scope', '$routeParams', 'DataManager', fjs.ui.ConversationWidgetVoicemailsController]}).
        //when('/phones/:phoneId', {templateUrl: 'partials/phone-detail.html', controller: PhoneDetailCtrl}).
        when('/zoom', {templateUrl: 'templates/ZoomWidgetController.html',   controller:['$scope', 'DataManager', fjs.ui.ZoomWidgetController]}).
        otherwise({redirectTo: '/me'});
}]);
//ng_app.controller("NewCallController", fjs.controllers.NewCallController);
//ng_app.controller("CallsListController", fjs.controllers.CallsListController);
//ng_app.controller("CallController", fjs.controllers.CallController);
//ng_app.controller("DialpadController", fjs.controllers.DialpadController);
//ng_app.controller("TransferDialog", fjs.controllers.TransferDialog);

hud_web.controller("MainController", ['$scope', 'DataManager', fjs.ui.MainController]);
//hud_web.controller("MeWidgetController", fjs.ui.MeWidgetController);
hud_web.controller("LocationsController", ['$scope', '$element', 'DataManager', fjs.ui.LocationsController]);
hud_web.controller("SortMenuController", ['$scope', '$element', fjs.ui.SortMenuController]);
hud_web.controller("ActionMenuController", ['$scope', '$element', fjs.ui.ActionMenuController]);
//hud_web.controller("LeftBarController", fjs.ui.LeftBarController);
hud_web.controller("LeftBarController", ['$scope', '$filter', 'DataManager', fjs.ui.LeftBarController]);
hud_web.controller("LeftBarContactsController", ['$scope', 'DataManager', fjs.ui.LeftBarContactsController]);
hud_web.controller("LeftBarCallsController", ['$scope', 'DataManager', fjs.ui.LeftBarCallsController]);
//hud_web.controller("GroupsController", fjs.ui.GroupsController);
//hud_web.controller("MyCallController", fjs.ui.MyCallController);
hud_web.controller("EditContactDialog", ['$scope', '$filter', fjs.ui.EditContactDialog]);
hud_web.controller("TopNavigationController", ['$scope', 'DataManager', fjs.ui.TopNavigationController]);
//hud_web.controller("FavoriteContactsController", fjs.ui.FavoriteContactsController);
//hud_web.controller("ContactController", fjs.ui.ContactController);

