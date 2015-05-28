hudweb.controller('LeftBarController', ['$scope', '$rootScope', 'HttpService', 'PhoneService', 'SettingsService', 'ContactService', '$timeout', function($scope, $rootScope, httpService, phoneService, settingsService, contactService, $timeout) {
	$scope.query = '';
    $scope.tab = 'all';
	$scope.overlay = '';
	$scope.number = "";
	$scope.locations = [];
    $scope.autoClearTime;
    $scope.autoClearOn;


	$scope.makeCall = function(number){
        phoneService.makeCall(number);
    };

    // search if phone # dialed belongs to a contact then add to recents if it does
    $scope.storeRecentContact = function(phoneNumber){
        var localPid = JSON.parse(localStorage.me);
        $scope.recent = JSON.parse(localStorage['recents_of_' + localPid]);
        var dialedXpid;
        var contactMatch = false;
        contactService.getContacts().then(function(data){
            // it's gonna be either primaryExtension, phoneBusiness or phoneMobile
            for (var i = 0; i < data.length; i++){
                var singleContact = data[i];
                if (phoneNumber == singleContact.primaryExtension || phoneNumber == singleContact.phoneBusiness || phoneNumber == singleContact.phoneMobile){
                    dialedXpid = singleContact.xpid;
                    contactMatch = true;
                    break;
                }
            }
            // if the phone number dialed matches a contact, save contact to recent
            if (contactMatch){
                $scope.recent[dialedXpid] = {
                    type: 'contact',
                    time: new Date().getTime()
                };
                localStorage['recents_of_' + localPid] = JSON.stringify($scope.recent);
                $rootScope.$broadcast('recentAdded', {id: dialedXpid, type: 'contact', time: new Date().getTime()});
            } else if (!contactMatch){
                return;
            }
        });
    };

    httpService.getFeed('settings');

    $scope.$on('settings_updated', function(event, data){
        if (data['hudmw_searchautoclear'] == ''){
           $scope.autoClearOn = false;
        }
        else if (data['hudmw_searchautoclear'] == 'true'){
            $scope.autoClearOn = true;
        }
        if ($scope.autoClearOn && $scope.query != ''){
            $scope.autoClearTime = data['hudmw_searchautocleardelay'];
            $scope.clearSearch($scope.autoClearTime);          
        } else if ($scope.autoClearOn){
            $scope.autoClearTime = data['hudmw_searchautocleardelay'];
        } else if (!$scope.autoClearOn){
            $scope.autoClearTime = undefined;
        }
    });

    var currentTimer = 0;

    $scope.clearSearch = function(autoClearTime){
        if (autoClearTime){
            var timeParsed = parseInt(autoClearTime + '000');
            $timeout.cancel(currentTimer);
            currentTimer = $timeout(function(){
                $scope.query = '';
            }, timeParsed);         
        } else if (!autoClearTime){
            return;
        }
    };

    $scope.makePhoneCall = function(type,$event){
        switch(type){
            case 'dialpad':
                if ($event.keyCode == 13 && !$event.shiftKey) {
                    $scope.makeCall($scope.number);
                    $scope.storeRecentContact($scope.number);
                    $scope.number = '';
                    $event.preventDefault();
                }
                break;
        }
    };

    $scope.$on('locations_synced', function(event,data){
        if(data){
            var me = {};
            for (var i = 0; i < data.length; i++) {
                $scope.locations[data[i].xpid] = data[i];
            }
        }
    });
}]);
