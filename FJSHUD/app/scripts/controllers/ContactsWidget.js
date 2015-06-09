hudweb.controller('ContactsWidget', ['$scope', '$rootScope', '$filter', '$timeout', 'HttpService', 'ContactService', 'GroupService', function($scope, $rootScope, $filter, $timeout, myHttpService, contactService, groupService) {
  $scope.query = "";
  $scope.sortField = "displayName";
  $scope.sortReverse = false;
  $scope.contacts = [];
	$scope.favorites = {};
	
	// pull contact updates from service
	contactService.getContacts().then(function(data) {
		$scope.contacts = data;	
	});
	
	// pull group updates from service
	groupService.getGroups().then(function(data) {
		$scope.favorites = data.favorites;
	});

  $scope.sort = function(field) {
      if($scope.sortField != field) {
          $scope.sortField = field;
          $scope.sortReverse = false;
      }
      else {
          $scope.sortReverse = !$scope.sortReverse;
      }
  };
	
	// filter contacts down
	$scope.customFilter = function() {
		var tab = $scope.$parent.tab;
		
		return function(contact) {
			// remove self
			if (contact.xpid != $rootScope.myPid) {
				// filter by tab
				switch (tab) {
					case 'all':
						return true;
						break;
					case 'external':
						if (contact.primaryExtension == '')
							return true;
						break;
					case 'favorites':
						if ($scope.favorites[contact.xpid] !== undefined)
							return true;
						break;
				}
			}
		};
	};

	var parseContact = function(phoneNumber){
		var parsedNumber = '';
		for (var i = 0; i < phoneNumber.length; i++){
			var character = phoneNumber[i];
			if (character >= 0 && character <= 9){
				parsedNumber += character;
			}
		}
		return parsedNumber;
	};
	
	$scope.searchFilter = function(){
		var query = $scope.$parent.query.toLowerCase();

		return function(contact){
			if (contact.displayName.toLowerCase().indexOf(query) != -1 || contact.primaryExtension.indexOf(query) != -1 || parseContact(contact.primaryExtension).indexOf(query) != -1 || contact.phoneMobile.indexOf(query) != -1 || parseContact(contact.phoneMobile).indexOf(query) != -1){
				return true;
			}
		};
	};

	$scope.getCallStatusAvatar = function(call) {
		if (call && call.contactId)
			return myHttpService.get_avatar(call.contactId, 28, 28);
		else
			return 'img/Generic-Avatar-28.png';
	};
	
	$scope.showCallStatus = function($event, contact) {
		$event.stopPropagation();
        $event.preventDefault();
		
		// permission?
		if (contact.call.type == 0 || contact.call.contactId == $rootScope.myPid)
			return;
	
		$scope.showOverlay(true, 'CallStatusOverlay', contact);
	};
	
	// add favorites action (via directive)
	$scope.searchContact = function(contact) {
		myHttpService.sendAction('groupcontacts', 'addContactsToFavorites', {contactIds: contact.xpid});
	};

    $scope.$on("$destroy", function() {
		
    });
}]);
