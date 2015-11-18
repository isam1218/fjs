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
 

    this.setScheduleTab = function(tab) {
        this.tab = tab;
        this.query = '';

        if(tab == "Meetings"){
            this.showHome =false;
            this.showMeetings=true;
            this.inMeeting = false;
        }
        if(tab =="Home"){
            this.showHome=true;
            this.showMeetings = false;
            this.inMeeting = false;
        }
    }; 
});

hudweb.controller('ZoomWidgetController', ['$scope', '$http' ,'HttpService','sharedData','$rootScope','SettingsService', '$modal','$log','$filter',function($scope, $http,httpService,sharedData,$rootScope,settingsService,$modal,$log,$filter) {
$scope.setScheduleTab = sharedData.setScheduleTab;
     $scope.tab = 'Home';
    
     $scope.showHome=true;
     $scope.loading = {};
    

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

    $scope.openEditModal = function(meetingId,topic,start_time,timezone,password,option,end_time){
      

      $scope.topic = topic;
      var start_hour = $filter('date')(start_time,"hh:mma");
      
      $scope.start_time = start_time;
      $scope.end_time = end_time;

      var startHour = $scope.start_time.substr(11,2);
      var endHour = $scope.end_time.substr(11,2);
      
      $scope.hourDuration = endHour - startHour;
      if($scope.hourDuration == 0){
        $scope.hourDuration = "00";
      }
      if($scope.hourDuration > 0 && $scope.hourDuration < 10){
        $scope.hourDuration = "0"+$scope.hourDuration;
      }
      
    
      var startMin = $scope.start_time.substr(14,2);
      var endMin = $scope.end_time.substr(14,2);
     
      
      $scope.minDuration = endMin - startMin;
      
      if($scope.minDuration == 0){
        $scope.minDuration = "00";
      }
      


     

      $scope.meeting_id = meetingId;
      $scope.timezone = timezone;
      $scope.password = password;
      $scope.option = option;
     
      $scope.start_hour = start_hour.substr(0,5);
      $scope.AmPm = start_hour.substr(5,2);
     



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
        },
        topic: function(){
          return $scope.topic;
        },
        time: function(){
          return $scope.start_time;
        },
        timezone:function(){
          return $scope.timezone;
        },
        password:function(){
          return $scope.password;
        },
        option:function(){
          return $scope.option; 
        },
        start_hour: function(){
          return $scope.start_hour;
        },
        AmPm: function(){
          return $scope.AmPm;
        },
        hourDuration: function(){
          return $scope.hourDuration;
        },
        minDuration: function(){
          return $scope.minDuration;
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
            sharedData.meeting.AmPm = "";
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

        },
        topic: function(){

        },
        time: function(){

        },
        timezone:function(){
            
        },
        password:function(){
            
        },
        option:function(){
            
        },
        start_hour: function(){
           
        },
        AmPm: function(){
            
        },
        hourDuration: function(){
          
        },
        minDuration: function(){
          
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

 

  /*  $scope.setScheduleTab = function(tab) {
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
    }; */ 

    $scope.startMeeting = function(option){
        var data = {};
        var users = "";
        $scope.inMeeting = true;
        $scope.showHome = false;
       
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
            if(sharedData.showHome == true || sharedData.showMeetings == true){
                $scope.inMeeting = false;

            }
            else{
                $scope.inMeeting = true;
                sharedData.showHome=false;
            sharedData.showMeetings=false;
            }
            
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
     
   $http.get(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/meetingList')+'&email='+$rootScope.meModel.email).success(function(response){
        console.log("MEETING DATA",response.meetings);
        $scope.pmi_id.pmi = response.pmi;
        $scope.host_id = response.host_id;
        $scope.meetingList = response.meetings;
        

        for(var i = 0; i<=30;i++){
           var dateFilter = $filter('date')($scope.meetingList[i].start_time,"hh:mma");
          

           var duration = $scope.meetingList[i].duration.toString();
           if($scope.meetingList[i].duration == 0){
                $scope.meetingList[i].duration = "00";
              }
              if($scope.meetingList[i].duration.toString().length == 3){
                $scope.meetingList[i].duration = "0"+ $scope.meetingList[i].duration ;
              }

             
               
             
                 if($scope.meetingList[i].duration.toString().length == 4){
                $scope.meetingList[i].end_time = $scope.meetingList[i].start_time;
              var strHour = parseInt($scope.meetingList[i].end_time.substr(11,2)) + parseInt($scope.meetingList[i].duration.toString().substr(0,2));
              if($scope.meetingList[i].start_time.substr(11,2)>=0){
              var strHourString = "T"+ strHour;
            }
              var strMin =parseInt($scope.meetingList[i].end_time.substr(14,2)) + parseInt($scope.meetingList[i].duration.toString().substr(2,2));
              if(strMin == 0){
                strMin = "00";
              }
              $scope.meetingList[i].end_time = $scope.meetingList[i].start_time.slice(0,10) + strHourString +":"+strMin+":"+ $scope.meetingList[i].start_time.slice(17,20);
              
               }


               if($scope.meetingList[i].duration.toString().length == 2){
              //var strMin = parseInt($scope.meetingList[i].end_time.substr(14,2)) + parseInt($scope.meetingList[i].duration.toString().substr(0,2));
              //alert($scope.meetingList[i].duration.toString().substr(0,2));
              var strMin =parseInt($scope.meetingList[i].start_time.substr(14,2))+ parseInt($scope.meetingList[i].duration.toString().substr(0,2));
              $scope.meetingList[i].end_time = $scope.meetingList[i].start_time.slice(0,14) +strMin+":"+ $scope.meetingList[i].start_time.slice(17,20);
              
               }
               
               


        }

        

      });
 });

  /*$scope.getTimezone = function(start_time){
    $scope.startTime = start_time;
    $scope.startTime.substr(11,2);
    console.log("STARTTIME",$scope.meetingList);
   
  }*/

$scope.$on('modalInstance', function() {
$scope.loading.meetingLoaded = true;
 $http.get(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/meetingList')+'&email='+$rootScope.meModel.email).success(function(response){
        console.log("MEETING DATA",response.meetings);
        $scope.pmi_id.pmi = response.pmi;
        $scope.host_id = response.host_id;
        $scope.meetingList = response.meetings;
        $scope.loading.meetingLoaded = false;
        /*$scope.meetingList.push({"start_hour":$scope.start_hour});
                console.log("START_HOUR",$scope.start_hour);*/

        for(var i = 0; i<=30;i++){
          var dateFilter = $filter('date')($scope.meetingList[i].start_time,"hh:mma");
          

           var duration = $scope.meetingList[i].duration.toString();
           if($scope.meetingList[i].duration == 0){
                $scope.meetingList[i].duration = "00";
              }
              if($scope.meetingList[i].duration.toString().length == 3){
                $scope.meetingList[i].duration = "0"+ $scope.meetingList[i].duration ;
              }

              
                 
                 if($scope.meetingList[i].duration.toString().length == 4){
                $scope.meetingList[i].end_time = $scope.meetingList[i].start_time;
              var strHour = parseInt($scope.meetingList[i].end_time.substr(11,2)) + parseInt($scope.meetingList[i].duration.toString().substr(0,2));
              if($scope.meetingList[i].start_time.substr(11,2)>=0){
              var strHourString = "T"+ strHour;
            }
              var strMin =parseInt($scope.meetingList[i].end_time.substr(14,2)) + parseInt($scope.meetingList[i].duration.toString().substr(2,2));
              if(strMin == 0){
                strMin = "00";
              }
              $scope.meetingList[i].end_time = $scope.meetingList[i].start_time.slice(0,10) + strHourString +":"+strMin+":"+ $scope.meetingList[i].start_time.slice(17,20);
              
               }


                if($scope.meetingList[i].duration.toString().length == 2){
              //var strMin = parseInt($scope.meetingList[i].end_time.substr(14,2)) + parseInt($scope.meetingList[i].duration.toString().substr(0,2));
              //alert($scope.meetingList[i].duration.toString().substr(0,2));
              var strMin =parseInt($scope.meetingList[i].start_time.substr(14,2))+ parseInt($scope.meetingList[i].duration.toString().substr(0,2));
              $scope.meetingList[i].end_time = $scope.meetingList[i].start_time.slice(0,14) +strMin+":"+ $scope.meetingList[i].start_time.slice(17,20);
              
               }


           

        }
        
           
        

      });
        console.log("Broadcast Received");
      });


  $scope.getData = function(){
  
  
     $http.get(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/meetingList')+'&email='+$rootScope.meModel.email).success(function(response){
        console.log("MEETING DATA",response.meetings);
        $scope.pmi_id.pmi = response.pmi;
        $scope.host_id = response.host_id;
        $scope.meetingList = response.meetings;

        /*$scope.meetingList.push({"start_hour":$scope.start_hour});
                console.log("START_HOUR",$scope.start_hour);*/

        for(var i = 0; i<=30;i++){

          var dateFilter = $filter('date')($scope.meetingList[i].start_time,"hh:mma");
          
          //alert(dateFilter.toString().substr(0,2));

           var duration = $scope.meetingList[i].duration.toString();
           if($scope.meetingList[i].duration == 0){
                $scope.meetingList[i].duration = "00";
              }
              if($scope.meetingList[i].duration.toString().length == 3){
                $scope.meetingList[i].duration = "0"+ $scope.meetingList[i].duration ;
              }
            /*if($scope.meetingList[i].duration.toString().length == 2){
              $scope.meetingList[i].duration = "0" + $scope.meetingList[i].duration;
            }*/

          
                 if($scope.meetingList[i].duration.toString().length == 4){
                $scope.meetingList[i].end_time = $scope.meetingList[i].start_time;
              var strHour = parseInt($scope.meetingList[i].end_time.substr(11,2)) + parseInt($scope.meetingList[i].duration.toString().substr(0,2));
              if($scope.meetingList[i].start_time.substr(11,2)>=0){
              var strHourString = "T"+ strHour;
            }
              var strMin =parseInt($scope.meetingList[i].end_time.substr(14,2)) + parseInt($scope.meetingList[i].duration.toString().substr(2,2));
              if(strMin == 0){
                strMin = "00";
              }
              $scope.meetingList[i].end_time = $scope.meetingList[i].start_time.slice(0,10) + strHourString +":"+strMin+":"+ $scope.meetingList[i].start_time.slice(17,20);
              
               }



                if($scope.meetingList[i].duration.toString().length == 2){
              //var strMin = parseInt($scope.meetingList[i].end_time.substr(14,2)) + parseInt($scope.meetingList[i].duration.toString().substr(0,2));
              //alert($scope.meetingList[i].duration.toString().substr(0,2));
              var strMin =parseInt($scope.meetingList[i].start_time.substr(14,2))+ parseInt($scope.meetingList[i].duration.toString().substr(0,2));
              $scope.meetingList[i].end_time = $scope.meetingList[i].start_time.slice(0,14) +strMin+":"+ $scope.meetingList[i].start_time.slice(17,20);
              
               }
              


            

        }
        
           
        

      });


  }


  $scope.deleteMeeting = function(meetingId){
    var result = confirm("Are you sure you want to delete?");
    if (result) {
    //Logic to delete the item

    $http({method:"POST",url: fjs.CONFIG.SERVER.ppsServer +'zoom/deleteMeeting'+'?hostId='+$scope.host_id+'&meetingId='+meetingId+'&authToken='+localStorage.authTicket}).success(function(data){
       console.log("Delete DATA",data);
            //httpService.sendAction('voicemailbox', 'delete', fjs.CONFIG.SERVER.ppsServer +'zoom/deleteMeeting'+'?hostId='+$scope.host_id+'&meetingId='+meetingId+'&authToken='+localStorage.authTicket);

        

      });
    /*$http.get(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/meetingList')).success(function(data){
      console.log(data);
    })*/
    }
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

        },
        topic: function(){

        },
        time: function(){

        },
        timezone:function(){
            
        },
        password:function(){
           
        },
        option:function(){
           
        },
        start_hour: function(){
            
        },
        AmPm: function(){
            
        },
        hourDuration: function(){
          
        },
        minDuration: function(){
          
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

 // $scope.hourOption = ['00','01','02','03','04','05'];

  /*for(var hour = 0; hour <=12; hour++){
    $scope.hourOption.push(hour);
  }*/

  //$scope.minOption = ['00','15','30','45'];

  /*for(var min = 0; min <60; min+=15){
    $scope.minOption.push(min);
  }*/

}]);

