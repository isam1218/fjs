hudweb.service("sharedData",function(){
  this.meeting = {};
  this.meeting.meetingTopic = '';
  this.meeting.timeSelect = null;
  this.meeting.dt = null;
  this.meeting.AmPm = '';
  this.meeting.hourDuration = null;
  this.meeting.minDuration = null;
  this.meeting.timezone = '';
  this.meeting.meeting_id = null;
  this.meeting.update_meeting_id = null;
  this.meeting.start_url = '';
  this.password = '';
  this.jbh=null;
});

hudweb.controller('ZoomWidgetController', ['$scope', '$http' ,'HttpService','sharedData','$rootScope','SettingsService', '$modal','$log',function($scope, $http,httpService,sharedData,$rootScope,settingsService,$modal,$log) {

     $scope.tab = 'Home';
     $scope.showHome=true;
     $scope.pmi_id = {};
     $scope.pmi_id.pmi =null;
     $scope.host_id = null;
     $scope.meetingList = [];
     $scope.Time = "Time: ";
    
    



     var getURL = function(action) {

    var url = 
       action
       
      + '?fonalityUserId=' + $rootScope.myPid.split('_')[1]
      + '&serverId=' + $rootScope.meModel.server_id
      + '&serverType=' + ($rootScope.meModel.server.indexOf('pbxtra') != -1 ? 'pbxtra' : 'trixbox')
      + '&authToken=' + localStorage.authTicket;
    
    return url;
  };
 
  var authTicket = localStorage.authTicket;
  $scope.authTicket = authTicket;

 
    //fjs.ui.AddContactMenuController.call(this, $scope, dataManager, "views/AddContactPopupMenu.html");
    $scope.joinMeeting = function(meetingId){
        window.open("https://api.zoom.us/j/" + meetingId,'_blank');
    };

    $scope.joinScheduledMeeting = function(meetingId){

       $http.get(fjs.CONFIG.SERVER.ppsServer +'zoom/pmiStartUrl'+'?meetingId='+meetingId+'&hostId='+$scope.host_id+'&authToken='+$scope.authTicket).success(function(response){
        console.log("PMISTUFF",response);
        window.open(response.start_url);

       });

    };
    $scope.startScheduledMeeting = function(start_url){
      window.open(start_url);
    }

    $scope.openEditModal = function(meetingId){
      $scope.meeting_id = meetingId;
      $scope.scheduleBtn = false;
      $scope.updateBtn = true;
          $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: 'lg',
      resolve: {
        schedule: function () {
          return $scope.scheduleBtn;
        },
        update: function(){
          return $scope.updateBtn;
        },
        shared: function(){
          return $scope.meeting_id;
        },
        host: function(){
          return $scope.host_id;
        }
      }
    });
    };


          
    $scope.copy = function(startTime,topic,meeting,timezone){
                

           $http.get(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/meetingList')).success(function(response){
            console.log("DATA",response);
            response.meetings.meeting_id = meeting;
            sharedData.meeting.meeting_id = response.meetings.meeting_id;
            sharedData.meeting.start_url = response.meetings.start_url;
            sharedData.meeting.meetingTopic = topic;
            sharedData.meeting.timeSelect = startTime;
            sharedData.meeting.timezone = timezone;
          });

      /*sharedData.meeting.timeSelect = startTime;
      sharedData.meeting.meetingTopic = topic;
      sharedData.meeting.timezone = timezone;*/
      sharedData.meeting.AmPm = "";
      

      console.log("MEETING ID",sharedData.meeting.meeting_id);
    

     $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'copyToClipboard.html',
      controller: 'ModalInstanceCtrl',
      size: 'lg',
      resolve: {
        schedule: function () {
          
        },
        update:function(){

        },
        shared: function(){

        },
        host: function(){

        }
      }
    });
    };

       $scope.copyPmi = function(topic,meeting){
                        $scope.Time = "Time: Your meeting will start immediately";

           $http.get(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/meetingList')).success(function(response){
            console.log("DATA",response);
            response.meetings.meeting_id = meeting;
            sharedData.meeting.meeting_id = response.meetings.meeting_id;
});

      sharedData.meeting.meetingTopic = $rootScope.meModel.my_jid.split("@")[0] + " Personal Meeting Room";
      sharedData.meeting.timeSelect = $scope.Time;
      console.log("MEETING ID",sharedData.meeting.meeting_id);
      
    $scope.Time = "Your meeting will start immediately.";

     $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'copyToClipboardPMI.html',
      controller: 'ModalInstanceCtrlTwo',
      size: 'lg',
      resolve: {
        items: function () {
          return $scope.items;
        }
      }
    });
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
            $scope.showMeetings=true;
        }
        if(tab =="Home"){
            $scope.showHome=true;
            $scope.showMeetings = false;
        }
    };  

    $scope.startMeeting = function(option){
        var data = {};
        var users = "";

        for (var i = 0, iLen = $scope.addedContacts.length; i < iLen; i++) {
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
    };

     $scope.getAvatarUrl = function(xpid,width, height) {
        if(xpid){
            return httpService.get_avatar(xpid,width,height);
        }
    };


    $scope.deleteContact = function(contactId){
        for (var i = 0, iLen = $scope.addedContacts.length; i < iLen; i++) {
            if($scope.addedContacts[i].xpid == contactId){
                $scope.addedContacts.splice(i,1);
                iLen--;
            }
        }
        $scope.$safeApply();
    };

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

  settingsService.getSettings().then(function() {
     
   $http.get(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/meetingList')).success(function(response){
        console.log("MEETING DATA",response);
        $scope.pmi_id.pmi = response.pmi;
        $scope.host_id = response.host_id;
        $scope.meetingList = response.meetings;

       

        

      });
 });

  $scope.getData = function(){

  
     $http.get(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/meetingList')).success(function(response){
        console.log("MEETING DATA",response);
        $scope.pmi_id.pmi = response.pmi;
        $scope.host_id = response.host_id;
        $scope.meetingList = response.meetings;

        
           
        

      });


  }


  $scope.deleteMeeting = function(meetingId){
    $http({method:"POST",url: fjs.CONFIG.SERVER.ppsServer +'zoom/deleteMeeting'+'?hostId='+$scope.host_id+'&meetingId='+meetingId+'&authToken='+localStorage.authTicket}).success(function(data){
       console.log("Delete DATA",data);
            //httpService.sendAction('voicemailbox', 'delete', fjs.CONFIG.SERVER.ppsServer +'zoom/deleteMeeting'+'?hostId='+$scope.host_id+'&meetingId='+meetingId+'&authToken='+localStorage.authTicket);

        

      });
    /*$http.get(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/meetingList')).success(function(data){
      console.log(data);
    })*/
  };






