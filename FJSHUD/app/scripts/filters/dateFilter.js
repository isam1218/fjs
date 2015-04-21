hudweb.filter('fondate', function() {
	// format time as "x days 00:00:00"
    return function(milliseconds,dateformat,locale) {		
		
    	var todayTime = new Date().getTime();
    	var locale_code = 'en';
    	
    	switch(locale){
    		case 'us':
    			locale_code = 'en';
    			break;
    		case 'jp':
    			locale_code = 'ja';
    			break;
    	}	

    	if(moment(milliseconds).startOf('day').isSame(moment(todayTime).startOf('day'))){
    		return "today " + moment(milliseconds).lang(locale_code).format('hh:mm a');
    	}else if(moment(milliseconds).startOf('day').isSame(moment(todayTime).subtract(1,'days').startOf('day')))
    	{
    		return "yesterday " + moment(milliseconds).lang(locale_code).format('hh:mm a');
    	}else{
    		return moment(milliseconds).lang(locale_code).format(dateformat);
    	}
    	
	};
});
