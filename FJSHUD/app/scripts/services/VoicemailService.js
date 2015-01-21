fjs.hud.VoicemailService = function($q, $rootScope) {
	// required to deliver promises
	var deferred = $q.defer();
	
	var voicemails = [];

	$rootScope.$on('voicemailbox_synced', function(event, data) {
		// initial sync
		if (voicemails.length < 1) {
			voicemails = data;
			$rootScope.loaded = true;
		}
		else {
			for (i = 0; i < data.length; i++) {	
				for (c = 0; c < voicemails.length; c++) {
					// found contact
					if (voicemails[c].xpid == data[i].xpid) {
						// update or delete
						if (data[i].xef001type == 'delete')
							voicemails.splice(c, 1);
						else
							voicemails[c] = data[i];
							
						break;
					}
					
					// no match, so new record
					if (c == voicemails.length-1)
						voicemails.push(data[i]);
				}
			}
		}
		
		deferred.resolve(voicemails);
	});

	return deferred.promise;
}