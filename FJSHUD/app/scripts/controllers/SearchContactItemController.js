/**
 * Created by vovchuk on 14.08.2014.
 */
fjs.core.namespace("fjs.ui");

fjs.ui.SearchContactItemController = function($scope, $element, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    $scope.phones = [];

    if($scope.contact.primaryExtension) {
        $scope.phones.push({phone:$scope.contact.primaryExtension, type:'primaryExtension'});
    }
    if($scope.contact.phoneMobile) {
        $scope.phones.push({phone:$scope.contact.phoneMobile, type:'phoneMobile'});
    }
    if($scope.contact.phoneBusiness) {
        $scope.phones.push({phone:$scope.contact.phoneBusiness, type:'phoneBusiness'});
    }

    $scope.onKeyDownElement = function (event, contact) {
        var el;
        switch (event.keyCode) {
            case 40:
                el = $element.next();
                if(el.length>0 && el[0].tagName=='A') {
                    el[0].focus();
                }
                break;
            case 38:
                el = $element[0].previousElementSibling;
                if(el && el.tagName=='A') {
                    el.focus();
                }
                else if(/SearchInputBox/.test(el.className)) {
                    var _el = el.querySelectorAll('input');
                    if (_el && _el.length>0) {
                        _el[0].focus();
                    }
                }
                break;
            case 27:
                $scope.searchValue = "";
                break;
            case 13:
                event.stopPropagation();
                event.preventDefault();
                dataManager.sendAction("contacts", "callPrimaryExt", {'toContactId': contact.xpid});
                $scope.searchValue = "";
                return false;
                break;
        }
    };




};



fjs.core.inherits(fjs.ui.SearchContactItemController, fjs.ui.Controller);