var hud_web = angular.module('HUDWeb', ['ngRoute', 'HUD_model']);



hud_web.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
        when('/me', {templateUrl: 'templates/MeWidgetController.html',   controller:['$scope', 'DataManager', fjs.ui.MeWidgetController]}).
//        when('/conferences', {templateUrl: 'templates/MyConferencesWidgetController.html', controller: fjs.ui.ConferencesWidgetController}).
//        when('/conferences/my', {templateUrl: 'templates/MyConferencesWidgetController.html', controller: fjs.ui.ConferencesWidgetController}).
//        when('/conferences/all', {templateUrl: 'templates/AllConferencesWidgetController.html', controller: fjs.ui.ConferencesWidgetController}).
//        when('/contact/:contactId', {templateUrl: 'templates/ContactWidgetChatController.html', controller: fjs.ui.ContactWidgetChatController}).
//        when('/contact/:contactId/chat', {templateUrl: 'templates/ContactWidgetChatController.html', controller: fjs.ui.ContactWidgetChatController}).
//        when('/contact/:contactId/groups', {templateUrl: 'templates/ContactWidgetGroupsController.html', controller: fjs.ui.ContactWidgetGroupsController}).
        //when('/phones/:phoneId', {templateUrl: 'partials/phone-detail.html', controller: PhoneDetailCtrl}).
        otherwise({redirectTo: '/me'});
}]);
//ng_app.controller("NewCallController", fjs.controllers.NewCallController);
//ng_app.controller("CallsListController", fjs.controllers.CallsListController);
//ng_app.controller("CallController", fjs.controllers.CallController);
//ng_app.controller("DialpadController", fjs.controllers.DialpadController);
//ng_app.controller("TransferDialog", fjs.controllers.TransferDialog);

hud_web.controller("MainController", ['$scope', 'DataManager', fjs.ui.MainController]);
//hud_web.controller("MeWidgetController", fjs.ui.MeWidgetController);
//hud_web.controller("LocationsController", fjs.ui.LocationsController);
//hud_web.controller("LeftBarController", fjs.ui.LeftBarController);
//hud_web.controller("AllContactsController", fjs.ui.AllContactsController);
//hud_web.controller("LeftBarCallsController", fjs.ui.LeftBarCallsController);
//hud_web.controller("ExternalContactsController", fjs.ui.ExternalContactsController);
//hud_web.controller("GroupsController", fjs.ui.GroupsController);
//hud_web.controller("MyCallController", fjs.ui.MyCallController);
//hud_web.controller("EditContactDialog", fjs.ui.EditContactDialog);
hud_web.controller("TopNavigationController", ['$scope', 'DataManager', fjs.ui.TopNavigationController]);
//hud_web.controller("FavoriteContactsController", fjs.ui.FavoriteContactsController);
//hud_web.controller("ContactController", fjs.ui.ContactController);