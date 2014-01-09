/**
 * Created by vovchuk on 11/7/13.
 */
namespace("fjs.ui");

fjs.ui.LeftBarController = function($scope, $filter, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    $scope.number = "";
    $scope.numberChanged = function() {
        $scope.filteredContacts=$filter('filter')($scope.contactsModel.order, $scope.number);
    };
    $scope.filteredContacts=[];
    $scope.contactsModel = dataManager.getModel("contacts");

    function getContact(xpid) {
        return $scope.contactsModel.items[xpid];
    }

    $scope.selectedContact = null;

    $scope.onkeyup = function(event) {
        var index;
        if(event.keyCode==38) {
            event.preventDefault();
            index = $scope.filteredContacts.indexOf($scope.selectedContact);
            if(index>0) {
                $scope.selectedContact = $scope.filteredContacts[index-1];
            }
        }
        else if (event.keyCode==40) {
            if($scope.selectedContact==null) {
                $scope.selectedContact = $scope.filteredContacts[0];
            }
            else {
                index = $scope.filteredContacts.indexOf($scope.selectedContact);
                if(index>-1 && index<$scope.filteredContacts.length-1) {
                    $scope.selectedContact = $scope.filteredContacts[index+1];
                }
                else {
                    $scope.selectedContact = $scope.filteredContacts[0];
                }
            }
            event.preventDefault();
        }
        else if (event.keyCode==13) {
            event.preventDefault();
            if($scope.filteredContacts.length>1 && $scope.selectedContact) {
                $scope.selectContact($scope.selectedContact.xpid);
                $scope.numberChanged();
            }
            else if($scope.filteredContacts.length <= 1) {

            }
        }
    };


    $scope.selectContact = function(xpid) {
        var regexp = new RegExp($scope.number, "ig");
        var contact = getContact(xpid);

        if (regexp.test(contact["phoneMobile"])) {
            $scope.number = contact["phoneMobile"];
        }
        else if (regexp.test(contact["phoneBusiness"])) {
            $scope.number = contact["phoneBusiness"];
        }
        else {
            if(contact["primaryExtension"]) {
                $scope.number = contact["primaryExtension"];
            }
            else if(contact["phoneMobile"]) {
                $scope.number = contact["phoneMobile"];
            }
            else if(contact["phoneBusiness"]) {
                $scope.number = contact["phoneBusiness"];
            }
        }
    };
    $scope.canCall = function() {
        return /\d/.test($scope.number);
    };
};
fjs.ui.LeftBarController.extend(fjs.ui.Controller);