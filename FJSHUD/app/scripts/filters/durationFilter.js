hudweb.filter('duration', function() {
    return function(duration) {
        var date = new Date(duration);
        var seconds = date.getSeconds();
        var minutes;
		
        if (seconds > 60){
            minutes = parseInt(seconds/60) 
            seconds = seconds - (60*minutes);
        }

        if (seconds < 10)
            seconds = "0" + seconds;
			
        if (minutes)
            return minutes + ":" + seconds;
        else
            return "00:" + seconds;
    };
});