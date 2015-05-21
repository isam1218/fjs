hudweb.filter('highlight', function($sce) {
    return function(text, phrase) {
		var text = text.toString();
		
		if (phrase) {
			// escape special chars
			phrase = phrase.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
			
			// replace text NOT inside html tags
			text = text.replace(new RegExp('(' + phrase + '(?![^<>]*>))', 'gi'), '<span class="highlighted">$1</span>');
		}

		return $sce.trustAsHtml(text);
    }
});