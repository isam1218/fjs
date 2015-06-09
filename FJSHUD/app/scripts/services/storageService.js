hudweb.service('StorageService', ['$rootScope', 'ContactService', function($rootScope,contactService) {
	var service = this;
	var recents;
	
	service.getRecents = function() {
		return recents;
	};
	
	service.saveRecent = function(type, xpid) {
		if (!recents) return;
		
		recents[xpid] = {
			type: type,
			time: new Date().getTime()
		};
		
		localStorage['recents_of_' + $rootScope.myPid] = JSON.stringify(recents);
	};
	
	service.saveRecentByPhone = function(number) {
		// search if phone # dialed belongs to a contact then add to recents if it does
        contactService.getContacts().then(function(data){
            // it's gonna be either primaryExtension, phoneBusiness or phoneMobile
            for (var i = 0, len = data.length; i < len; i++) {
                var contact = data[i];
				
                if (number == contact.primaryExtension || number == contact.phoneBusiness || number == contact.phoneMobile){
                    service.saveRecent('contact', contact.xpid);
                    break;
                }
            }
        });
	};
	
	// wait for user xpid
	var watcher = $rootScope.$watch('myPid', function() {
		if ($rootScope.myPid) {
			watcher();
			
			if (localStorage['recents_of_' + $rootScope.myPid] === undefined)
				localStorage['recents_of_' + $rootScope.myPid] = '{}';
			
			recents = JSON.parse(localStorage['recents_of_' + $rootScope.myPid]);
		}
	});
}]);