/*Please note that $modalInstance represents a modal window (instance) dependency.
It is not the same as the $modal service used above.
*/
hudweb.controller('ModalInstanceCtrl', function ($scope, $modalInstance, schedule,update,shared,host,topic,time,timezone,password,option,start_hour,AmPm,hourDuration,minDuration,$http,$rootScope,$modal,sharedData,$timeout,$route,$filter) {

/*  $scope.items = items;
*/$scope.scheduleBtn = schedule;
  $scope.updateBtn = update;
  $scope.host_id = host;

$scope.hourOption = ['00','01','02','03','04','05','06','07','08','09',10,11,12];
$scope.minOption = ['00',15,30,45];

 /* $scope.selected = {
    item: $scope.items[0]
  };*/
$scope.times = ["01:00","01:30","02:00","02:30","03:00","03:30","04:00","04:30","05:00","05:30","06:00","06:30","07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00"];
//$scope.times =[00,01,02,03,04,05,06,07,08,09,10,11,12,13,14,15,16,17,18,19,20,21,22,23];

// makes sure the default time for the schedule modal is greater than 
var d = new Date();
var th = $filter('date')(d,'hh');
var tm = $filter('date')(d,'mm');
var a = $filter('date')(d,'a');

$scope.currentAmPm = a;

$scope.currentTime = th +":"+tm;
for(var tHour = 0; tHour <= $scope.times.length; tHour++){

    
   
    if($scope.times[tHour] !== undefined && $scope.currentTime.substr(0,2) == $scope.times[tHour].toString().substr(0,2) && $scope.times[tHour].toString().substr(3,2) == 0 && parseInt($scope.currentTime.substr(3,2)) > 30){
     
      tHour+=2;
      var d = new Date();
    var th = $filter('date')(d,'hh');
    $scope.currentTime = th +":"+tm;
    
    $scope.currentTime = $scope.times[tHour];
  }
  else if($scope.times[tHour] !== undefined && $scope.currentTime.substr(0,2) == $scope.times[tHour].toString().substr(0,2) && $scope.times[tHour].toString().substr(3,2) == 0 && parseInt($scope.currentTime.substr(3,2)) <= 30){
     
      tHour++;
      var d = new Date();
    var th = $filter('date')(d,'hh');
    $scope.currentTime = th +":"+tm;
    
    $scope.currentTime = $scope.times[tHour];
  }
  
 
}


 $scope.meridian= ["AM","PM"];
  $scope.month = ['Jan','Feb', 'Mar','Apr', 'May', 'Jun', 'Jul','Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  $scope.day = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];


$scope.timeZone= ['Etc/GMT+12','Pacific/Pago_Pago','Pacific/Honolulu','America/Anchorage','America/Santa_Isabel','America/Los_Angeles','America/Phoenix','America/Mazatlan','America/Denver','America/Guatemala','America/Chicago','America/Mexico_City','America/Bogota','America/New_York','America/Caracas','America/Asuncion','America/Goose_Bay','America/Campo_Grande','America/Santo_Domingo','America/St_Johns','America/Sao_Paulo','America/Argentina/Buenos_Aires','America/Godthab','America/Montevideo','Etc/GMT+2','Atlantic/Azores','Atlantic/Cape_Verde','Etc/Utc','Europe/London','Europe/Berlin','Africa/Lagos','Africa/Windhoek','Asia/Damascus','Asia/Beirut','Africa/Johannesburg','Asia/Baghdad','Asia/Tehran','Asia/Dubai','Asia/Baku','Asia/Kabul','Asia/Karachi','Asia/Kolkata','Asia/Kathmandu','Asia/Dhaka','Asia/Rangoon','Asia/Jakarta','Asia/Shanghai','Asia/Irkutsk','Asia/Tokyo','Australia/Adelaide','Australia/Darwin','Australia/Brisbane','Australia/Sydney','Pacific/Noumea','Pacific/Noumea','Pacific/Tarawa','Pacific/Auckland','Pacific/Fiji','Pacific/Tongatapu','Pacific/Apia','Pacific/Kiritimati'];
moment.locale('en');
var tzName = jstz.determine().name(); // America/Los_Angeles

 for(i=0;i<=$scope.timeZone.length;i++){
   if(tzName == $scope.timeZone[i]){
            $scope.timeZone.unshift($scope.timeZone[i]);

            break;
  }
}

$scope.userName=$rootScope.meModel.first_name +" "+ $rootScope.meModel.last_name;
  var getURL = function(action) {

    var url = 
       action
      + '?fonalityUserId=' + $rootScope.myPid.split('_')[1]
      + '&serverId=' + $rootScope.meModel.server_id
      + '&serverType=' + ($rootScope.meModel.server.indexOf('pbxtra') != -1 ? 'pbxtra' : 'trixbox')
      + '&authToken=' + localStorage.authTicket;
    
    return url;
  };

 //SET SCHEDULE VALUES
  $scope.meeting = {};
  $scope.meeting.meetingTopic = '';
  $scope.meeting.timeSelect = null;
  $scope.meeting.dt = null;
  $scope.meeting.times = null;
  $scope.meeting.AmPm = '';
  $scope.meeting.hourDuration = null;
  $scope.meeting.minDuration = null;
  $scope.meeting.timezone = '';
  $scope.meeting.password ='';
  $scope.meeting.jbh = null;

  
 // SET EDIT VALUES
$scope.meeting.meetingTopic = topic;
$scope.meeting.times= time;
$scope.meeting.timezone = timezone;
$scope.meeting.password = password;
$scope.meeting.jbh = option;
$scope.meeting.timeSelect = start_hour;
$scope.meeting.AmPm = AmPm;
$scope.meeting.hourDuration = hourDuration;
$scope.meeting.minDuration = minDuration;


if($scope.meeting.timeSelect != undefined){
$scope.meeting.timeSelect = start_hour;
}
else{
    $scope.meeting.timeSelect = $scope.currentTime;
}

if($scope.meeting.AmPm != undefined){
$scope.meeting.AmPm = AmPm;
}
else{
    $scope.meeting.AmPm = $scope.currentAmPm;
}

if($scope.meeting.timezone != undefined){
    $scope.meeting.timezone = timezone;
}
else{
    $scope.meeting.timezone = $scope.timeZone[0];
}

if($scope.meeting.hourDuration != undefined){
    $scope.meeting.hourDuration = hourDuration;
   
}
else{
    $scope.meeting.hourDuration = $scope.hourOption[0];
}

if($scope.meeting.minDuration != undefined){
    $scope.meeting.minDuration = minDuration;
    
}
else{
    $scope.meeting.minDuration = $scope.minOption[2];
}
if($scope.meeting.password !== ''){
    $scope.meeting.checked = true;
    
}
 if($scope.meeting.password === ''){
    $scope.meeting.checked = false;
    $scope.meeting.password = '';
    
}
 if($scope.meeting.password === undefined){
  $scope.meeting.checked = false;
  $scope.meeting.password = '';
}



if($scope.meeting.times != undefined){
$scope.meeting.dt = $scope.meeting.times;
  }
  else{
    $scope.meeting.dt = new Date();
  }




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
     

        
           

      });


  }
  $scope.setScheduleTab = sharedData.setScheduleTab;

     //$scope.setScheduleTab('Meetings');

