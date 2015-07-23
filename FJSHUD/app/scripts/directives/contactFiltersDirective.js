hudweb.directive('contactFilters', function ($rootScope) {
	return {
		restrict: "A",
		link: function(scope, element, attrs) {
			var tab = scope.tab;
			var favWatcher;
			
			// wait for contacts to load
			var contactWatcher = scope.$watch('contacts.length', function(val) {
				if (val > 0) {
					filterContacts();
					
					// kill this watcher and create new ones
					contactWatcher();
					setupWatchers();
				}
			});
			
			function setupWatchers() {
				// tab click
				scope.$watch('tab', function(val) {
					tab = val;
					
					// filter every time we click a contact-related tab
					if (tab != 'groups' && tab != 'recent') {
						filterContacts();
						
						// replaces ng-show logic from index.html
						$(element).show();
					}
					else
						$(element).hide();
						
					// create temp watcher for favorite updates
					if (tab == 'favorites') {
						favWatcher = scope.$watch('favorites', function() {
							filterContacts();
						}, true);
					}
					else if (favWatcher)
						favWatcher();
				});
			
				// search box
				scope.$watch('$parent.query', function(val) {
					var query = val.toLowerCase();

					// show all
					if (query == '')
						$('.ContactList .ListRow').show();
					// filter down
					else {
						$('.ContactList .ListRow').each(function() {
							var contact = angular.element($(this)).scope().contact;
							
							if (contact.displayName.toLowerCase().indexOf(query) != -1 || contact.primaryExtension.indexOf(query) != -1 || contact.phoneMobile.indexOf(query) != -1 || contact.primaryExtension.replace(/\D/g,'').indexOf(query) != -1 || contact.phoneMobile.replace(/\D/g,'').indexOf(query) != -1)
								$(this).show();
							else
								$(this).hide();
						});
					}
				});
			}
			
			function filterContacts() {
				$('.ContactList .ListRow').each(function() {
					var contact = angular.element($(this)).scope().contact;
					
					if (tab == 'all' && contact.xpid != $rootScope.myPid)
						$(this).removeClass('Hide');
					else if (tab == 'external' && contact.primaryExtension == '')
						$(this).removeClass('Hide');
					else if (tab == 'favorites' && scope.favorites[contact.xpid] !== undefined)
						$(this).removeClass('Hide');
					else
						$(this).addClass('Hide');
				});
			}
		}
	};
});