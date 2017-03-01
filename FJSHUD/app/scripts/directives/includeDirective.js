hudweb.directive('includeOnce', [function(){ 
	return { 
		restrict: 'AE', 
		priority: 400,
		templateUrl: function(elem,attrs){ 
			return attrs.includeOnce; 
		} 
	}; 
}]);