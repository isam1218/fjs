hudweb.filter('chatify', ['$sce', 'HttpService', function($sce, httpService) {
	var regex1 = new RegExp('^[\\w\\.]+\\.(com|edu|net|gov|org)((\\?|#).*){0,1}$', 'gi');
	var regex2 = new RegExp('^\\w+@\\w+\\.\\w{2,4}$', 'gi');
		
    return function(t) {
		var text = t.toString();
		var words = text.split(' ');
		
		// 1: turn text into links
		for (var i = 0, len = words.length; i < len; i++) {
			// e-mail address
			if (words[i].match(regex2))
				words[i] = '<a href="mailto:' + words[i] + '" target="_blank">' + words[i] + '</a>';
			// url with protocol
			else if (words[i].indexOf('http://') == 0 || words[i].indexOf('https://') == 0)
				words[i] = '<a href="' + words[i] + '" target="_blank">' + words[i] + '</a>';
			// url no protocol
			else if (words[i].match(regex1))
				words[i] = '<a href="http://' + words[i] + '" target="_blank">' + words[i] + '</a>';
		}
		
		text = words.join(' ');
			
		// 2: make smilies
		text = text
			.replace(/&gt;:-\(/g, '<img src="' + httpService.get_smiley(8) + '" />')
			.replace(/:-\|/g, '<img src="' + httpService.get_smiley(7) + '" />')
			.replace(/:-\(/g, '<img src="' + httpService.get_smiley(6) + '" />')
			.replace(/o_0/g, '<img src="' + httpService.get_smiley(5) + '" />')
			.replace(/:-P/g, '<img src="' + httpService.get_smiley(4) + '" />')
			.replace(/:'\(/g, '<img src="' + httpService.get_smiley(3) + '" />')
			.replace(/:-\)/g, '<img src="' + httpService.get_smiley(2) + '" />')
			.replace(/:-D/g, '<img src="' + httpService.get_smiley(1) + '" />');
			
		// 3: line breaks
		text = text.replace(/\n/g, '<br/>');
		
		// return html
		return $sce.trustAsHtml(text);
	};
}]);