/*}]);


hudweb.controller('ModalDemoCtrl', function ($scope, $modal, $log,$rootScope,$http) {
*/
  $scope.items = ['item1', 'item2', 'item3'];

  $scope.animationsEnabled = true;


  $scope.open = function (size) {
    $scope.scheduleBtn = true;
    $scope.updateBtn = false;
    var modalInstance = $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'myModalContent.html',
      controller: 'ModalInstanceCtrl',
      size: size,
      resolve: {
        schedule: function () {
          return $scope.scheduleBtn;
        },
        update: function(){
          return $scope.updateBtn;
        },
        shared: function(){

        },
        host: function(){

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

  for(var min = 0; min <60; min+=15){
    $scope.minOption.push(min);
  }
 

}]);

/*Please note that $modalInstance represents a modal window (instance) dependency.
It is not the same as the $modal service used above.
*/
hudweb.controller('ModalInstanceCtrl', function ($scope, $modalInstance, schedule,update,shared,host,$http,$rootScope,$modal,sharedData,$timeout,$route) {

/*  $scope.items = items;
*/$scope.scheduleBtn = schedule;
$scope.updateBtn = update;
     $scope.host_id = host;

 /* $scope.selected = {
    item: $scope.items[0]
  };*/


$scope.userName=$rootScope.meModel.my_jid.split("@")[0];
  var getURL = function(action) {

    var url = 
       action
      + '?fonalityUserId=' + $rootScope.myPid.split('_')[1]
      + '&serverId=' + $rootScope.meModel.server_id
      + '&serverType=' + ($rootScope.meModel.server.indexOf('pbxtra') != -1 ? 'pbxtra' : 'trixbox')
      + '&authToken=' + localStorage.authTicket;
    
    return url;
  };
 
  $scope.meeting = {};
  $scope.meeting.meetingTopic = '';
  $scope.meeting.timeSelect = null;
  $scope.meeting.dt = null;
  $scope.meeting.AmPm = '';
  $scope.meeting.hourDuration = null;
  $scope.meeting.minDuration = null;
  $scope.meeting.timezone = '';
  $scope.meeting.password ='';
  $scope.meeting.jbh = null;
  

  sharedData.meeting = $scope.meeting;
  sharedData.meeting.meetingTopic = $scope.meeting.meetingTopic;
  sharedData.meeting.timeSelect = $scope.meeting.timeSelect;
  sharedData.meeting.dt = $scope.meeting.dt;
  sharedData.meeting.AmPm = $scope.meeting.AmPm;
  sharedData.meeting.hourDuration = $scope.meeting.hourDuration;
  sharedData.meeting.minDuration = $scope.meeting.minDuration;
  sharedData.meeting.timezone = $scope.meeting.timezone;
  sharedData.meeting.password = $scope.meeting.password;
  sharedData.meeting.jbh = $scope.meeting.jbh;
 $scope.getInfo = function(){

  
     $http.get(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/meetingList')).success(function(response){
        console.log("MEETING DATA",response);
     

        
           
        $modalInstance.close();

      });


  }

$scope.reloadRoute = function() {
   $route.reload();
}

 $scope.editMeeting = function(){
   $scope.startTime = $scope.meeting.dt;
  $scope.startMonth = $scope.startTime.getMonth()+1;
  $scope.startDay = $scope.startTime.getDate()+1;
  $scope.startHour = $scope.meeting.timeSelect;
  $scope.colon = $scope.startHour.indexOf(":");
  $scope.startHourUTC = $scope.startHour.substr(0,$scope.colon);
  console.log("UTC",$scope.startHourUTC);

if($scope.meeting.AmPm == "AM"){
  $scope.hourUTC = $scope.startHourUTC;
 }
 if($scope.meeting.AmPm =="PM"){
  $scope.startHourUTC = parseInt($scope.startHourUTC);
  $scope.hourUTC =$scope.startHourUTC + 12;
 }
 

 if($scope.hourUTC ==24){
    $scope.hourUTC = $scope.hourUTC -1;
  }

  $scope.hourUTC = $scope.hourUTC -17;

 
   $scope.starts = $scope.startTime.getFullYear() + "-"+ $scope.startMonth+"-"+$scope.startDay+"T"+$scope.hourUTC+":00:00Z";
    sharedData.meeting.update_meeting_id = shared;

   

          $http({method:"POST",url: fjs.CONFIG.SERVER.ppsServer +'zoom/updateMeeting'+'?hostId='+$scope.host_id+'&meetingId='+sharedData.meeting.update_meeting_id+'&authToken='+localStorage.authTicket+'&topic='+$scope.meeting.meetingTopic+'&startTime='+$scope.starts+'&duration='+$scope.meeting.hourDuration+''+$scope.meeting.minDuration +'&timezone='+$scope.meeting.timezone+'&password='+$scope.meeting.password+'&jbh='+$scope.meeting.jbh}).success(function(data){
              console.log("PUT",data);
              console.log("PUT MEETING ID",sharedData.meeting.meeting_id);

          });

                     $modalInstance.close();


  };


$scope.times = ["1:00","2:00","3:00","4:00","5:00","6:00","7:00","8:00","9:00","10:00","11:00","12:00"];
//$scope.times =[00,01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23];
 $scope.meridian= ["AM","PM"];
  $scope.month = ['Jan','Feb', 'Mar','Apr', 'May', 'Jun', 'Jul','Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  $scope.day = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];

$scope.timeZone = ["Pacific Time","Mountain Time","Central Time","Eastern Time"];

  $scope.startTime = "";
  $scope.starts = null;



 // $scope.startTime = $scope.meeting.timeSelect+$scope.meeting.AmPm+','+$scope.day[$scope.meeting.dt.getDay()] + ',' + $scope.month[$scope.meeting.dt.getMonth()] + "" +$scope.meeting.dt.getDay() + "," + $scope.meeting.dt.getFullYear();


  $scope.ok = function () {
  $scope.startTime = $scope.meeting.dt;
  $scope.startMonth = $scope.startTime.getMonth()+1;
  $scope.startDay = $scope.startTime.getDate()+1;
  $scope.startHour = $scope.meeting.timeSelect;
  $scope.colon = $scope.startHour.indexOf(":");
  $scope.startHourUTC = $scope.startHour.substr(0,$scope.colon);
  console.log("UTC",$scope.startHourUTC);

if($scope.meeting.AmPm == "AM"){
  $scope.hourUTC = $scope.startHourUTC;
 }
 if($scope.meeting.AmPm =="PM"){
  $scope.startHourUTC = parseInt($scope.startHourUTC);
  $scope.hourUTC =$scope.startHourUTC + 12;
 }
 

 if($scope.hourUTC ==24){
    $scope.hourUTC = $scope.hourUTC -1;
  }

  $scope.hourUTC = $scope.hourUTC -17;

 
   $scope.starts = $scope.startTime.getFullYear() + "-"+ $scope.startMonth+"-"+$scope.startDay+"T"+$scope.hourUTC+":00:00Z";

    $http.post(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/createScheduledMeeting')+'&topic='+$scope.meeting.meetingTopic+'&startTime='+$scope.starts+'&duration='+$scope.meeting.hourDuration+''+$scope.meeting.minDuration +'&timezone='+$scope.meeting.timezone+'&password='+$scope.meeting.password+'&jbh='+$scope.meeting.jbh).success(function(data, status, headers, config){
      console.log('SUCCESS', data);
      sharedData.meeting.meeting_id = data.meeting.meeting_id;




        
        
         //+','+$scope.day[$scope.meeting.dt.getDay()] + ',' + $scope.month[$scope.meeting.dt.getMonth()] + "" +$scope.meeting.dt.getDay() + "," + $scope.meeting.dt.getFullYear();
    });


    $modalInstance.close();
    $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'copyToClipboard.html',
      controller: 'ModalInstanceCtrlTwo',
      size: 'lg',
      resolve: {
        schedule: function () {
          return $scope.scheduleBtn;
        }
      }
    });

  };

   $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };


 
});



