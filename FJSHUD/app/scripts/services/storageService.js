hudweb.service('StorageService', ['$rootScope', 'ContactService', 'SettingsService', function($rootScope, contactService, settingsService) {
	var service = this;
	var recents;
	var chats;
	var selected;
	var tabs;
	var toggleObj;
	
	// wait for user xpid
	settingsService.getSettings().then(function() {
		if (localStorage['recents_of_' + $rootScope.myPid] === undefined)
			localStorage['recents_of_' + $rootScope.myPid] = '{}';
		
		if (localStorage['chats_of_' + $rootScope.myPid] === undefined)
			localStorage['chats_of_' + $rootScope.myPid] = '{}';
			
		recents = JSON.parse(localStorage['recents_of_' + $rootScope.myPid]);
		chats = JSON.parse(localStorage['chats_of_' + $rootScope.myPid]);
	});

	/* 
	SCOPE.SELECTED
	*/
	service.saveSelected = function(route){
		selected = route;
	};

	service.getSelected = function(){
		return selected;
	};

	service.saveTabs = function(tabsArray){
		tabs = tabsArray;
	};

	service.getTabs = function(){
		return tabs;
	};

	service.saveToggleObj = function(toggleObject){
		toggleObj = toggleObject;
	};

	service.getToggleObj = function(){
		return toggleObj;
	};

	
	/**
		RECENTS
	*/
	
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
	
	/**
		CHAT MESSAGES
	*/
	
	service.saveChatMessage = function(xpid, message) {
		if (!chats)
			return;
		else if (!message || message == '')
			delete chats[xpid];
		else
			chats[xpid] = message;
		
		localStorage['chats_of_' + $rootScope.myPid] = JSON.stringify(chats);
	};
	
	service.getChatMessage = function(xpid) {
		if (chats && chats[xpid])
			return chats[xpid];
		else
			return '';
	};
}]);