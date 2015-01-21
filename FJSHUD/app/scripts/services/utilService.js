UtilService = function(){
	var Months = ['January','February','March','April','May','June','July','August','October','September','November','December'];
    var Weekday = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];


	this.formatDuration = function(time){
	        var date = new Date(calllog.startedAt)
	        var today = new Date();
	        var DateString = "";
	        hour = date.getHours();
	        ampm = " am";
	        dateString = date.getFullYear() + " " + Months[date.getMonth()] + " " + date.getDate();
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


	this.formatDate =function(time){
	        var date = new Date(calllog.startedAt)
	        var today = new Date();
	        var DateString = "";
	        hour = date.getHours();
	        ampm = " am";
	        dateString = date.getFullYear() + " " + Months[date.getMonth()] + " " + date.getDate();
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
}
