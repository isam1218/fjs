hudweb.controller('SearchWidgetController', ['$scope', function($scope) {
    fjs.ui.Controller.call(this, $scope);
	
    $scope.searchValue = "";
    $scope.openedContact = null;

    $scope.filterContactFn = function(searchInput) {
        return function(contact) {
            if(searchInput) {
                return contact.pass(searchInput);
            }
            return false;
        };
    };

    $scope.onKeyDown = function(event) {

        switch(event.keyCode) {
            case 40://down
                event.preventDefault();
                var el = $element.find('a')[0];
                if(el) {
                    el.focus();
                }
                break;
            case 27://esc
                $scope.searchValue = "";
                break;
            case 13://enter
                $scope.callToNumber();
                break;
        }
    };
    $scope.callToNumber = function() {
        dataManager.sendAction("me", "callTo", {"phoneNumber":$scope.searchValue});
        $scope.searchValue = "";
    };
    $scope.createContact = function(e) {
        e.stopPropagation();
        $scope.$emit("showPopup", {key:"EditContactDialog", model:{phone:$scope.searchValue}});
        return false;
    };
    $scope.onKeyDownElement = function (event, contact) {
        var el = event.target, index=-1, _el=null;
        event.preventDefault();
        switch (event.keyCode) {
            case 40:
                if($scope.openedContact == contact.xpid) {
                    var _phones = el.querySelectorAll('button');
                    if(_phones.length>0) {
                        _phones[0].focus();
                    }
                }
                else {
                    index = [].indexOf.call(el.parentNode.childNodes, el);
                    _el = el.parentNode.childNodes[++index];
                    while (_el && _el.tagName != 'A') {
                        _el = el.parentNode.childNodes[++index];
                    }
                    if (_el) {
                        _el.focus();
                    }
                }
            break;
            case 38:
                index = [].indexOf.call(el.parentNode.childNodes, el);
                _el = el.parentNode.childNodes[--index];
                while(_el && _el.tagName!='A') {
                    _el = el.parentNode.childNodes[--index];
                }
                if(_el) {
                    _el.focus();
                }
                else {
                    var input = $element.find('input')[0];
                    if(input) {
                        input.focus();
                    }
                }
                break;
            case 39:
                location.href = event.target.href;
                break;
            case 27:
                $scope.searchValue = "";
                break;
            case 13:
                event.stopPropagation();
                event.preventDefault();
                var phones = contact.getPhones();
                var filteredPhones = phones.filter(function(phone){
                    new RegExp($scope.searchValue,'i').test(phone.number);
                });
                if(filteredPhones.length > 1 || (filteredPhones.length == 0 && phones.length > 1)) {
                    event.stopPropagation();
                    $scope.openedContact = contact.xpid;
                    return false;
                }
                else if(filteredPhones.length == 1) {
                    dataManager.sendAction("me", "callTo", {"phoneNumber":filteredPhones[0].number});
                    $scope.searchValue = "";
                }
                else if(phones.length == 1) {
                    dataManager.sendAction("me", "callTo", {"phoneNumber":phones[0].number});
                    $scope.searchValue = "";
                }
                else {
                    $scope.searchValue = "";
                    location.href = event.target.href;
                }
                return false;
                break;
        }
    };


    $scope.onKeyDownButton = function (event, phone) {
        event.preventDefault();
        var el = event.target, index=-1, _el =null;
        event.stopPropagation();
        switch (event.keyCode) {
            case 40:
                    index = [].indexOf.call(el.parentNode.childNodes, el);
                    _el = el.parentNode.childNodes[++index];
                    while (_el && _el.tagName != 'BUTTON') {
                        _el = el.parentNode.childNodes[++index];
                    }
                    if (_el) {
                        _el.focus();
                    }
                break;
            case 38:
                index = [].indexOf.call(el.parentNode.childNodes, el);
                _el = el.parentNode.childNodes[--index];
                while(_el && _el.tagName!='BUTTON') {
                    _el = el.parentNode.childNodes[--index];
                }
                if(_el) {
                    _el.focus();
                }
                break;
            case 27:
                el.parentNode.parentNode.focus();
                $scope.openedContact=null;
                break;
            case 13:
                dataManager.sendAction("me", "callTo", {"phoneNumber":phone});
                $scope.searchValue = "";
                break;
        }
        return false;
    };

    $scope.$on("$destroy", function() {
        contactsModel.removeEventListener("complete", $scope.$safeApply);
    });
}]);