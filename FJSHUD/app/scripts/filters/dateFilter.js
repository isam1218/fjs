hudweb.filter('fondate', function() {
	// format time as "x days 00:00:00"
    return function(milliseconds,dateformat,locale) {		
		
    	var todayTime = new Date().getTime();
    	if(moment(milliseconds).startOf('day').isSame(moment(todayTime).startOf('day'))){
    		return "today" + moment(milliseconds).format('hh:mm a');
    	}else if(moment(milliseconds).startOf('day').isSame(moment(todayTime).subtract(1,'days').startOf('day')))
    	{
    		return "yesterday" + moment(milliseconds).format('hh:mm a');
    	}

    	switch(locale){
    		case 'us':
    			return moment(milliseconds).lang('en').format(dateformat);
    		case 'jp':
    			return moment(milliseconds).lang('ja').format(dateformat);
    	}
	};
});