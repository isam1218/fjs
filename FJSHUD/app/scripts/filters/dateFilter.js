hudweb.filter('fondate', function() {
    return function(milliseconds,dateformat,locale) {		
		
    	var todayTime = new Date().getTime();
    	var locale_code = 'en';
    	
    	//this will switch the locale from our format to moment.js prefered locale code
    	switch(locale){
    		case 'us':
    			locale_code = 'en';
    			break;
    		case 'jp':
    			locale_code = 'ja';
    			break;
    	}	

    	//will return different text depended on whether or not its today or yesterday otherwise return the full date with specified date format
    	
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