$scope.reloadRoute = function() {
     
   $route.reload();
}

 $scope.editMeeting = function(AmPm){
   $scope.startTime = new Date($scope.meeting.dt);
  $scope.startMonth = $scope.startTime.getMonth()+1;
  $scope.startHour = $scope.meeting.timeSelect;
  $scope.startMinute = $scope.meeting.timeSelect.substr(2,3);
 

  $scope.colon = $scope.startHour.indexOf(":");
  $scope.startHourUTC = $scope.startHour.substr(0,$scope.colon);
  console.log("UTC",$scope.startHourUTC);
 $scope.hourUTC = $scope.startHourUTC;

var dates = $filter('date')($scope.startTime,'Z');


if($scope.meeting.AmPm == "AM" && dates.charAt(0) == '-'){
  $scope.hourUTC = parseInt($scope.startHourUTC) + parseInt(dates.substr(1,2));
    $scope.startDay = $scope.startTime.getDate();
    
    
    if($scope.startHour.substr(0,2) == 12){
      $scope.hourUTC = dates.substr(1,2);
    }
 }
  if($scope.meeting.AmPm =="PM" && dates.charAt(0) == '-'){
  
  $scope.startHourUTC = parseInt($scope.startHourUTC);
  $scope.hourUTC =parseInt($scope.startHourUTC) + 12 + parseInt(dates.substr(1,2));
    $scope.startDay = $scope.startTime.getDate();
    
 if($scope.startHour.substr(0,2) == 12){
      $scope.hourUTC = parseInt(dates.substr(1,2)) + 12;
      
    }
 }
 // for 30 min timezones
 if(dates.substr(3,2) == 30 && dates.charAt(0) == '-'){
  $scope.startMinute = ":" + (parseInt($scope.startMinute.substr(1,2)) + 30);
 }
 if(dates.substr(3,2) == 30 && dates.charAt(0) == '+'){
  $scope.startMinute = ":" + (parseInt($scope.startMinute.substr(1,2)) - 30);
 }
//for timezones with +
 if($scope.meeting.AmPm == "AM" && dates.charAt(0) == '+'){
  $scope.hourUTC = parseInt($scope.startHourUTC) - parseInt(dates.substr(1,2));
    $scope.startDay = $scope.startTime.getDate();
    
    
    if($scope.startHour.substr(0,2) == 12){
      $scope.hourUTC = parseInt(dates.substr(1,2))-(parseInt(dates.substr(1,2)*2));
    }
 }

  if($scope.meeting.AmPm =="PM" && dates.charAt(0) == '+'){
  
  $scope.startHourUTC = parseInt($scope.startHourUTC);
  $scope.hourUTC =parseInt($scope.startHourUTC) + 12 - parseInt(dates.substr(1,2));
    $scope.startDay = $scope.startTime.getDate();
    
 if($scope.startHour.substr(0,2) == 12){
      $scope.hourUTC = parseInt($scope.hourUTC)-12;
      
    }
 }
/* if($scope.hourUTC >= dates.substr(1,2) && dates.charAt(0) == "-"){
  $scope.startDay = $scope.startTime.getDate();
 }
 else if($scope.hourUTC <= dates.substr(1,2) && dates.charAt(0) == "-"){
  $scope.startDay = $scope.startTime.getDate()+1;
 }

  if($scope.startHourUTC >= dates.substr(1,2) && dates.charAt(0) == "+"){
  $scope.startDay = $scope.startTime.getDate();
 }
 if($scope.startHourUTC <= dates.substr(1,2) && dates.charAt(0) == "+"){
  $scope.startDay = $scope.startTime.getDate();
 }*/
 



 
 
 




 
   $scope.starts = $scope.startTime.getFullYear() + "-"+ $scope.startMonth+"-"+$scope.startDay+"T"+$scope.hourUTC+$scope.startMinute+":00Z";
    sharedData.meeting.update_meeting_id = shared;

   //alert($scope.starts);

          $http({method:"POST",url: fjs.CONFIG.SERVER.ppsServer +'zoom/updateMeeting'+'?hostId='+$scope.host_id+'&meetingId='+sharedData.meeting.update_meeting_id+'&authToken='+localStorage.authTicket+'&topic='+$scope.meeting.meetingTopic+'&startTime='+$scope.starts+'&duration='+$scope.meeting.hourDuration+''+$scope.meeting.minDuration +'&timezone='+$scope.meeting.timezone+'&password='+$scope.meeting.password+'&jbh='+$scope.meeting.jbh}).success(function(data){
              console.log("PUT",data);
              console.log("PUT MEETING ID",sharedData.meeting.meeting_id);
              
              

          });

                     $modalInstance.close();


  };



