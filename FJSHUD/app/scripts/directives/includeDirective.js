hudweb.directive('includeOnce', [function(){ 
	return { 
		restrict: 'AE', 
		templateUrl: function(elem,attrs){ 
			return attrs.includeOnce; 
		} 
	}; 
}]);