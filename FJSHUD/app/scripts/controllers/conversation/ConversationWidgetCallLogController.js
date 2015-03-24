hudweb.controller('ConversationWidgetCallLogController', ['$scope', '$routeParams', '$timeout', '$filter', 'HttpService', 'UtilService', 'ContactService', function($scope, $routeParams, $timeout, $filter, httpService, utilService, contactService) {
    $scope.contactId = $routeParams.contactId;
    $scope.calllogs = [];    

    httpService.getFeed("calllog")
    $scope.$on('calllog_synced', function(event,data){
        $scope.calllogs = data;
    });
    $scope.recentSelectSort = "Date";
    $scope.isAscending = false;
	//converting contactid from hex to regular decimal format because the regular decimal format is used for the call log contact ids
    $scope.contactId = parseInt('0x' + $routeParams.contactId.split("_")[0]) + "_" + $routeParams.contactId.split("_")[1];

    var contact = contactService.getContact($scope.contactId);

    var update = function(data) {
        if(data.xpid == $scope.contactId) {
            if(!$scope.contact) {
                $scope.contact = contactModel.items[$scope.contactId];
            }
            updateFavicon();
        }
    };

    $scope.customFilter = function(){
        return function(item){
            if (item.contactId === $scope.$parent.$parent.contactID){
                return true;
            }
        };
    };

    $scope.get_avatar = function(xpid){
        return httpService.get_avatar(xpid,40,40);
    };

    $scope.formate_date = function(time){
        return utilService.formatDate(time);
    };

    $scope.formatDuration = function(time){
        return utilService.formatDuration(time);
    };

    $scope.getCalllogTypeImg = function(calllog){
        if(calllog.missed){
            return "img/XIcon-CallLog-Missed.png?v=1418381374907";
        }else{
            return "img/XIcon-CallLog-Outbound.png?v=1418381374907";
        }
    };

     $scope.sortCallLog = function(sortType){
        switch(sortType){
            case "Date":
                if($scope.isAscending){
                    
                    $scope.calllogs.sort(function(a,b){
                        return a.startedAt - b.startedAt;
                    }); 
                    $scope.isAscending = false;   
                }else{
                    $scope.calllogs.sort(function(a,b){
                        return b.startedAt - a.startedAt;
                    });
                    $scope.isAscending = true;
                }
                
                break;
            case "Phone":
                 if($scope.isAscending){
                    $scope.calllogs.sort(function(a,b){
                        return b.phone.localeCompare(b.phone);
                    });
                   
                    $scope.isAscending = false;   
                }else{
                     $scope.calllogs.sort(function(a,b){
                     return a.phone.localeCompare(b.phone);
                        
                    }); 
                    
                    $scope.isAscending = true;
                }
                break;
            case "Type":
                if($scope.isAscending){
                    $scope.calllogs.sort(function(a,b){
                        if(a.incoming && b.incoming){
                            return b.location.localeCompare(b.location);
                        }else if(a.incoming){
                            return b.phone.localeCompare(a.location);
                        }else if(b.incoming){
                            return b.location.localeCompare(a.phone);
                        }else{
                            return b.phone.localeCompare(a.phone);
                        }
                    });
                    
                    $scope.isAscending = false;   
                }else{

                    $scope.calllogs.sort(function(a,b){
                        if(a.incoming && b.incoming){
                            return a.location.localeCompare(b.location);
                        }else if(a.incoming){
                            return a.location.localeCompare(b.phone);
                        }else if(b.incoming){
                            return a.phone.localeCompare(b.location);
                        }else{
                            return a.phone.localeCompare(b.phone);
                        }
                    }); 
                    
                    $scope.isAscending = true;
                }
                break;

            case "Duration":
                if($scope.isAscending){
                    
                    $scope.calllogs.sort(function(a,b){
                        return a.duration - b.duration;
                    }); 
                    $scope.isAscending = false;   
                }else{
                    $scope.calllogs.sort(function(a,b){
                        return b.duration - a.duration;
                    });
                    $scope.isAscending = true;
                }
                break;
            case "Name":
                if($scope.isAscending){
                    
                    $scope.calllogs.sort(function(a,b){
                        return b.displayName.localeCompare(a.displayName);
                    }); 
                    $scope.isAscending = false;   
                }else{
                    $scope.calllogs.sort(function(a,b){
                        
                        return a.displayName.localeCompare(b.displayName);
                    });
                    $scope.isAscending = true;
                }
                break;
            
        }

        $scope.recentSelectSort = sortType;
  };

   


    /*$scope.$on("$destroy", function() {
        contactModel.removeEventListener("push", update);
        if (durationTimer) {
            $timeout.cancel(durationTimer);
        }
    });*/
}]);