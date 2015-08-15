hudweb.controller('ZoomWidgetController', ['$scope', '$http', 'HttpService', function($scope, $http,httpService) {
     $scope.tab = 'Home';
     $scope.showHome=true;
    //fjs.ui.AddContactMenuController.call(this, $scope, dataManager, "views/AddContactPopupMenu.html");

    $scope.joinMeeting = function(meetingId){
        window.open("https://api.zoom.us/j/" + meetingId,'_blank');
    };

    $scope.hasResult = false;
    $scope.startUrl = "";
    $scope.joinUrl = "";

    $scope.inMeeting = false;

   

    $scope.setScheduleTab = function(tab) {
        $scope.tab = tab;
        $scope.query = '';

        if(tab == "Meetings"){
            $scope.showHome =false;
        }
        else if(tab =="Home"){
            $scope.showHome=true;
        }
    };  

    $scope.startMeeting = function(option){
        var data = {};
        var users = ""

        for (var i = 0; i < $scope.addedContacts.length; i++) {
            users = users + $scope.addedContacts[i].xpid + ",";
        }

        data["topic"]="";
        data["users"]= users;
        data["option_start_type"]= option;
        $http({
            method:'POST',
            url:fjs.CONFIG.SERVER.serverURL + "/v1/zoom",
           data: $.param(data),
           headers:{
                'Authorization': 'auth=' + localStorage.authTicket,//'auth=7aa21bf443b5c6c7b5d6e28a23ca5479061f36f5181b7677',
                'node':localStorage.nodeID,//'afdp37_1',
                'Content-Type':'application/x-www-form-urlencoded',
            }
        }).then(function(response){
            var data = response;
            $scope.startUrl = response.data.start_url;
            $scope.joinUrl = response.data.join_url;
            window.open($scope.startUrl, '_blank');
            $scope.inMeeting = true;
            $scope.$safeApply();

        });
        /*dataManager.sendFDPRequest("/v1/zoom", data, function(xhr, data, isOk) {
               context.onAjaxResult(isOk, data)
        });*/
    };

    $scope.bodyDisplay=true;

    $scope.bodyStartedDisplay=false;

    $scope.bodyErrorDisplay=false;

    $scope.startUrl = "";

    $scope.joinUrl = "";
    
    $scope.addedContacts = [];
    $scope.searchContact = function(contact){
     /*   for (var i = 0; i < $scope.addedContacts.length; i++) {
            if (contact == $scope.addedContacts[i])
                return;
        }*/
        $scope.addedContacts.push(contact);
    }

     $scope.getAvatarUrl = function(xpid,width, height) {
        if(xpid){
            return httpService.get_avatar(xpid,width,height);
        }
    };


    $scope.deleteContact = function(contactId){
        for (var i = 0; i < $scope.addedContacts.length; i++) {
            if($scope.addedContacts[i].xpid == contactId){
                $scope.addedContacts.splice(i,1);
            }
        }
        $scope.$safeApply();
    }

    this.onAjaxResult = function(isOk, _data){
        $scope.hasResult = true;
        if(!isOk){
            $scope.$safeApply(function(){
                $scope.bodyDisplay=false;
                $scope.bodyStartedDisplay=false;
                $scope.bodyErrorDisplay=true;
            });
            return;
        }
        var data = JSON.parse(_data);
        window.open(data["start_url"], '_blank');
        $scope.$safeApply(function(){
            $scope.startUrl = data["start_url"];
            $scope.joinUrl = data["join_url"];

            $scope.bodyDisplay=false;
            $scope.bodyStartedDisplay=(data["start_url"]&&data["join_url"]);
            $scope.bodyErrorDisplay=!$scope.bodyStartedDisplay;
        });
    };
}]);


hudweb.controller('ModalDemoCtrl', function ($scope, $modal, $log) {

  $scope.items = ['item1', 'item2', 'item3'];

  $scope.animationsEnabled = true;

  $scope.open = function (size) {

    var modalInstance = $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    }, function () {
      $log.info('Modal dismissed at: ' + new Date());
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };

  $scope.hourOption = [];

  for(var hour = 0; hour <=12; hour++){
    $scope.hourOption.push(hour);
  }

  $scope.minOption = [];

  for(var min = 0; min <=60; min++){
    $scope.minOption.push(min);
  }
  console.log('Duration',min);
  console.log('Option',$scope.minOption);

});

/*Please note that $modalInstance represents a modal window (instance) dependency.
It is not the same as the $modal service used above.
*/
hudweb.controller('ModalInstanceCtrl', function ($scope, $modalInstance, items) {

  $scope.items = items;
  $scope.selected = {
    item: $scope.items[0]
  };

  $scope.ok = function () {
    $modalInstance.close($scope.selected.item);
  };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
});


hudweb.controller('DatepickerDemoCtrl', function ($scope) {
  $scope.today = function() {
    $scope.dt = new Date();
  };
  $scope.today();

  $scope.clear = function () {
    $scope.dt = null;
  };

  // Disable weekend selection
  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };

  $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();

  $scope.open = function($event) {
    $scope.status.opened = true;
  };

  $scope.dateOptions = {
    formatYear: 'yy',
    startingDay: 1
  };

  $scope.formats = ['MM/dd/yyyy', 'yyyy/MM/dd', 'dd.MM.yyyy', 'shortDate'];
  $scope.format = $scope.formats[0];

  $scope.status = {
    opened: false
  };

  var tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  var afterTomorrow = new Date();
  afterTomorrow.setDate(tomorrow.getDate() + 2);
  $scope.events =
    [
      {
        date: tomorrow,
        status: 'full'
      },
      {
        date: afterTomorrow,
        status: 'partially'
      }
    ];

  $scope.getDayClass = function(date, mode) {
    if (mode === 'day') {
      var dayToCheck = new Date(date).setHours(0,0,0,0);

      for (var i=0;i<$scope.events.length;i++){
        var currentDay = new Date($scope.events[i].date).setHours(0,0,0,0);

        if (dayToCheck === currentDay) {
          return $scope.events[i].status;
        }
      }
    }

    return '';
  };
});