hudweb.controller('ConversationWidgetController', ['$scope', '$rootScope', '$routeParams', 'ContactService','PhoneService','$filter','$timeout', function($scope, $rootScope, $routeParams, contactService,phoneService,$filter,$timeout) {
    $scope.contactID = $routeParams.contactId;
    $scope.contact = contactService.getContact($scope.contactID);
	$scope.messages = [];
	
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
	
    var getXpidInC = $rootScope.$watch('myPid', function(newVal, oldVal){
        if (!$scope.globalXpid){
            $scope.globalXpid = newVal;
                $scope.selected = localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
                $scope.toggleObject = localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $scope.globalXpid]) : {item: 0};
                getXpidInC();
        } else {
            getXpidInC();
        }
    });

    $scope.$on('pidAdded', function(event, data){
        $scope.globalXpid = data.info;
        $scope.selected = localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $scope.globalXpid]) : $scope.tabs[0].lower;
        $scope.toggleObject = localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $scope.globalXpid] ? JSON.parse(localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $scope.globalXpid]) : {item: 0}; 
    });

    $scope.saveCTab = function(tab, index){
        switch(tab){
            case "chat":
                $scope.selected = $scope.tabs[0].lower;
                localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
            case "voicemails":
                $scope.selected = $scope.tabs[1].lower;
                localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
            case "groups":
                $scope.selected = $scope.tabs[2].lower;
                localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
            case "queues":
                $scope.selected = $scope.tabs[3].lower;
                localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
            case "calllog":
                $scope.selected = $scope.tabs[4].lower;
                localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
            case "recordings":
                $scope.selected = $scope.tabs[5].lower;
                localStorage['ConversationWidget_' + $routeParams.contactId + '_tabs_of_' + $scope.globalXpid] = JSON.stringify($scope.selected);
                $scope.toggleObject = {item: index};
                localStorage['ConversationWidget_' + $routeParams.contactId + '_toggleObject_of_' + $scope.globalXpid] = JSON.stringify($scope.toggleObject);
                break;
        }
    }; 

    function updateFavicon() {
        var link = document.getElementById("favicon");
        if(link) {
            link.href = $scope.contact.getAvatarUrl(32,32);
            document.title= $scope.contact.displayName;
        }
    }

    $scope.$on("$destroy", function() {
	
    });
}]);
