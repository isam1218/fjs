/**
 * Created by vovchuk on 11/7/13.
 */fjs.core.namespace("fjs.ui");

fjs.ui.LeftBarController = function($scope) {
    fjs.ui.Controller.call(this, $scope);
    $scope.tabs = [
        {"key": "all", "title": "All", "url":"views/LeftBarTabAllContacts.html"}
        , {"key": "favorites", "title": "Favorites", "url":"views/LeftBarTabFavorites.html"}
        , {"key": "external", "title": "External", "url":"views/LeftBarTabExternalContacts.html"}
        , {"key": "groups", "title": "Groups", "url":"views/LeftBarTabGroups.html"}
    ];

    $scope.currentTab = $scope.tabs[0];

    $scope.selectTab = function(tab) {
        $scope.currentTab = tab;
    }
};
fjs.core.inherits(fjs.ui.LeftBarController, fjs.ui.Controller)