/**
 * Created by vovchuk on 11/7/13.
 */
namespace("fjs.ui");

fjs.ui.LeftBarController = function($scope) {
    fjs.ui.ControllerBase.call(this, $scope);
    $scope.tabs = [
        {"key": "all", "title": "All", "width":"32px", "url":"templates/LeftBarTabAllContacts.html"}
        , {"key": "favorites", "title": "Favorites", "width":"70px", "url":"templates/LeftBarTabFavorites.html"}
        , {"key": "external", "title": "External", "width":"65px", "url":"templates/LeftBarTabExternal.html"}
        , {"key": "groups", "title": "Groups", "width":"59px", "url":"templates/LeftBarTabGroups.html"}
    ];

    $scope.currentTab = $scope.tabs[0];

    $scope.selectTab = function(tab) {
        $scope.currentTab = tab;
    }

};
fjs.ui.LeftBarController.extends(fjs.ui.ControllerBase);