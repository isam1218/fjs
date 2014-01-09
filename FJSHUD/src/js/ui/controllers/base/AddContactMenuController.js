namespace("fjs.ui");

fjs.ui.AddContactMenuController = function($scope, dataManager, templateUrl) {

    $scope.contactsModel = dataManager.getModel("contacts");

    $scope.contactsForAdd = [];

    $scope.addedContacts = [];

    $scope.cloneContacts = function () {
        var arr = $scope.contactsForAdd = $scope.contactsModel.order.slice(0);
        if($scope.addedContacts.length!=0) {
            for(var i=0; i<$scope.addedContacts.length; i++) {
                arr.splice(arr.indexOf($scope.addedContacts[i]), 1);
            }
        }
    };

    $scope.contactsModel.addListener("complete", function(){
        if($scope.contactsForAdd.length === 0 || $scope.contactsForAdd.length!=$scope.contactsModel.order.length) {
            $scope.cloneContacts();
        }
        else {
            $scope.$safeApply();
        }
    });

    $scope.cloneContacts();


    $scope.addContactsMenu = templateUrl;

    /**
     * @param item
     * @param {Array} arr1
     * @param {Array} arr2
     */
    function moveItem(item, arr1, arr2) {
        var index = arr1.indexOf(item);
        if(index>=0) {
            arr2.push(arr1.splice(index,1)[0]);
        }
    }

    $scope.addContact=function(contact) {
        $scope.clearSearch();
        moveItem(contact, $scope.contactsForAdd, $scope.addedContacts);
    };

    $scope.deleteContact = function(contact) {
        moveItem(contact, $scope.addedContacts, $scope.contactsForAdd);
    };

    $scope.clearSearch = function(){
        $scope.searchInput='';
    };

    $scope.filterContactFn = function(searchInput) {
        return function(contact){
            return contact.pass(searchInput);
        };
    };
};
