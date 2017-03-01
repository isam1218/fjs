hudweb.filter('fondate', ['$rootScope', 'NtpService', function($rootScope, ntpService) {
    return function(milliseconds, format) {
		/* 
			format can be full, date, or time (where full is date + time).
			full and date will take into account "today" and "yesterday."
		*/
		
        var now = new Date(ntpService.calibrateTime(new Date().getTime()));
		var inputReset = new Date(milliseconds).setHours(0, 0, 0, 0);
		
    	var locale = $rootScope.fon_lang_code;
		var locale_code = 'en';
		
		if (locale == 'jp')
			locale_code = 'ja';
		
		var output = '';
		
		if (format == 'full' || format == 'date') {
			// is today if both times have the same starting point
			if (now.setHours(0, 0, 0, 0) == inputReset)
				output = fjs.i18n[locale].today;
			// subtract a day for yesterday
			else if (now.setDate(now.getDate()-1) == inputReset)
				output = fjs.i18n[locale].yesterday;
			else
				output = moment(milliseconds).locale(locale_code).format('MM/DD/YY');
			
			// add time
			if (format == 'full')
				output += ' ' + moment(milliseconds).locale(locale_code).format('hh:mm a');
		}
		// time only
		else
			output = moment(milliseconds).locale(locale_code).format('hh:mm a');
		
		return output;        
	};
}]);
