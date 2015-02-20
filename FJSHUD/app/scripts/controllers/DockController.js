hudweb.controller('DockController', ['$scope', '$rootScope', 'HttpService', 'ContactService', 'GroupService', function($scope, $rootScope, httpService, contactService, groupService) {
	$scope.grid = true;
	
	$scope.$on('settings_synced', function(event, data) {
		for (key in data) {
			if (data[key].key == 'use_column_layout') {
				// enable/disable grid layout
				if (data[key].value == 'true') {
					$scope.grid = true;
					
					$('#DockPanel').sortable({
						revert: 1,
						handle: '.Header, .Scrollable'
					});
				}
				else {
					$scope.grid = false;
					
					try {
						$('#DockPanel').sortable('disable');
					}
					catch(e) { }
				}
				
				break;
			}
		}
	});
}]);
