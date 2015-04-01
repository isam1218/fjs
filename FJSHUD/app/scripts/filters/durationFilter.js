hudweb.filter('duration', function() {
	// format time as "x days 00:00:00"
    return function(duration) {		
		var seconds = Math.floor(duration / 1000);
		var minutes = Math.floor(((seconds % 86400) % 3600) / 60);
		var hours = Math.floor((seconds % 86400) / 3600);
		var days = Math.floor(seconds / 86400);
		
		var timeString = '';
		
		if (days > 1)
			timeString = days + ' days ';
		else if (days == 1)
			timeString = '1 day ';
		
		if (hours > 0) 
			timeString += hours + ':';
		
		if (minutes > 9)
			timeString += minutes + ':';
		else if (minutes > 0)
			timeString += '0' + minutes + ':';
		else
			timeString += '00:';
		
		seconds = seconds % 60;
		
		if (seconds > 9)
			timeString += seconds;
		else if (seconds > 0)
			timeString += '0' + seconds;
		else
			timeString += '00';
		
		return timeString;
    };
});