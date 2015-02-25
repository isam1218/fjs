hudweb.controller('ContextMenuController', ['$rootScope', '$scope', 'ContactService', 'GroupService', 'SettingsService', 'HttpService', function($rootScope, $scope, contactService, groupService, settingsService, httpService) {
	$scope.xpid;
	$scope.type;
	$scope.canDock = true;
	
	// populate contact info from directive
	$scope.$on('contextMenu', function(event, data) {
		$scope.xpid = data.xpid;
		
		// is a group
		if (data.members) {
			$scope.type = 'Group';
			$scope.group = data;
			$scope.contact = null;
			$scope.isMine = groupService.isMine(data.xpid);
		}
		else {
			$scope.type = 'Contact';
			$scope.contact = data;
			$scope.group = null;
			$scope.isFavorite = groupService.isFavorite(data.xpid);
		}
		
		// check if in dock
		settingsService.getSettings().then(function(data) {
			$scope.canDock = true;
			
			for (key in data) {
				if (key.indexOf('GadgetConfig') != -1 && key.indexOf($scope.xpid) != -1) {
					$scope.canDock = false;
					break;
				}
			}
		
			$scope.$safeApply();
		});
	});
	
	// add to dock area
	$scope.dockItem = function(add) {
		if (add) {
			var data = {
				name: 'GadgetConfig__empty_Gadget' + $scope.type + '_' + $scope.xpid,
				value: JSON.stringify({
					"contextId": "empty",
					"factoryId": "Gadget" + $scope.type,
					"entityId": $scope.xpid,
					"config": {"x": 0, "y": 0},
					"index": 1
				})
			};
			
			httpService.sendAction('settings', 'update', data);
		}
		else {
			httpService.sendAction('settings', 'delete', {name: 'GadgetConfig__empty_Gadget' + $scope.type + '_' + $scope.xpid});
		}
	};
	
	// send to contacts widget
	$scope.editContact = function() {
		$rootScope.$broadcast('editContact', $scope.contact);
	};
	
	$scope.editGroup = function() {
		$rootScope.$broadcast('editGroup', $scope.group);
	};
	
	$scope.removeFavorite = function() {
		httpService.sendAction('groupcontacts', 'removeContactsFromFavorites', {contactIds: $scope.contact.xpid});
	};
	
	$scope.makeCall = function(number) {
		httpService.sendAction('me', 'callTo', {phoneNumber: number});
	};
	
	$scope.sendGroupMail = function() {
		var emails = [];
		
		angular.forEach($scope.group.members, function(obj) {
			var contact = contactService.getContact(obj.contactId);
			
			if (contact.email)
				emails.push(contact.email);
		});
		
		window.open('mailto:' + emails.join(';'));
	};
}]);