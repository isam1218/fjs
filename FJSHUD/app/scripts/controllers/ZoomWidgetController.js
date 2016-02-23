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

hudweb.controller('ZoomWidgetController', ['$scope', '$http' ,'HttpService','sharedData','$rootScope','SettingsService', '$modal','$log','$filter', '$location', function($scope, $http,httpService,sharedData,$rootScope,settingsService,$modal,$log,$filter,$location) {
$scope.setScheduleTab = sharedData.setScheduleTab;
     $scope.tab = 'Home';
    
     $scope.showHome=true;
     $scope.loading = {};
    

     $scope.pmi_id = {};
     $scope.pmi_id.pmi =null;
     $scope.host_id = null;
     $scope.meetingList = [];
     $scope.Time = "Time: ";

    
    if($rootScope.meModel.email == undefined || $rootScope.meModel.email == ""){
      $scope.noEmail = true;
    }
    else{
      $scope.noEmail = false;
    }


     var getURL = function(action) {

    var url = 
       action
       
      + '?fonalityUserId=' + $rootScope.myPid.split('_')[1]
      + '&serverId=' + $rootScope.meModel.server_id
      + '&serverType=' + ($rootScope.meModel.my_jid.indexOf('pbxtra') != -1 ? 'pbxtra' : 'trixbox')
      + '&authToken=' + localStorage.authTicket;
    
    return url;
  };

  settingsService.getPermissions().then(function(data) {
    if(data.showVideoCollab == false){
      $location.path('/settings/');
    }
  });
 
  var authTicket = localStorage.authTicket;
  $scope.authTicket = authTicket;

 
    //fjs.ui.AddContactMenuController.call(this, $scope, dataManager, "views/AddContactPopupMenu.html");
    $scope.joinMeeting = function(meetingId){
        window.open("https://api.zoom.us/j/" + meetingId,'_blank');
    };

    $scope.joinScheduledMeeting = function(meetingId){

       $http.post(fjs.CONFIG.SERVER.ppsServer +'zoom/pmiStartUrl'+'?meetingId='+meetingId+'&hostId='+$scope.host_id+'&authToken='+$scope.authTicket).success(function(response){
        
        window.open(response.start_url);

       });

    };
    $scope.startScheduledMeeting = function(start_url){
      window.open(start_url);
    };

    $scope.openEditModal = function(meetingId,topic,start_time,startHr,timezone,password,option,duration){
      

      $scope.topic = topic;
      var start_hour = startHr;
     
      
      $scope.start_time = start_time;
      $scope.duration = duration + "";
      
     

      if($scope.duration == 15){
        $scope.hourDuration = "00";
        $scope.minDuration = "15";
      }
      else if($scope.duration == 30){
        $scope.hourDuration = "00";
        $scope.minDuration = "30";
      }
      else if($scope.duration == 45){
        $scope.hourDuration = "00";
        $scope.minDuration = "45";
      }
      if($scope.duration.length == 4){
        $scope.hourDuration = $scope.duration.substr(0,2);
        $scope.minDuration = $scope.duration.substr(2,2);
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
        },
        hostId:function(){

        }

      }
    });
    };


          
    $scope.copy = function(startDate, startTime,topic,meeting,timezone,password){
                
      
      sharedData.meeting.AmPm = "";
      
      $scope.startDate = startDate;
      $scope.startTime = startTime;
      $scope.topic = topic;
      $scope.meeting_Id = meeting;
      $scope.timezone = timezone;
      $scope.password = password;
      
    

     $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'copyToClipboard.html',
      controller: 'ModalInstanceCtrlTwo',
      size: 'lg',
      resolve: {
        pmiId:function(){

        },
        startDate:function(){
          return $scope.startDate;
        },
        startTime:function(){
          return $scope.startTime;
        },
        topic:function(){
          return $scope.topic;
        },
        meeting_Id:function(){
          return $scope.meeting_Id;
        },
        timezone:function(){
          return $scope.timezone;
        },
        password:function(){
          return $scope.password;
        }

      }
    });
    };

       $scope.copyPmi = function(topic,pmiId){
                        $scope.pmiId = pmiId;

   

      sharedData.meeting.meetingTopic = $rootScope.meModel.my_jid.split("@")[0] + " Personal Meeting Room";
      sharedData.meeting.timeSelect = $scope.Time;
     
      
    $scope.Time = "Your meeting will start immediately.";

     $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'copyToClipboardPMI.html',
      controller: 'ModalInstanceCtrlTwo',
      size: 'lg',
      resolve: {
        items: function () {
          return $scope.items;
        },
        pmiId:function(){
            return $scope.pmiId;
          },
        startDate:function(){
          
        },
        startTime:function(){
        },
        topic:function(){
        },
        meeting_Id:function(){
        },
        timezone:function(){
        },
        password:function(){
        }
        
      }
    });
    };


    $scope.hasResult = false;
    $scope.startUrl = "";
    $scope.joinUrl = "";

    $scope.inMeeting = false;

    settingsService.getMe().then(function(data) {
      var DATA = data;
      if(data.email !== undefined){
        
        $scope.noEmail = false;
      }
      if(data.email === undefined | data.email == ""){
        
        $scope.noEmail = true;

        $modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'emailCheck.html',
      controller: 'emailCheckController',
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

      }
    });

 

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
            
            //$scope.$safeApply();


        });
    };

    $scope.bodyDisplay=true;

    $scope.bodyStartedDisplay=false;

    $scope.bodyErrorDisplay=false;

    $scope.startUrl = "";

    $scope.joinUrl = "";
    
    $scope.addedContacts = [];
	
    $scope.searchContact = function(contact){
     
        $scope.addedContacts.push(contact);
		$scope.$digest();
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
    };

      $scope.deleteMeeting = function(meetingId,pmi,hostId){
    var result = confirm("Are you sure you want to delete?");
    if (result) {
    //Logic to delete the item

    $http({method:"POST",url: fjs.CONFIG.SERVER.ppsServer +'zoom/deleteMeeting'+'?hostId='+$scope.host_id+'&meetingId='+meetingId+'&authToken='+localStorage.authTicket}).success(function(data){
       
      $http.post(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/meetingList')+'&email='+$rootScope.meModel.email+'&hostId='+hostId+'&pmi='+pmi+"&T="+ new Date().getTime()).success(function(response){
        $scope.pmi_id.pmi = response.pmi;
        $scope.host_id = response.host_id;
        $scope.meetingList = response.meetings;
        

        for(var i = 0; i<=$scope.meetingList.length-1;i++){

          
          

          var jun = moment($scope.meetingList[i].start_time).lang('en');
          $scope.meetingList[i].timeDate = jun.tz('Etc/GMT+12').format("dddd , MMM DD, YYYY");
          $scope.meetingList[i].startHour = jun.tz('Etc/GMT+12').format('hh:mmA');
          
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
              var strHourString =  strHour;
             
               }


            
              var strMin =parseInt($scope.meetingList[i].end_time.substr(14,2)) + parseInt($scope.meetingList[i].duration.toString().substr(2,2));

              

              if(strMin == 0){
                strMin = "00";
              }
               if(strMin == 60 && strHourString <24){
                
                strMin = "00";
                var strHourString = parseInt(strHour) +1;
 
              }
               if(strMin == 75){
                
                strMin = "15";
                var strHourString = parseInt(strHour) +1;

              }
              
              if(strHourString <10){
                  strHourString = "0"+strHourString;
                }

              
                if(strHourString > 24 || (strHourString == 24 && parseInt(strMin) > 0)){
                  
                  
                  var sx = parseInt(strHourString) - 24;
                  
                  strHourString = sx;
                  if(strHourString <10){
                    strHourString = "0" + sx;
                  }
                  if(strHourString == 0){
                    strHourString = "00";
                  }
                }
               
               
                

              $scope.meetingList[i].end_time = $scope.meetingList[i].start_time.slice(0,10) +"T"+ strHourString +":"+strMin+":"+ $scope.meetingList[i].start_time.slice(17,20);
              


              var end = moment($scope.meetingList[i].end_time).lang('en');
          $scope.meetingList[i].endHour = end.tz('Etc/GMT+12').format('hh:mmA');
          
               }



                if($scope.meetingList[i].duration.toString().length == 2){
             
              var strMin =parseInt($scope.meetingList[i].start_time.substr(14,2))+ parseInt($scope.meetingList[i].duration.toString().substr(0,2));
              if(strMin == 60){
                
                strMin = "00";
                var hourIncrement = parseInt($scope.meetingList[i].start_time.substr(11,2)) +1;
                if(hourIncrement <10){
                  hourIncrement = "0"+hourIncrement;
                }
                
              }
              else if(strMin == 75){
                
                strMin = "15";
                var hourIncrement = parseInt($scope.meetingList[i].start_time.substr(11,2)) +1;
                if(hourIncrement <10){
                  hourIncrement = "0"+hourIncrement;
                }
                
              }
              else{hourIncrement = $scope.meetingList[i].start_time.substr(11,2);}
              
              $scope.meetingList[i].end_time = $scope.meetingList[i].start_time.slice(0,10) +"T"+ hourIncrement+":"+strMin+":"+ $scope.meetingList[i].start_time.slice(17,20);
              

              
              var newEnd = moment($scope.meetingList[i].end_time).lang('en');
          $scope.meetingList[i].endHour = newEnd.tz('Etc/GMT+12').format('hh:mmA');
          
               }
              


            

        }
        
           
        

      }).error(function(data){
        $scope.messages = data;
        
      });
        

      });
    
    }
  };

  settingsService.getSettings().then(function() {
     
   $http.post(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/meetingList')+'&email='+$rootScope.meModel.email+'&hostId=&pmi='+"&T="+ new Date().getTime()).success(function(response){
        $scope.pmi_id.pmi = response.pmi;
        $scope.host_id = response.host_id;
        $scope.meetingList = response.meetings;

        for(var i = 0; i<=$scope.meetingList.length-1;i++){
           


           
           var strt = moment($scope.meetingList[i].start_time).lang('en');
                    $scope.meetingList[i].timeDate = strt.tz('Etc/GMT+12').format("dddd , MMM DD, YYYY");

          $scope.meetingList[i].startHour = strt.tz('Etc/GMT+12').format('hh:mmA');

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
              var strHourString =  strHour;
              
            }
            
              var strMin =parseInt($scope.meetingList[i].end_time.substr(14,2)) + parseInt($scope.meetingList[i].duration.toString().substr(2,2));
              if(strMin == 0){
                strMin = "00";
              }
               if(strMin == 60){
                
                strMin = "00";
                var strHourString = parseInt(strHour) +1;
               
                
                
                
              }
               if(strMin == 75){
                
                strMin = "15";
                var strHourString = parseInt(strHour) +1;
              
                
              }
              
              if(strHourString <10){
                  strHourString = "0"+strHourString;
                }

                  if(strHourString > 24 || (strHourString == 24 && parseInt(strMin) > 0)){
                  
                  
                  var sx = parseInt(strHourString) - 24;
                 
                  strHourString = sx;
                  if(strHourString <10){
                    strHourString = "0" + sx;
                  }
                  if(strHourString == 0){
                    strHourString = "00";
                  }
                }
                
              $scope.meetingList[i].end_time = $scope.meetingList[i].start_time.slice(0,10) +"T"+ strHourString +":"+strMin+":"+ $scope.meetingList[i].start_time.slice(17,20);
             
              var end = moment($scope.meetingList[i].end_time).lang('en');
          $scope.meetingList[i].endHour = end.tz('Etc/GMT+12').format('hh:mmA');
          
               }


               if($scope.meetingList[i].duration.toString().length == 2){
              
              var strMin =parseInt($scope.meetingList[i].start_time.substr(14,2))+ parseInt($scope.meetingList[i].duration.toString().substr(0,2));
              if(strMin == 60){
               
                strMin = "00";
                var hourIncrement = parseInt($scope.meetingList[i].start_time.substr(11,2)) +1;
                if(hourIncrement <10){
                  hourIncrement = "0"+hourIncrement;
                }
                
              }
              else if(strMin == 75){
                
                strMin = "15";
                var hourIncrement = parseInt($scope.meetingList[i].start_time.substr(11,2)) +1;
                if(hourIncrement <10){
                  hourIncrement = "0"+hourIncrement;
                }
                
              }
              else{hourIncrement = $scope.meetingList[i].start_time.substr(11,2);}
              
              $scope.meetingList[i].end_time = $scope.meetingList[i].start_time.slice(0,10) +"T"+ hourIncrement+":"+strMin+":"+ $scope.meetingList[i].start_time.slice(17,20);
              
              
              var newEnd = moment($scope.meetingList[i].end_time).lang('en');
          $scope.meetingList[i].endHour = newEnd.tz('Etc/GMT+12').format('hh:mmA');
          
               }
               
               


        }

        

      }).error(function(data){
        $scope.messages = data;
        
      });
 });

 

