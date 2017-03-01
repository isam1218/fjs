hudweb.filter('SortItems', function() {
	 return function(items, field) {
		//this will work for both objects and arrays 
		var filtered = []; 
	    angular.forEach(items, function(item) {
	      filtered.push(item);
	    });
	       filtered.sort(function (a, b) {
		      var an = a[field] != undefined && a[field] != null ? a[field].toLowerCase() : '';
		      var bn = b[field] != undefined && b[field] != null ? b[field].toLowerCase() : '';
		      return an < bn ? -1 : an > bn ? 1 : 0
		    });
		    
		return filtered;
	 };
});
