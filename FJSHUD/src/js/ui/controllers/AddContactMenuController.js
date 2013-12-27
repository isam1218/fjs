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
        return (!meModel.isMyPid(contact.xpid) && (addedContactsId.indexOf(contact.xpid)==-1));
    }
    $scope.clearSearch = function(){
        $scope.searchInput='';
    }
    $scope.filterContactFn = function(contact){
        return contact.pass($scope.searchInput);
    }
    $scope.keyUp = function(e){
        if(e.keyCode==27){
            $scope.clearSearch();
        }
    }
};

fjs.ui.AddContactMenuController.extend(fjs.ui.Controller);