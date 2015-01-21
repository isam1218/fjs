fjs.hud.filter.HighlightText = function($sce) {
    return function(text, phrase) {
		if (phrase) {
			// escape special chars
			phrase = phrase.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g, "\\$&");
			
			text = text.replace(new RegExp('('+phrase+')', 'gi'), '<span class="highlighted">$1</span>');
		}

		return $sce.trustAsHtml(text);
    }
};