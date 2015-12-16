hudweb.directive('contactFilters', function ($rootScope) {
	return {
		restrict: "A",
		scope: '=',
		link: function(scope, element, attrs) {
			var tab = scope.tab;
			var favWatcher;
			
			// wait for contacts to load
			var contactWatcher = scope.$watch('contacts.length', function(val) {
				if (val > 0) {
					setTimeout(filterContacts, 100);
					
					// kill this watcher and create new ones
					contactWatcher();
					setupWatchers();
				}
			});
			
			function setupWatchers() {
				// tab click
				scope.$watch('tab', function(newVal, oldVal) {
					if (newVal == oldVal) return;
					
					tab = newVal;
					
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
				scope.$watch('$parent.query', function(newVal, oldVal) {
					if (newVal == oldVal) return;

					var query = newVal.toLowerCase();

					// show all
					if (query == '')
						$('.ContactList .ListRow').show();
					// filter down
					else {
						for (var i = 0, len = scope.contacts.length; i < len; i++) {
							var contact = scope.contacts[i];
							var row = element[0].getElementsByClassName('ContactRow-' + contact.id)[0];
							
							//if (contact.displayName.toLowerCase().indexOf(query) != -1 || contact.primaryExtension.indexOf(query) != -1 || contact.phoneMobile.indexOf(query) != -1 || contact.primaryExtension.replace(/\D/g,'').indexOf(query) != -1 || contact.phoneMobile.replace(/\D/g,'').indexOf(query) != -1)
							if (contact.username.toLowerCase().indexOf(query) != -1 || contact.extension.indexOf(query) != -1 || contact.extension.replace(/\D/g,'').indexOf(query) != -1)
								$(row).show();
							else
								$(row).hide();
						}
					
						row = null;
					}
				});
			}
			
			function filterContacts() {
				for (var i = 0, len = scope.contacts.length; i < len; i++) {
					var contact = scope.contacts[i];
					var row = element[0].getElementsByClassName('ContactRow-' + contact.id)[0];
					var my_id = $rootScope.myPid.split('_')[1];	
					
					if (tab == 'all' && contact.id != my_id)
						$(row).removeClass('Hide');
					else if (tab == 'external' && contact.extension == '')
						$(row).removeClass('Hide');
					else if (tab == 'favorites' && scope.favorites[contact.id] !== undefined)
						$(row).removeClass('Hide');
					else
						$(row).addClass('Hide');
				}
				
				row = null;
			}
		}
	};
});