hudweb.controller('DockController', ['$q', '$timeout', '$location', '$scope', '$rootScope', 'HttpService', 'SettingsService', 'ContactService', 'GroupService', 'ConferenceService', 'QueueService', function($q, $timeout, $location, $scope, $rootScope, httpService, settingsService, contactService, groupService, conferenceService, queueService) {
	var column;
	
	$scope.gadgets = {};
	$scope.upload_time = 0;	
	
	$scope.upload_progress = 0;
	httpService.get_upload_progress().then(function(data){
		$scope.upload_progress = data.progress;	
	},function(error){},function(data){
		$scope.upload_progress = data.progress;
		if(data.started){
			$scope.upload_time = new Date().getTime();
		}
		if(data.progress == 100){
			$timeout(function(){$scope.upload_progress = 0;},1000);
		}	
		
	});
	
	var updateDock = function(data) {
		for (var key in data) {
			// check for dupes
			var found = false;
			
			for (var g in $scope.gadgets) {
				for (var i = 0; i < $scope.gadgets[g].length; i++) {
					if (key == $scope.gadgets[g][i].name) {
						found = true;
						break;
					}
				}
				
				if (found) break;
			}
			
			if (found) continue;
			
			// add new
			if (key.indexOf('GadgetConfig') != -1) {
				// gadget element
				var gadget = {
					name: key,
					value: JSON.parse(data[key]),
					data: {}
				};
				
				// create new array for each type of gadget
				if ($scope.gadgets[gadget.value.factoryId] === undefined)
					$scope.gadgets[gadget.value.factoryId] = [];
				
				switch (gadget.value.factoryId) {
					case 'GadgetContact':
						gadget.data = contactService.getContact(gadget.value.entityId);
						break;
					case 'GadgetGroup':
						gadget.data = groupService.getGroup(gadget.value.entityId);
						break;
					case 'GadgetConferenceRoom':
						gadget.data = conferenceService.getConference(gadget.value.entityId);							
						break;
					case 'GadgetQueueStat':
						gadget.data = queueService.getQueue(gadget.value.entityId);
						break;
					case 'GadgetUserQueues':
						gadget.data = queueService.getMyQueues();
						break;
				}
				
				if (gadget.data)
					$scope.gadgets[gadget.value.factoryId].push(gadget);
			}
		}
		
		// enable/disable grid layout
		if (data.use_column_layout == 'true') {
			$timeout(function() {
				// update draggable status
				$('#InnerDock .Gadget').draggable('disable');
			
				// turn sorting on for first time
				if (!column) {
					column = true;
					
					if ($('#InnerDock').hasClass('ui-sortable'))
						$('#InnerDock').sortable('enable');
					else {
						$('#InnerDock').sortable({
							revert: 1,
							handle: '.Header, .Content',
							helper: 'clone',
							appendTo: 'body',
							cursorAt: { top: 25 },
							start: function(event, ui) {
								// visual cues
								$(ui.helper).addClass('ui-draggable-dragging');
								ui.placeholder.height(ui.helper[0].scrollHeight);
							}
						});
					}
				}
			}, 100, false);
		}
		else {			
			// update draggable status
			$('#InnerDock .Gadget').draggable('enable');
			
			// turn sorting off for first time
			if ((column || column === undefined) && $('#InnerDock').hasClass('ui-sortable')) {
				column = false;
				
				$('#InnerDock').sortable('disable');
			}
		}
	};

	// initial sync
	$q.all([settingsService.getSettings(), contactService.getContacts(), queueService.getQueues()]).then(function(data) {
		updateDock(data[0]);
		
		// normal updates
		$scope.$on('settings_updated', function(event, data) {
			updateDock(data);
		});
	});
	
	$scope.$on('delete_gadget', function(event, data) {
		// remove from fdp
		httpService.sendAction('settings', 'delete', {name: data});
		
		// remove from ui
		for (var g in $scope.gadgets) {
			for (var i = 0, len = $scope.gadgets[g].length; i < len; i++) {
				if (data == $scope.gadgets[g][i].name) {
					$scope.gadgets[g].splice(i, 1);
					return;
				}
			}
		}
	});
	
	$scope.getContact = function(xpid) {
		return contactService.getContact(xpid);
	};

	$scope.isObjectEmpty = function(object){
		return !$.isEmptyObject(object);
	};
	
	$scope.parkedCalls = [];
	
	$scope.$on('parkedcalls_synced',function(event,data){
		if(data){
			for(var parkedCall in data){
				if(data[parkedCall].xef001type == "delete"){
					//delete $scope.parkedCalls[data[parkedCall.xpid]];
					for (var i = 0, iLen = $scope.parkedCalls.length; i < iLen; i++){
						if(data[parkedCall].xpid == $scope.parkedCalls[i].xpid){
							$scope.parkedCalls.splice(i,1);
							iLen--;
						}
					}
				
				}else{
					var toAdd = true;
					for (var i = 0, iLen = $scope.parkedCalls.length; i < iLen; i++){
						if(data[parkedCall].xpid == $scope.parkedCalls[i].xpid){
							toAdd = false;
						}
					}
					if(toAdd){
						$scope.parkedCalls.push(data[parkedCall]);
					}
				}
			}
		}
	});
	
	$scope.showCallStatus = function($event, contact) {
		$event.stopPropagation();
        $event.preventDefault();
		
		// permission?
		if (contact.call.type == 0 || contact.call.contactId == $rootScope.myPid)
			return;
	
		$scope.showOverlay(true, 'CallStatusOverlay', contact);
	};

	$scope.joinConference = function(conference) {
		var params = {
			conferenceId: conference.xpid,
			contactId: $rootScope.myPid,
		};
		httpService.sendAction("conferences", "joinContact", params);
				
		$location.path('/conference/' + conference.xpid);
	};

	$scope.goToFullRoute = function(itemType, itemXpid){
		if(itemXpid != $rootScope.myPid)
		{	
			switch(itemType){
				case "contact":
	        if (localStorage['ConversationWidget_' + itemXpid + '_tabs_of_' + $rootScope.myPid]){
	          // look up LS using xpid, if there's a tab saved related to that contact --> return url path w/ that tab
	          var endPath = "/contact/" + itemXpid + "/" + JSON.parse(localStorage['ConversationWidget_' + itemXpid + '_tabs_of_' + $rootScope.myPid]);
	          return $location.path(endPath);
	        } else {
	          // otherwise default to returning that contact 'chat' url tab
	          var endPath = "/contact/" + itemXpid + "/chat";
	          return $location.path(endPath);
	        }
					break;
				case "group":
	        if (localStorage['GroupSingle_' + itemXpid + '_tabs_of_' + $rootScope.myPid]){
	          var endPath = "/group/" + itemXpid + "/" + JSON.parse(localStorage['GroupSingle_' + itemXpid + '_tabs_of_' + $rootScope.myPid]);
	          return $location.path(endPath);
	        } else {
	          // need to take into account if not my group (then there's no chat --> go to members tab)
	          var groupIsMine = groupService.isMine(itemXpid);
	          var endPath = groupIsMine ? "/group/" + itemXpid + "/chat" : "/group/" + itemXpid + "/members";
	          return $location.path(endPath);
	        }
					break;
				case "queue":
	        if (localStorage['QueueWidget_' + itemXpid + '_tabs_of_' + $rootScope.myPid]){
	          var endPath = "/queue/" + itemXpid + "/" + JSON.parse(localStorage['QueueWidget_' + itemXpid + '_tabs_of_' + $rootScope.myPid]);
	          return $location.path(endPath);
	        } else {
	          var endPath = "/queue/" + itemXpid + "/agents";
	          return $location.path(endPath);
	        }
					break;
				case "conference":
	        if (localStorage['ConferenceSingle_' + itemXpid + '_tabs_of_' + $rootScope.myPid]){
	          var endPath = "/conference/" + itemXpid + "/" + JSON.parse(localStorage['ConferenceSingle_' + itemXpid + '_tabs_of_' + $rootScope.myPid]);
	          return $location.path(endPath);
	        } else {
	          var endPath = "/conference/" + itemXpid + "/currentcall";
	          return $location.path(endPath);
	        }
					break;
			}
		}
	};

}]);