$scope.$on('modalInstance', function() {
$scope.loading.meetingLoaded = true;
 $http.post(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/meetingList')+'&email='+$rootScope.meModel.email+'&hostId='+$scope.host_id+'&pmi='+$scope.pmi_id.pmi+"&T="+ new Date().getTime()).success(function(response){
        $scope.pmi_id.pmi = response.pmi;
        $scope.host_id = response.host_id;
        $scope.meetingList = response.meetings;
        $scope.loading.meetingLoaded = false;
        
        if($scope.meetingList){
        for(var i = 0; i<=$scope.meetingList.length-1;i++){
          


           var jun = moment($scope.meetingList[i].start_time).lang('en');
          $scope.meetingList[i].timeDate = jun.tz('Etc/GMT+12').format("dddd , MMM DD, YYYY");

          $scope.meetingList[i].startHour = jun.tz('Etc/GMT+12').format('hh:mmA');
          

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
              var strHourString =  strHour;
              
            }
            
              var strMin =parseInt($scope.meetingList[i].end_time.substr(14,2)) + parseInt($scope.meetingList[i].duration.toString().substr(2,2));
              if(strMin == 0){
                strMin = "00";
              }
               if(strMin == 60){
                
                strMin = "00";
                var strHourString = parseInt(strHour) +1;
                
                
                
                
              }
               if(strMin == 75){
                
                strMin = "15";
                var strHourString = parseInt(strHour) +1;
              
                
              }
              
              if(strHourString <10){
                  strHourString = "0"+strHourString;
                }

                 if(strHourString > 24 || (strHourString == 24 && parseInt(strMin) > 0)){
                  
                  
                  var sx = parseInt(strHourString) - 24;
                  
                  strHourString = sx;
                  if(strHourString <10){
                    strHourString = "0" + sx;
                  }
                  if(strHourString == 0){
                    strHourString = "00";
                  }
                }
                
              $scope.meetingList[i].end_time = $scope.meetingList[i].start_time.slice(0,10) +"T"+ strHourString +":"+strMin+":"+ $scope.meetingList[i].start_time.slice(17,20);
              
              var end = moment($scope.meetingList[i].end_time).lang('en');
          $scope.meetingList[i].endHour = end.tz('Etc/GMT+12').format('hh:mmA');
          
               }


                 if($scope.meetingList[i].duration.toString().length == 2){
              
              var strMin =parseInt($scope.meetingList[i].start_time.substr(14,2))+ parseInt($scope.meetingList[i].duration.toString().substr(0,2));
              if(strMin == 60){
                
                strMin = "00";
                var hourIncrement = parseInt($scope.meetingList[i].start_time.substr(11,2)) +1;
                if(hourIncrement <10){
                  hourIncrement = "0"+hourIncrement;
                }
                
              }
              else if(strMin == 75){
                
                strMin = "15";
                var hourIncrement = parseInt($scope.meetingList[i].start_time.substr(11,2)) +1;
                if(hourIncrement <10){
                  hourIncrement = "0"+hourIncrement;
                }
                
              }
              else{hourIncrement = $scope.meetingList[i].start_time.substr(11,2);}
              
              $scope.meetingList[i].end_time = $scope.meetingList[i].start_time.slice(0,10) +"T"+ hourIncrement+":"+strMin+":"+ $scope.meetingList[i].start_time.slice(17,20);
              
              
              var newEnd = moment($scope.meetingList[i].end_time).lang('en');
          $scope.meetingList[i].endHour = newEnd.tz('Etc/GMT+12').format('hh:mmA');
          
               }


           

        }
      }
        
           
        

      }).error(function(data){
        $scope.messages = data;
        
      });
        
      });




  $scope.items = ['item1', 'item2', 'item3'];

  $scope.animationsEnabled = true;


  $scope.open = function (size,hostId) {
    $scope.hostId = hostId;
    $scope.scheduleBtn = true;
    $scope.updateBtn = false;
    
    $scope.userName=$rootScope.meModel.first_name +" "+ $rootScope.meModel.last_name;
    $scope.topic = $scope.userName + " Meeting";
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
          return $scope.topic;
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
          
        },
        hostId:function(){
           return $scope.hostId;
        }
      }
    });

    modalInstance.result.then(function (selectedItem) {
      $scope.selected = selectedItem;
    });
  };

  $scope.toggleAnimation = function () {
    $scope.animationsEnabled = !$scope.animationsEnabled;
  };



}]);