/*  for(i=1;i<=$scope.timeZone.length;i++){
   if(tzName == $scope.timeZone[i]){
    var a = $scope.timeZone.indexOf($scope.timeZone[i]);
    $scope.timeZone.splice(a,1);
            console.log("REMOVE THIS",a);
        break;
  }
  }*/
   
  




  $scope.startTime = "";
  $scope.starts = null;



 // $scope.startTime = $scope.meeting.timeSelect+$scope.meeting.AmPm+','+$scope.day[$scope.meeting.dt.getDay()] + ',' + $scope.month[$scope.meeting.dt.getMonth()] + "" +$scope.meeting.dt.getDay() + "," + $scope.meeting.dt.getFullYear();


  $scope.scheduleMeeting = function (AmPm) {
  $scope.startTime = $scope.meeting.dt;
  $scope.startMonth = $scope.startTime.getMonth()+1;
  $scope.startDay = $scope.startTime.getDate()+1;
  $scope.startHour = $scope.meeting.timeSelect;
  $scope.startMinute = $scope.meeting.timeSelect.substr(2,3);
  $scope.colon = $scope.startHour.indexOf(":");
  $scope.startHourUTC = $scope.startHour.substr(0,$scope.colon);

    $scope.hourUTC = $scope.startHourUTC;

var dates = $filter('date')($scope.startTime,'Z');


if($scope.meeting.AmPm == "AM" && dates.charAt(0) == '-'){
  $scope.hourUTC = parseInt($scope.startHourUTC) + parseInt(dates.substr(1,2));
    $scope.startDay = $scope.startTime.getDate();
    
    
    if($scope.startHour.substr(0,2) == 12){
      $scope.hourUTC = dates.substr(1,2);
    }
 }
  if($scope.meeting.AmPm =="PM" && dates.charAt(0) == '-'){
  
  $scope.startHourUTC = parseInt($scope.startHourUTC);
  $scope.hourUTC =parseInt($scope.startHourUTC) + 12 + parseInt(dates.substr(1,2));
    $scope.startDay = $scope.startTime.getDate();
    
 if($scope.startHour.substr(0,2) == 12){
      $scope.hourUTC = parseInt(dates.substr(1,2)) + 12;
      
    }
 }
// for 30 min timezones
 if(dates.substr(3,2) == 30 && dates.charAt(0) == '-'){
  $scope.startMinute = ":" + (parseInt($scope.startMinute.substr(1,2)) + 30);
 }
 if(dates.substr(3,2) == 30 && dates.charAt(0) == '+'){
  $scope.startMinute = ":" + (parseInt($scope.startMinute.substr(1,2)) - 30);
 }
//for timezones with +
 if($scope.meeting.AmPm == "AM" && dates.charAt(0) == '+'){
  $scope.hourUTC = parseInt($scope.startHourUTC) - parseInt(dates.substr(1,2));
    $scope.startDay = $scope.startTime.getDate();
    
    
    if($scope.startHour.substr(0,2) == 12){
      $scope.hourUTC = parseInt(dates.substr(1,2))-(parseInt(dates.substr(1,2)*2));
    }
 }

  if($scope.meeting.AmPm =="PM" && dates.charAt(0) == '+'){
  
  $scope.startHourUTC = parseInt($scope.startHourUTC);
  $scope.hourUTC =parseInt($scope.startHourUTC) + 12 - parseInt(dates.substr(1,2));
    $scope.startDay = $scope.startTime.getDate();
    
 if($scope.startHour.substr(0,2) == 12){
      $scope.hourUTC = parseInt($scope.hourUTC)-12;
      
    }
 }

/* if($scope.hourUTC ==24){
    $scope.hourUTC = $scope.hourUTC -;
  }*/

  //$scope.hourUTC = $scope.hourUTC -17;
/*$scope.startTime.getTimezoneOffset() = +240;
*/ 
   $scope.starts = $scope.startTime.getFullYear() + "-"+ $scope.startMonth+"-"+$scope.startDay+"T"+$scope.hourUTC+$scope.startMinute+":00Z";

    $http.post(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/createScheduledMeeting')+'&topic='+$scope.meeting.meetingTopic+'&email='+$rootScope.meModel.email+'&startTime='+$scope.starts+'&startHour='+$scope.AmPm+'&duration='+$scope.meeting.hourDuration+''+$scope.meeting.minDuration +'&timezone='+$scope.meeting.timezone+'&password='+$scope.meeting.password+'&jbh='+$scope.meeting.jbh).success(function(data, status, headers, config){
      console.log('SUCCESS', data);
      sharedData.meeting.meeting_id = data.meeting.meeting_id;

      console.log("Email",$rootScope.meModel.email);


        
        
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

$scope.$on('$destroy', function() {
        $rootScope.$broadcast('modalInstance');
        console.log("Broadcast occurred");
      });

 
});



hudweb.controller('ModalInstanceCtrlTwo', function ($scope, $modalInstance,$http,$rootScope,$modal,sharedData,$route) {
    $scope.loadingGif1 = false;
    $scope.loadingGif2 = true;
    var getURL = function(action) {

        var url = 
           action
          + '?fonalityUserId=' + $rootScope.myPid.split('_')[1]
          + '&serverId=' + $rootScope.meModel.server_id
          + '&serverType=' + ($rootScope.meModel.server.indexOf('pbxtra') != -1 ? 'pbxtra' : 'trixbox')
          + '&authToken=' + localStorage.authTicket;
        
        return url;
      };
      $scope.userName=$rootScope.meModel.first_name +" "+ $rootScope.meModel.last_name;

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
  //$scope.today();

  

  $scope.clear = function () {
    $scope.meeting.dt = null;
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

