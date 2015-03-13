hudweb.controller('ChatController', ['$scope','HttpService', '$routeParams', 'UtilService', 'ContactService', 'PhoneService','$interval',
	function($scope,httpService, $routeParams,utilService,contactService,phoneService,$interval) {

	var version = 0;
	
	$scope.upload = {};
	$scope.glued = true;
	$scope.loading = true;
	
	// send to pop-up controller
	$scope.showAttachmentOverlay = function() {
		var name = '', audience = '';
		
		if ($scope.contact) {
			name = $scope.contact.displayName;
			audience = 'contact';
		}
		else if ($scope.conference) {
			name = $scope.conference.name;
			audience = 'conference';
		}
		else if ($scope.group) {
			name = $scope.group.name;
			audience = 'group';
		}
		
		$scope.$parent.showOverlay(true, 'FileShareOverlay', {
			name: name,
			audience: audience,
			xpid: $scope.targetId
		});
	};

	$scope.showDownloadAttachmentOverlay = function(selected){
		var downloadables = [];
		var current = 0;
		
		for(i = 0; i < $scope.messages.length; i++){
			if ($scope.messages[i].data.attachment) {
				var attachments = $scope.messages[i].data.attachment;
				
				for(a = 0; a < attachments.length; a++) {
					var tempAttach = attachments[a];
					tempAttach.created = $scope.messages[i].created;
					
					downloadables.push(tempAttach);
					
					// mark the one that was clicked
					if (attachments[a] == selected)
						current = downloadables.length-1;
				}
			}
		}
		
		$scope.$parent.showOverlay(true, 'FileShareOverlay', {
			downloadables: downloadables,
			current: current
		});
	};

    $scope.getAttachment = function(url){
    	return httpService.get_attachment(url);
    };
	
    httpService.getChat($scope.feed,$scope.targetId).then(function(data) {
		version = data.h_ver;
		
		$scope.loading = false;
		$scope.messages = data.items;
		addDetails();
	});

   	// get additional messages from sync
	$scope.$on('streamevent_synced', function(event, data) {
		for (key in data) {
			// prevent duplicates
			var dupe = false;
			
			for (i = 0; i < $scope.messages.length; i++) {
				if (data[key].xpid == $scope.messages[i].xpid) {
					dupe = true;
					break;
				}
			}
		

			if (dupe) continue;
			
			var from = data[key].from.replace('contacts:', '');
			var to = data[key].to ? data[key].to.replace('contacts:', '') : null;
			
			// only attach messages related to this user
			if (from == $scope.contactID || to == $scope.contactID){
				$scope.messages.push(data[key]);
			}

		}
		
		addDetails();
	});
	
	$scope.sendMessage = function() {
		if (this.message == '')
			return;
			
		var data = {
			type: $scope.targetType,
			audience: $scope.targetAudience,
			to: $scope.targetId,
			message: this.message,
		};
		
		httpService.sendAction('streamevent', 'sendConversationEvent', data);
		
		this.message = '';
	};

	// look for enter key
	$scope.chatKeypress = function($event) {
		if ($event.keyCode == 13 && !$event.shiftKey) {
			this.sendMessage();
			$event.preventDefault();
		}
	};
	
	$scope.searchChat = function(increment) {
		var spans = document.querySelectorAll(".highlighted");
			
		if ($scope.query != '' && spans.length > 0) {			
			// temporarily disable sticky directive
			$scope.glued = false;
				
			var searchIndex = -1;
			
			for (i = 0; i < spans.length; i++) {
				if (spans[i].className.indexOf('found') != -1)
					searchIndex = i;
				
				spans[i].className = 'highlighted';
			}
			
			searchIndex += increment;
			
			// loop
			if (searchIndex < 0)
				searchIndex = spans.length - 1;
			else if (searchIndex >= spans.length)
				searchIndex = 0;
				
			spans[searchIndex].className = 'highlighted found';
			spans[searchIndex].scrollIntoView();
		}
	};

	// apply name and avatar
	var addDetails = function() {
		// wait for sync to catch up
		contactService.getContacts().then(function(data) {
			for (i = 0; i < $scope.messages.length; i++) {
				for (key in data) {
					if (data[key].xpid == $scope.messages[i].from.replace($scope.feed +':', '')) {
						$scope.messages[i].avatar = data[key].getAvatar(28);
						$scope.messages[i].displayName = data[key].displayName;
						
					}
				}
			}
		});
	};

	var chatLoop = $interval(function() {	
		var scrollbox = document.getElementById('ListViewContent');
	
		// check scroll position
		if (!$scope.loading && $scope.messages.length > 0 && scrollbox.scrollTop == 0) {
			$scope.loading = true;
			
			// ping server
			httpService.getChat($scope.feed, $scope.targetId, version).then(function(data) {
				version = data.h_ver;
			
				$scope.loading = false;
				$scope.messages = data.items.concat($scope.messages);				
				addDetails();

				// bump scroll down
				if (scrollbox.scrollTop == 0)
					scrollbox.scrollTop = 100;
				
				// end of history
				if (version == -1)
					$interval.cancel(chatLoop);
			});
		}
	}, 500);

	$scope.$on("$destroy", function() {
		$interval.cancel(chatLoop);
    });	
}]);