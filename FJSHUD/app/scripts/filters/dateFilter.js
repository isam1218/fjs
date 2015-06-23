hudweb.filter('fondate', ['NtpService', function(ntpService) {
    return function(milliseconds,dateformat,locale,chatSection) {		
		
    	var todayTime = ntpService.calibrateTime(new Date().getTime());
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
    	
        if (chatSection === 'list_message_left'){
            return moment(milliseconds).lang(locale_code).format('hh:mm a');
        } else if (chatSection === 'list_message_header' && moment(milliseconds).startOf('day').isSame(moment(todayTime).startOf('day'))){
            return "Today";
        } else if (chatSection === 'list_message_header' && moment(milliseconds).startOf('day').isSame(moment(todayTime).subtract(1,'days').startOf('day'))){
            return "Yesterday";
        } else if (moment(milliseconds).startOf('day').isSame(moment(todayTime).startOf('day'))){
    		return "Today " + moment(milliseconds).lang(locale_code).format('hh:mm a');
    	} else if (moment(milliseconds).startOf('day').isSame(moment(todayTime).subtract(1,'days').startOf('day'))){
    		return "Yesterday " + moment(milliseconds).lang(locale_code).format('hh:mm a');
    	} else if (moment(milliseconds).startOf('year').isSame(moment(todayTime).startOf('year'))){
            return moment(milliseconds).lang(locale_code).format("MMMM D, hh:mm a");
        } else {
            //return moment(new Date(milliseconds)).format(dateformat);
    		return moment(milliseconds).lang(locale_code).format(dateformat);
    	}
    	
	};
}]);
