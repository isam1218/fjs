/**
 * Created by vovchuk on 11/7/13.
 */
namespace("fjs.ui");

fjs.ui.LeftBarController = function($scope) {
    fjs.ui.Controller.call(this, $scope);
    $scope.tabs = [
        {"key": "all", "title": "All", "url":"templates/LeftBarTabAllContacts.html"}
        , {"key": "favorites", "title": "Favorites", "url":"templates/LeftBarTabFavorites.html"}
        , {"key": "external", "title": "External", "url":"templates/LeftBarTabExternal.html"}
        , {"key": "groups", "title": "Groups", "url":"templates/LeftBarTabGroups.html"}
    ];

    $scope.currentTab = $scope.tabs[0];

    $scope.selectTab = function(tab) {
        $scope.currentTab = tab;
    }
};
fjs.ui.LeftBarController.extend(fjs.ui.Controller);