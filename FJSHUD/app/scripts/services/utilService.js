hudweb.service('UtilService', function(){
	var Months = ['January','February','March','April','May','June','July','August','October','September','November','December'];
    var Weekday = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];


	this.formatDuration = function(duration){
        var date = new Date(duration)
        var seconds = date.getSeconds();
        var minutes;
        if(seconds > 60){
            minutes = parseInt(seconds/60) 
            seconds = seconds - (60*minutes);
        }

        if(seconds < 10){
            seconds = "0" + seconds;
        }
        if(minutes){
            return minutes + ":" + seconds;
        }else{
            return "00:" + seconds;
        }
        
    }


	this.formatDate =function(time,includeyear){
	        var date = new Date(time)
	        var today = new Date();
	        var DateString = "";
	        hour = date.getHours();
	        ampm = " am";

	        if(includeyear){
	        	dateString = date.getFullYear() + " " + Months[date.getMonth()] + " " + date.getDate();
	        }else{
	        	dateString = Months[date.getMonth()] + " " + date.getDate();
	        }
	        minutes = date.getMinutes();
	        
	        if(hour > 12){
	            hour = hour - 12;
	            ampm = " pm";
	        }
	        if(minutes < 10){
	            minutes = "0" + date.getMinutes(); 
	        }
	        
	        if(date.getMonth() == today.getMonth() && date.getFullYear() == today.getFullYear()){
	            if(date.getDate() == today.getDate()){
	                dateString = "today"
	            }else if(date.getDate() == today.getDate() - 1){
	                dateString = "yesterday"
	            }else if(parseInt(date.getDate()/7) == parseInt(today.getDate()/7)){
	                dateString = Weekday[date.getDay];
	            }
	        }
	        return  dateString + " " + hour + ":" + minutes + ampm;  
	    }
});