hudweb.filter('formatPhoneNumber', function() {
	return function(number) {			
		var regStr = /^(9-|91-|1-)/;		
		return number.replace(regStr, '');	   
	};
});