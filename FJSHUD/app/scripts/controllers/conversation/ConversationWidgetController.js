hudweb.controller('ConversationWidgetController', ['$scope', '$rootScope', '$routeParams', 'ContactService', 'SettingsService', 'StorageService', '$location', function($scope, $rootScope, $routeParams, contactService, settingsService, storageService, $location) {
    $scope.contactID = $routeParams.contactId;
    $scope.contact = contactService.getContact($scope.contactID);
	$scope.messages = [];
	
	// store recent
	storageService.saveRecent('contact', $scope.contactID);
	
	var CONFERENCE_CALL_TYPE = 0;
	var CONTACT_CALL_TYPE = 4;

    $scope.conversationType = 'conversation';
    $scope.call = {};
    $scope.targetId = $scope.contactID;
    $scope.targetAudience="contact";
    $scope.targetType="f.conversation.wall";
    $scope.feed = "contacts";
	
    $scope.tabs = [{upper:$scope.verbage.chat, lower: 'chat'}, 
    {upper: $scope.verbage.voicemail_tab, lower: 'voicemails'}, 
    {upper: $scope.verbage.group, lower: 'groups'}, 
    {upper: $scope.verbage.queues, lower: 'queues'}, 
    {upper: $scope.verbage.call_log_tab, lower: 'calllog'}, 
    {upper: $scope.verbage.recordings, lower: 'recordings'}];
	
    // send tabs to app.js
    storageService.saveTabs($scope.tabs);

    // if route is defined (click on specific tab or manaully enter url)...
    if ($routeParams.route){
        $scope.selected = $routeParams.route;
        for (var i = 0; i < $scope.tabs.length; i++){
            if ($scope.tabs[i].lower == $routeParams.route){
                $scope.toggleObject = {item: i};
                break;
            }
        }
        localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $rootScope.myPid] = JSON.stringify($scope.selected);
        localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $rootScope.myPid] = JSON.stringify($scope.toggleObject);
    } else{
        // otherwise when route isn't defined, use the tabs set in app.js 
        $scope.selected = storageService.getSelected();
        $scope.toggleObject = storageService.getToggleObj();
    }

    $scope.saveCTab = function(tab, index){
        $scope.toggleObject = {item: index};
        localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $rootScope.myPid] = JSON.stringify(tab);
        localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $rootScope.myPid] = JSON.stringify($scope.toggleObject);
    };

    $scope.tabFilter = function(){
        var recordingPerm = settingsService.getPermission('showCallCenter');
		
        return function(tab){
            switch(tab.lower){
				case "recordings":
					if (recordingPerm)
						return true;
					else
						return false;
				
					break;
                case "chat":
                    if($scope.contact.primaryExtension == '' && $scope.contact.jid == '' && $scope.contact.ims == ''){
                        return false;
                    }else{
                        return true;
                    }
                    break;
                case "groups":
                    if($scope.contact.primaryExtension == ''){
                        return false;
                    }else{
                        return true;
                    }
                    break;
                case "queues":
                    if($scope.contact.primaryExtension == ''){
                        return false;
                    }else{
                        return true;
                    }
                    break;
            }

            return true;
        };
	};

    $scope.$on("$destroy", function() {
	
    });
}]);
