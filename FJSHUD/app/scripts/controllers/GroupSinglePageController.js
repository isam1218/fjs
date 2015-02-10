hudweb.controller('GroupSinglePageController', ['$scope','$routeParams','PhoneService','GroupService','ContactService','HttpService', 
	function($scope,$routeParams,phoneService,groupService,contactService,httpService) {
	
	 var context = this;
	 $scope.groupId = $routeParams.groupId;
	 $scope.group = groupService.getGroup($scope.groupId);
	 $scope.inCall = false;
	 $scope.groupCallOriginator = {};
	 $scope.pageMembers = [];
	 $scope.callTestFunction = function(){
	 	console.log("success");
	 }
	 httpService.getFeed('group_page_member')

	 this.getElementOffset = function(element) {
        if(element != undefined)
        {
            var box = null;
            try {
                box = element.getBoundingClientRect();
            }
            catch(e) {
                box = {top : 0, left: 0, right: 0, bottom: 0};
            }
            var body = document.body;
            var docElem = document.documentElement;
            var scrollLeft = window.pageXOffset || docElem.scrollLeft || body.scrollLeft;
            var scrollTop = window.pageYOffset || docElem.scrollTop || body.scrollTop;
            var clientLeft = docElem.clientLeft || body.clientLeft || 0;
            var clientTop = docElem.clientTop || body.clientTop || 0;

            var left = box.left + scrollLeft - clientLeft;
            var top = box.top +  scrollTop - clientTop;
            return {x:left, y:top};
        }
    }

     $scope.getMeAvatarUrl = function(xpid){
        
        return httpService.get_avatar(xpid,40,40);
    };
	 this.getEventHandlerElement = function(target, event) {
      if(target.getAttribute("data-ng-"+event.type)) {
          return target;
      }
      else if(target.parentNode) {
          return this.getEventHandlerElement(target.parentNode, event);
      }
	};
	$scope.showPagePopup = function(e) {
        e.stopPropagation();
        var eventTarget = context.getEventHandlerElement(e.target, e);
        var offset = context.getElementOffset(eventTarget);
        $scope.showPopup({key:"PagePopup", x:offset.x, y:offset.y+30});
        return false;
    };

    $scope.$on("groups_updated", function(event,data){
    	$scope.group = groupService.getGroup($scope.groupId);
    });

    $scope.$on("group_page_member_synced",function(event,data){
    	var pageMembers = data.filter(function(item){
    		return item.groupId == $scope.groupId;
    	});
		$scope.pageMembers = [];
    	for (member in pageMembers){
    		var contact = contactService.getContact(pageMembers[member].contactId);
    		contact.pageMemberId = pageMembers[member].xpid;    		
    		if(pageMembers[member].originator){
    			$scope.groupCallOriginator = contact;	
    		}else{
    			$scope.pageMembers.push(contact);
    		}
    	}
	
		$scope.$safeApply();


    });

    $scope.callGroup = function(numPrefix){
    	if($scope.group.extension){
			phoneService.makeCall(numPrefix + $scope.group.extension);
    	}
    }





}]);