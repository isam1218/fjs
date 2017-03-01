hudweb.filter('formatPhoneNumber', function() {
	return function(number) {			
		var regStr = /^(9-|91-|1-)/;
		if(number.indexOf('@') != -1)
		{	
			var start = number.substring(0, number.indexOf('@') + 2);
			number = number.substring(number.indexOf('@') + 2);	
			return start + number.replace(regStr, '');
		}	
		else
			return number.replace(regStr, '');	   
	};
});