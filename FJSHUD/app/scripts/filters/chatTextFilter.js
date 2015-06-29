hudweb.filter('chatify', ['$sce', 'HttpService', function($sce, httpService) {
	var regex1 = new RegExp('^[\\w\\.]+\\.(com|edu|net|gov|org)((\\?|#).*){0,1}$', 'gi');
	var regex2 = new RegExp('^\\w+@\\w+\\.\\w{2,4}$', 'gi');
		
    return function(text) {
		var text = text.toString();
		var words = text.split(' ');
		
		for (var i = 0, len = words.length; i < len; i++) {
			// 1: turn text into links
			// e-mail address
			if (words[i].match(regex2))
				words[i] = '<a href="mailto:' + words[i] + '" target="_blank">' + words[i] + '</a>';
			// url with protocol
			else if (words[i].indexOf('http://') == 0 || words[i].indexOf('https://') == 0)
				words[i] = '<a href="' + words[i] + '" target="_blank">' + words[i] + '</a>';
			// url no protocol
			else if (words[i].match(regex1))
				words[i] = '<a href="http://' + words[i] + '" target="_blank">' + words[i] + '</a>';
			
			// 2: make smilies
			switch(words[i]) {
				case '&gt;:-(':
					words[i] = '<img src="' + httpService.get_smiley(8) + '" />';
					break;
				case ':-|':
					words[i] = '<img src="' + httpService.get_smiley(7) + '" />';
					break;
				case ':-(':
					words[i] = '<img src="' + httpService.get_smiley(6) + '" />';
					break;
				case 'o_0':
					words[i] = '<img src="' + httpService.get_smiley(5) + '" />';
					break;
				case ':-P':
					words[i] = '<img src="' + httpService.get_smiley(4) + '" />';
					break;
				case ":'(":
					words[i] = '<img src="' + httpService.get_smiley(3) + '" />';
					break;
				case ':-)':
					words[i] = '<img src="' + httpService.get_smiley(2) + '" />';
					break;
				case ':-D':
					words[i] = '<img src="' + httpService.get_smiley(1) + '" />';
					break;
			}
		}
		
		return $sce.trustAsHtml(words.join(' '));
	};
}]);