hudweb.filter('links', function($sce) {
	var regex1 = new RegExp('^[\\w\\.]+\\.(com|edu|net|gov|org)((\\?|#).*){0,1}$', 'gi');
	var regex2 = new RegExp('^\\w+@\\w+\\.\\w{2,4}$', 'gi');
		
	// turns text into links
    return function(text) {
		var text = text.toString();
		var words = text.split(' ');
		
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
		
		return $sce.trustAsHtml(words.join(' '));
	};
});