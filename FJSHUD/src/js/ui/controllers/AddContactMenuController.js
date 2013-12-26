namespace("fjs.ui");

fjs.ui.AddContactMenuController = function($scope, $element, dataManager) {
    fjs.ui.Controller.call(this, $scope);
    var addedContactsId = [];

    var contactsModel = dataManager.getModel("contacts");
    var meModel = dataManager.getModel("me");

    $scope.contacts = contactsModel.order;
    $scope.addContact=function(contactId){
        $scope.$emit('addContact', contactId);
        $scope.searchInput='';
        addedContactsId.push(contactId);
    }
    $scope.$on('deleteContact', function(e, contactId){
        var index = addedContactsId.indexOf(contactId);
        if (index != -1) {
            addedContactsId.splice(index, 1);
        }

    });
    $scope.filterFn = function(contact){
        //TODO: search by several fields
        return (meModel.getMyPid()!= contact.xpid) && (addedContactsId.indexOf(contact.xpid)==-1);
    }
    $scope.clearSearch = function(){
        $scope.searchInput='';
    }
};

fjs.ui.AddContactMenuController.extend(fjs.ui.Controller);