hudweb.controller('ModalInstanceCtrlTwo', function ($scope, $modalInstance,$http,$rootScope,$modal,sharedData,$route) {
    
    var getURL = function(action) {

        var url = 
           action
          + '?fonalityUserId=' + $rootScope.myPid.split('_')[1]
          + '&serverId=' + $rootScope.meModel.server_id
          + '&serverType=' + ($rootScope.meModel.server.indexOf('pbxtra') != -1 ? 'pbxtra' : 'trixbox')
          + '&authToken=' + localStorage.authTicket;
        
        return url;
      };
      $scope.userName=$rootScope.meModel.my_jid.split("@")[0];

       $scope.meeting = sharedData.meeting;
  $scope.meeting.meetingTopic = sharedData.meeting.meetingTopic;
  $scope.meeting.timeSelect = sharedData.meeting.timeSelect;
  $scope.meeting.dt = sharedData.meeting.dt;
  $scope.meeting.AmPm = sharedData.meeting.AmPm;
  $scope.meeting.hourDuration = sharedData.meeting.hourDuration;
  $scope.meeting.minDuration = sharedData.meeting.minDuration;
  $scope.meeting.timezone = sharedData.meeting.timezone;
  $scope.meeting.meeting_id = sharedData.meeting_meeting_id;

   


  $scope.copyToClipboard = function(){
        $modalInstance.close();
      };

  $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };
    


});
//Date model controller begins here.

hudweb.controller('DatepickerDemoCtrl', function ($scope) {
  $scope.today = function() {
    $scope.meeting.dt = new Date();
  };
  $scope.today();

  

  /*$scope.clear = function () {
    $scope.meeting.dt = null;
  };*/

  // Disable weekend selection
/*  $scope.disabled = function(date, mode) {
    return ( mode === 'day' && ( date.getDay() === 0 || date.getDay() === 6 ) );
  };*/

 /* $scope.toggleMin = function() {
    $scope.minDate = $scope.minDate ? null : new Date();
  };
  $scope.toggleMin();*/

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

/*  var tomorrow = new Date();
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
    ];*/

/*  $scope.getDayClass = function(date, mode) {
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
  };*/
});

hudweb.controller('ScrollController', ['$scope', '$location', '$anchorScroll',
  function ($scope, $location, $anchorScroll) {
    $scope.gotoBottom = function() {
      // set the location.hash to the id of
      // the element you wish to scroll to.
      $location.hash('bottom');

      // call $anchorScroll()
      $anchorScroll();
    };
  }]);

