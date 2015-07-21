hudweb.controller('ConversationWidgetController', ['$scope', '$rootScope', '$routeParams', 'ContactService', 'SettingsService', 'StorageService', function($scope, $rootScope, $routeParams, contactService, settingsService, storageService) {
    $scope.contactID = $routeParams.contactId;
    $scope.contact = contactService.getContact($scope.contactID);
	$scope.messages = [];
	
	// store recent
	storageService.saveRecent('contact', $scope.contactID);
	
	var CONFERENCE_CALL_TYPE = 0;
	var CONTACT_CALL_TYPE = 4;

    $scope.conversationType = 'conversation';
    $scope.enableChat = true;
    $scope.enableFileShare = true;
    $scope.enableTextInput = true;
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
	
    settingsService.getSettings().then(function() {            
        if($routeParams.route != undefined ){
            $scope.selected = $routeParams.route;
            localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                for(var i = 0, iLen = $scope.tabs.length; i < iLen; i++){
                    if($scope.tabs[i].lower == $routeParams.route){
                        $scope.toggleObject = {item: i};
                        localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                    }
                }
            localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $rootScope.myPid] = JSON.stringify($scope.selected);
            localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $rootScope.myPid] = JSON.stringify($scope.toggleObject);
        }else{
            // $scope.globalXpid = $rootScope.myPid;
            // $scope.selected = localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
            // $scope.toggleObject = localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $scope.globalXpid]) : {item: 0};
            $scope.selected = localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $rootScope.myPid] ? JSON.parse(localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $rootScope.myPid]) : 'chat';
            $scope.toggleObject = localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $rootScope.myPid] ? JSON.parse(localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $rootScope.myPid]) : 0;
        }
    });
    


    $scope.saveCTab = function(tab, index){
        $scope.selected = tab;
        $scope.toggleObject = {item: index};
        localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $rootScope.myPid] = JSON.stringify($scope.selected);
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
