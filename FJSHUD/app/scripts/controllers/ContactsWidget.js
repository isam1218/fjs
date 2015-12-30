hudweb.controller('ContactsWidget', ['$scope', '$rootScope', 'HttpService', 'ContactService', 'GroupService', 'SettingsService', function($scope, $rootScope, myHttpService, contactService, groupService, settingsService) {
	$scope.query = "";
	$scope.contacts = [];
	$scope.favorites = {};
	var chosenTab;
	
	// pull contact updates from service
	contactService.getContacts().then(function(data) {
		$scope.contacts = data;	
	});
	
	// pull group updates from service
	groupService.getGroups().then(function(data) {
		$scope.favorites = data.favorites;
	});

	// load sort (initial load)
	settingsService.getSettings().then(function(data) {
		chosenTab = localStorage['LeftBar_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_tabs_of_' + $rootScope.myPid]) : undefined;
		if (chosenTab == "favorites"){
			$scope.sortField = localStorage['LeftBar_FavoriteContacts_sortTab_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_FavoriteContacts_sortTab_of_' + $rootScope.myPid]) : 'displayName';
			$scope.sortReverse = localStorage['LeftBar_FavoriteContacts_sortReverse_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_FavoriteContacts_sortReverse_of_' + $rootScope.myPid]) : false;
		} else if (chosenTab == "external"){
			$scope.sortField = localStorage['LeftBar_ExternalContacts_sortTab_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_ExternalContacts_sortTab_of_' + $rootScope.myPid]) : 'displayName';
			$scope.sortReverse = localStorage['LeftBar_ExternalContacts_sortReverse_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_ExternalContacts_sortReverse_of_' + $rootScope.myPid]) : false;
		}
		else {
			$scope.sortField = localStorage['LeftBar_AllContacts_sortTab_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_AllContacts_sortTab_of_' + $rootScope.myPid]) : 'displayName';
			$scope.sortReverse = localStorage['LeftBar_AllContacts_sortReverse_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_AllContacts_sortReverse_of_' + $rootScope.myPid]) : false;
		}
  });

	// watch for change to tab variable to load last sort option chosen for respective contact tab
	$scope.$watch('tab', function(data){
		chosenTab = data;
		if (chosenTab == "favorites"){
			// favorites
			$scope.sortField = localStorage['LeftBar_FavoriteContacts_sortTab_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_FavoriteContacts_sortTab_of_' + $rootScope.myPid]) : 'displayName';
			$scope.sortReverse = localStorage['LeftBar_FavoriteContacts_sortReverse_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_FavoriteContacts_sortReverse_of_' + $rootScope.myPid]) : false;
		} else if (chosenTab == "external"){
			// externals
			$scope.sortField = localStorage['LeftBar_ExternalContacts_sortTab_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_ExternalContacts_sortTab_of_' + $rootScope.myPid]) : 'displayName';
			$scope.sortReverse = localStorage['LeftBar_ExternalContacts_sortReverse_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_ExternalContacts_sortReverse_of_' + $rootScope.myPid]) : false;
		} else{
			// all
			$scope.sortField = localStorage['LeftBar_AllContacts_sortTab_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_AllContacts_sortTab_of_' + $rootScope.myPid]) : 'displayName';
			$scope.sortReverse = localStorage['LeftBar_AllContacts_sortReverse_of_' + $rootScope.myPid] ? JSON.parse(localStorage['LeftBar_AllContacts_sortReverse_of_' + $rootScope.myPid]) : false;
		}
	});

	// sort and save last chosen sort option
  $scope.sort = function(field) {
      if($scope.sortField != field) {
          $scope.sortField = field;
          $scope.sortReverse = false;
      }
      else {
          $scope.sortReverse = !$scope.sortReverse;
      }
      if (chosenTab == 'all'){
        localStorage['LeftBar_AllContacts_sortTab_of_' + $rootScope.myPid] = JSON.stringify(field);
        localStorage['LeftBar_AllContacts_sortReverse_of_' + $rootScope.myPid] = JSON.stringify($scope.sortReverse);
      } else if (chosenTab == 'favorites'){
        localStorage['LeftBar_FavoriteContacts_sortTab_of_' + $rootScope.myPid] = JSON.stringify(field);
        localStorage['LeftBar_FavoriteContacts_sortReverse_of_' + $rootScope.myPid] = JSON.stringify($scope.sortReverse);
	  		console.error('saving fave sort tab as - ', field);
      } else if (chosenTab == 'external'){
      	localStorage['LeftBar_ExternalContacts_sortTab_of_' + $rootScope.myPid] = JSON.stringify(field);
      	localStorage['LeftBar_ExternalContacts_sortReverse_of_' + $rootScope.myPid] = JSON.stringify($scope.sortReverse);
      }
  };
	
	/*
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
	
	$scope.searchFilter = function(contact){
		var query = $scope.$parent.query.toLowerCase();

		if (query == '')
			return true;
		else if (contact.displayName.toLowerCase().indexOf(query) != -1 || contact.primaryExtension.indexOf(query) != -1 || contact.phoneMobile.indexOf(query) != -1 || contact.primaryExtension.replace(/\D/g,'').indexOf(query) != -1 || contact.phoneMobile.replace(/\D/g,'').indexOf(query) != -1)
			return true;
	};
	*/
	
	$scope.showCallStatus = function($event, contact) {
		$event.stopPropagation();
        $event.preventDefault();
		
		// permission?
		if (contact.call.contactId == $rootScope.myPid)
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
