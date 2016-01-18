hudweb.controller('LoginController', ['$q', '$rootScope', '$scope', '$routeParams', '$timeout', function($q, $rootScope, $scope, $routeParams, $timeout) {
	$scope.session = {};
	$scope.userLogin = {};	
	$scope.emptyUserLoginField = false;
	$scope.emptyPWLoginField = false;
	
	$scope.resetError = function(event){
		$scope.loginError = false;
		if($(event.target).attr('id') == 'username') 
			$scope.emptyUserLoginField = false;
		else
			$scope.emptyPWLoginField = false;
		//$scope.$safeApply();
	};
	
	$scope.login = function(user) {		
			console.log("onload");			
			$rootScope.sock = new WebSocket($scope.wsuri);	
		
			
			var current_user = angular.copy(user);
			var username = current_user.username;
			var pw = current_user.password;
			$rootScope.username = current_user.username;
			localStorage.username = current_user.username;
			
			$rootScope.sock.onopen = function() {	                    
		            console.log("connected to " + $scope.wsuri);	            
		            var myObj = {};
					var objBody = {};
					myObj.reqType = "auth/login";
					myObj.ts = parseInt(new Date().getTime(),10);				
					objBody.username = username;
					objBody.password = pw;//'test1234';
					myObj.body = JSON.stringify(objBody);
					var json = JSON.stringify(myObj);
					$rootScope.sock.send(json);	
					
					$scope.connectWS();
		     };		
	};
	    /*
	$scope.resetLogin = function() {
	      $scope.user = angular.copy($scope.userLogin);
	};

	$scope.resetLogin();*/
	    
}]);