/*Please note that $modalInstance represents a modal window (instance) dependency.
It is not the same as the $modal service used above.
*/
hudweb.controller('ModalInstanceCtrl', function ($scope, $modalInstance,schedule,update,shared,host,topic,time,timezone,password,option,start_hour,AmPm,hourDuration,minDuration,hostId,$http,$rootScope,$modal,sharedData,$timeout,$route,$filter) {

/*  $scope.items = items;
*/$scope.scheduleBtn = schedule;
  $scope.updateBtn = update;
  $scope.host_id = host;
  $scope.userName=$rootScope.meModel.first_name +" "+ $rootScope.meModel.last_name;

$scope.hourOption = ['00','01','02','03','04','05','06','07','08','09','10','11','12'];
$scope.minOption = ['00','15','30','45'];


 
$scope.times = ["01:00","01:30","02:00","02:30","03:00","03:30","04:00","04:30","05:00","05:30","06:00","06:30","07:00","07:30","08:00","08:30","09:00","09:30","10:00","10:30","11:00","11:30","12:00","12:30"];

// makes sure the default time for the schedule modal is greater than 
var d = new Date();
var th = $filter('date')(d,'hh');
var tm = $filter('date')(d,'mm');
var a = $filter('date')(d,'a');

$scope.currentAmPm = a;

$scope.currentTime = th +":"+tm;
for(var tHour = 0; tHour <= $scope.times.length; tHour++){

    
   
    if($scope.times[tHour] !== undefined && $scope.currentTime.substr(0,2) == $scope.times[tHour].toString().substr(0,2) && $scope.times[tHour].toString().substr(3,2) == 0 && parseInt($scope.currentTime.substr(3,2)) >= 30 && $scope.currentTime.substr(0,2) != 11){
     
      tHour+=2;
      var d = new Date();
    var th = $filter('date')(d,'hh');
    $scope.currentTime = th +":"+tm;
    
    $scope.currentTime = $scope.times[tHour];
  }
  else if($scope.times[tHour] !== undefined && $scope.currentTime.substr(0,2) == $scope.times[tHour].toString().substr(0,2) && $scope.times[tHour].toString().substr(3,2) == 0 && parseInt($scope.currentTime.substr(3,2)) >= 30 && $scope.currentTime.substr(0,2) == 11 && $scope.currentAmPm == "PM"){
     
      tHour+=2;
      var d = new Date();
    var th = $filter('date')(d,'hh');
    $scope.currentTime = th +":"+tm;
    $scope.currentAmPm = "AM";
    
    $scope.currentTime = $scope.times[tHour];
  }
  else if($scope.times[tHour] !== undefined && $scope.currentTime.substr(0,2) == $scope.times[tHour].toString().substr(0,2) && $scope.times[tHour].toString().substr(3,2) == 0 && parseInt($scope.currentTime.substr(3,2)) >= 30 && $scope.currentTime.substr(0,2) == 11 && $scope.currentAmPm == "AM"){
     
      tHour+=2;
      var d = new Date();
    var th = $filter('date')(d,'hh');
    $scope.currentTime = th +":"+tm;
    $scope.currentAmPm = "PM";
    
    $scope.currentTime = $scope.times[tHour];
  }
  else if($scope.times[tHour] !== undefined && $scope.currentTime.substr(0,2) == $scope.times[tHour].toString().substr(0,2) && $scope.times[tHour].toString().substr(3,2) == 0 && parseInt($scope.currentTime.substr(3,2)) <= 30){
     
      tHour++;
      var d = new Date();
    var th = $filter('date')(d,'hh');
    $scope.currentTime = th +":"+tm;
    
    $scope.currentTime = $scope.times[tHour];
  }
  else if($scope.times[tHour] !== undefined && $scope.currentTime.substr(0,2) == 12 && parseInt($scope.currentTime.substr(3,2)) >= 30){    
      var d = new Date();
    var th = $filter('date')(d,'hh');
    $scope.currentTime = th +":"+tm;
    
    $scope.currentTime = $scope.times[0];
  }
  
 
}


 $scope.meridian= ["AM","PM"];
  $scope.month = ['Jan','Feb', 'Mar','Apr', 'May', 'Jun', 'Jul','Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  $scope.day = ["Sun","Mon","Tue","Wed","Thu","Fri","Sat"];


$scope.timeZone = moment.tz.names();
moment.locale('en');
var tzName = jstz.determine().name(); // America/Los_Angeles

 for(i=0;i<=$scope.timeZone.length;i++){
   if(tzName && tzName == $scope.timeZone[i]){
            $scope.timeZone.unshift($scope.timeZone[i]);

            break;
  }
}


  var getURL = function(action) {

    var url = 
       action
      + '?fonalityUserId=' + $rootScope.myPid.split('_')[1]
      + '&serverId=' + $rootScope.meModel.server_id
      + '&serverType=' + ($rootScope.meModel.my_jid.indexOf('pbxtra') != -1 ? 'pbxtra' : 'trixbox')
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
if(time != undefined){
var clock = moment(time).lang('en');
$scope.date = clock.utc().format('MM/DD/YYYY');

}
else{ $scope.date = new Date();}
$scope.meeting.times = $scope.date;
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

  $scope.setScheduleTab = sharedData.setScheduleTab;




 $scope.editMeeting = function(AmPm){
  if(sharedData.meeting.meetingTopic == ""){
      sharedData.meeting.meetingTopic = $scope.userName + " Meeting";
    }
   $scope.startTime = new Date($scope.meeting.dt);
  $scope.startMonth = $scope.startTime.getMonth()+1;
  $scope.startDay = $scope.startTime.getDate();
  $scope.startHour = $scope.meeting.timeSelect;
  $scope.startMinute = $scope.meeting.timeSelect.substr(2,3);
  


  $scope.colon = $scope.startHour.indexOf(":");
  $scope.startHourUTC = $scope.startHour.substr(0,$scope.colon);
  
 $scope.hourUTC = $scope.startHourUTC;

var dates = $filter('date')($scope.startTime,'Z');

 if($scope.meeting.AmPm =="AM" ){
  
  $scope.startHourUTC = parseInt($scope.startHourUTC);
  $scope.hourUTC =parseInt($scope.startHourUTC) + 12;
    $scope.startDay = $scope.startTime.getDate();
    
 
 }
  if($scope.meeting.AmPm =="PM"){
  
  $scope.hourUTC =$scope.startHourUTC;
  $scope.startDay = $scope.startTime.getDate()+1;
    
 
 }

 if($scope.meeting.AmPm == "PM" && $scope.startHourUTC == 12){
  $scope.hourUTC =parseInt($scope.startHourUTC) - 12;
  
  $scope.startDay = $scope.startTime.getDate()+1;
 }
  if($scope.meeting.AmPm == "AM" && $scope.startHourUTC == 12){
  $scope.hourUTC =$scope.startHourUTC;
  $scope.startDay = $scope.startTime.getDate();
 }
 
 

 
   $scope.starts = $scope.startTime.getFullYear() + "-"+ $scope.startMonth+"-"+$scope.startDay+"T"+$scope.hourUTC+$scope.startMinute+":00Z";
    sharedData.meeting.update_meeting_id = shared;

  if($scope.meeting.hourDuration ==0 && $scope.meeting.minDuration == 0){
    alert("Looks like you did not select a Duration. Please select a Duration for your meeting.");
  }
  else{
          $http({method:"POST",url: fjs.CONFIG.SERVER.ppsServer +'zoom/updateMeeting'+'?hostId='+$scope.host_id+'&meetingId='+sharedData.meeting.update_meeting_id+'&authToken='+localStorage.authTicket+'&topic='+$scope.meeting.meetingTopic+'&startTime='+$scope.starts+'&duration='+$scope.meeting.hourDuration+''+$scope.meeting.minDuration +'&timezone='+$scope.meeting.timezone+'&password='+$scope.meeting.password+'&jbh='+$scope.meeting.jbh+"&T="+ new Date().getTime()}).success(function(data){
              
              
              $modalInstance.close();
              

          });

                     

    }
  };




  $scope.startTime = "";
  $scope.starts = null;





  $scope.scheduleMeeting = function (AmPm) {
    if(sharedData.meeting.meetingTopic == ""){
      sharedData.meeting.meetingTopic = $scope.userName + " Meeting";
    }
    
  $scope.startTime = $scope.meeting.dt;
  $scope.startMonth = $scope.startTime.getMonth()+1;

  $scope.startDay = $scope.startTime.getDate()+1;
  $scope.startHour = $scope.meeting.timeSelect;
  $scope.startMinute = $scope.meeting.timeSelect.substr(2,3);
  $scope.colon = $scope.startHour.indexOf(":");
  $scope.startHourUTC = $scope.startHour.substr(0,$scope.colon);

    $scope.hourUTC = $scope.startHourUTC;

var dates = $filter('date')($scope.startTime,'Z');

if($scope.meeting.AmPm =="AM"){
  
  $scope.startHourUTC = parseInt($scope.startHourUTC);
  $scope.hourUTC =parseInt($scope.startHourUTC) + 12;
    $scope.startDay = $scope.startTime.getDate();
    
 
 }
  if($scope.meeting.AmPm =="PM"){
  
  $scope.hourUTC =$scope.startHourUTC;
    $scope.startDay = $scope.startTime.getDate()+1;
    

 }
 if($scope.meeting.AmPm == "PM" && $scope.startHourUTC == 12){
  $scope.hourUTC =parseInt($scope.startHourUTC) - 12;
  $scope.startDay = $scope.startTime.getDate()+1;
 }
  if($scope.meeting.AmPm == "AM" && $scope.startHourUTC == 12){
  $scope.hourUTC =$scope.startHourUTC;
  $scope.startDay = $scope.startTime.getDate();
 }
 
 
   $scope.starts = $scope.startTime.getFullYear() + "-"+ $scope.startMonth+"-"+$scope.startDay+"T"+$scope.hourUTC+$scope.startMinute+":00Z";
if($scope.meeting.hourDuration ==0 && $scope.meeting.minDuration == 0){
  alert("Looks like you did not select a Duration. Please select a Duration for your meeting.");
}
else{


    $http.post(fjs.CONFIG.SERVER.ppsServer +getURL('zoom/createScheduledMeeting')+'&hostId='+hostId+'&topic='+$scope.meeting.meetingTopic+'&email='+$rootScope.meModel.email+'&startTime='+$scope.starts+'&startHour='+$scope.AmPm+'&duration='+$scope.meeting.hourDuration+''+$scope.meeting.minDuration +'&timezone='+$scope.meeting.timezone+'&password='+$scope.meeting.password+'&jbh='+$scope.meeting.jbh+"&T="+ new Date().getTime()).success(function(data, status, headers, config){
     
    

$modal.open({
      animation: $scope.animationsEnabled,
      templateUrl: 'copyToClipboard.html',
      controller: 'ModalInstanceCtrlTwo',
      size: 'lg',
      resolve: {
        schedule: function () {
          return $scope.scheduleBtn;
        },
        pmiId:function(){

        },
        startDate:function(){
           return $scope.meeting.dt;
        },
        startTime:function(){
         return $scope.meeting.timeSelect;
        },
        topic:function(){
          return $scope.meeting.meetingTopic;
        },
        meeting_Id:function(){
          return data.meeting.meeting_id;
        },
        timezone:function(){
          return $scope.meeting.timezone;
        },
        password:function(){
          return $scope.meeting.password;
        }
      }
    });

        $modalInstance.close();


  });








    
    
  }
  };

   $scope.cancel = function () {
    $modalInstance.dismiss('cancel');
  };

$scope.$on('$destroy', function() {
        $rootScope.$broadcast('modalInstance');
        
      });

 
});



hudweb.controller('ModalInstanceCtrlTwo', function ($scope,pmiId,startDate,startTime,topic,meeting_Id,timezone,password,$modalInstance,$http,$rootScope,$modal,sharedData,$route) {


    $scope.loadingGif1 = false;
    $scope.loadingGif2 = true;
    var getURL = function(action) {

        var url = 
           action
          + '?fonalityUserId=' + $rootScope.myPid.split('_')[1]
          + '&serverId=' + $rootScope.meModel.server_id
          + '&serverType=' + ($rootScope.meModel.my_jid.indexOf('pbxtra') != -1 ? 'pbxtra' : 'trixbox')
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
  $scope.pmiId = pmiId;
    $scope.startDate = startDate;
    $scope.startTime = startTime;
    $scope.topic = topic;
    $scope.meeting_Id = meeting_Id;
    $scope.timezone = timezone;
    $scope.password = password;
 
   


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

