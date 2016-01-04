hudweb.filter('fondate', ['NtpService', function(ntpService) {
    return function(milliseconds,dateformat,locale,chatSection) {		
        var todayTime = ntpService.calibrateTime(new Date().getTime());
    	var locale_code = 'en';

        var dateInputted = new Date(milliseconds).getDate();
        var monthInputted = new Date(milliseconds).getMonth();
        var yearInputted = new Date(milliseconds).getFullYear();

        var dateNumberToday = new Date(todayTime).getDate();
        var monthToday = new Date(todayTime).getMonth();
        var yearToday = new Date(todayTime).getFullYear();

        // subtract 86400000 milliseconds from todays time to find the time it was yesterday, use that time to calculate the date of yesterday
        var yesterdayTime = todayTime - 86400000;
        var dateNumberYesterday = new Date(yesterdayTime).getDate();
        var monthYesterday = new Date(yesterdayTime).getMonth();
        var yearYesterday = new Date(yesterdayTime).getFullYear();

        // subtract 518,400,000 from todays time to find the time from 6 days ago (a week ago), use that time to calculate last week of days
        var weekagoTime = todayTime - 518400000;
        var dateNumberLastWeek = new Date(weekagoTime).getDate();
        var monthLastWeek = new Date(weekagoTime).getMonth();
        var yearYesterday = new Date(weekagoTime).getFullYear();
        var weekagoDay = new Date(milliseconds).getDay();

        var weekObj = {
            0: "Sunday",
            1: "Monday",
            2: "Tuesday",
            3: "Wednesday",
            4: "Thursday",
            5: "Friday",
            6: "Saturday",
        }

        var monthObj = {
            0: "January",
            1: "February",
            2: "March",
            3: "April",
            4: "May",
            5: "June",
            6: "July",
            7: "August",
            8: "September",
            9: "October",
            10: "November",
            11: "December"
        }

        var calcTime = function(time1){
            var hour = new Date(time1).getHours();
            var min = new Date(time1).getMinutes();
            var ampm = 'am';
            if (hour == 12){
                // 12pm - 12:59pm
                ampm = 'pm';
            } else if (hour > 12){
                // 1pm - 11:59pm
                hour = hour - 12;
                ampm = 'pm';
            }
            if (hour == 0){
                // 12am - 12:59am
                hour = 12;
            } else if (hour < 10){
                // 1am - 9:59am
                hour = '0' + hour;
            }
            if (min < 10){
                // add 0 to beginning of single digit min count (1 - 9)
                min = '0' + min;
            }
            return hour + ':' + min + ' ' + ampm;
        };

    	//this will switch the locale from our format to moment.js prefered locale code
    	switch(locale){
    		case 'us':
    			locale_code = 'en';
                // use JS date obj
                if (chatSection === 'list_message_left'){
                    return calcTime(milliseconds);
                }
                else if (chatSection === 'list_message_header' && dateInputted === dateNumberToday && monthInputted === monthToday && yearInputted === yearToday){
                    return fjs.i18n[locale].today;
                }
                else if (chatSection === 'list_message_header' && dateInputted === dateNumberYesterday && monthInputted === monthYesterday && yearInputted === yearYesterday){
                    return fjs.i18n[locale].yesterday;
                }
                else if (chatSection === 'list_message_header' && (milliseconds > weekagoTime && milliseconds < todayTime)){
                    return weekObj[weekagoDay];
                }
                else if (chatSection === 'list_message_header' && yearInputted === yearToday){
                    return monthObj[monthInputted] + ' ' + dateInputted;
                }
                else if (chatSection === 'list_message_header' && yearInputted !== yearToday){
                    return monthObj[monthInputted] + ' ' + dateInputted + ' ' + yearInputted;
                }
                else if (dateInputted === dateNumberToday && monthInputted === monthToday && yearInputted === yearToday){
                    return fjs.i18n[locale].today + ' ' + calcTime(milliseconds);
                }
                else if (dateInputted === dateNumberYesterday && monthInputted === monthYesterday && yearInputted === yearYesterday){
                    return fjs.i18n[locale].yesterday + ' ' + calcTime(milliseconds);
                }
                else if (milliseconds > weekagoTime && milliseconds < todayTime){
                    return weekObj[weekagoDay] + ', ' + calcTime(milliseconds);
                }
                else if (yearInputted === yearToday){
                    return monthObj[monthInputted] + ' ' + dateInputted + ', ' + calcTime(milliseconds);
                }
                else {
                    return monthObj[monthInputted] + ' ' + dateInputted + ' ' + yearInputted + ', ' + calcTime(milliseconds);
                }
                break;
            case 'jp':
                locale_code = 'ja';
                // only use moment.js if japanese is chosen language...
                if (chatSection === "list_message_left"){
                    return calcTime(milliseconds);
                } 
                else if (chatSection === 'list_message_header' && dateInputted === dateNumberToday && monthInputted === monthToday && yearInputted === yearToday){
                    return fjs.i18n[locale].today;
                } 
                else if (chatSection === 'list_message_header' && dateInputted === dateNumberYesterday && monthInputted === monthYesterday && yearInputted === yearYesterday){
                    return fjs.i18n[locale].yesterday;
                } 
                else if (chatSection === 'list_message_header' && (milliseconds > weekagoTime && milliseconds < todayTime)){
                    return moment(milliseconds).lang(locale_code).format('dddd');
                } 
                else if (chatSection === 'list_message_header' && yearInputted === yearToday){
                    return moment(milliseconds).lang(locale_code).format('MMMM D');
                } 
                else if (chatSection === 'list_message_header' && yearInputted !== yearToday){
                    return moment(milliseconds).lang(locale_code).format('MMMM D YYYY');
                }
                else if (dateInputted === dateNumberToday && monthInputted === monthToday && yearInputted === yearToday){
                    return fjs.i18n[locale].today + moment(milliseconds).lang(locale_code).format('hh:mm a');
                } 
                else if (dateInputted === dateNumberYesterday && monthInputted === monthYesterday && yearInputted === yearYesterday){
                    return fjs.i18n[locale].yesterday + moment(milliseconds).lang(locale_code).format('hh:mm a');
                } 
                else if (yearInputted === yearToday){
                    return moment(milliseconds).lang(locale_code).format("MMMM D, hh:mm a");
                } 
                else {
                    return moment(milliseconds).lang(locale_code).format(dateformat);
                }
                break;
        }   
        
	};
}]);
