hudweb.directive('player', ['$parse', '$sce', '$filter', 'HttpService', function($parse, $sce, $filter, httpService) {
	return {
		restrict: 'E',
		replace: true,
		template: '<div class="player not-loaded"></div>',
		link: function(scope, element, attrs) {
			// player data
			var data = $parse(attrs.data)(scope);
			var path = data.voicemailMessageKey ? 'vm_download?id=' + data.voicemailMessageKey : 'media?key=callrecording:' + data.xpid;
			var audio = new Audio($sce.trustAsResourceUrl(httpService.get_audio(path)));
			var retry;
			var attempts = 0;
			
			// inner html
			element.append('<span class="material-icons">play_arrow</span><div class="duration">' + $filter('duration')(0) + '</div><div class="progress"><img src="img/loading-green.gif" /></div><div class="duration">' + $filter('duration')(data.duration) + '</div>');
			
			var button = element.children()[0];
			var duration = element.children()[1];
			var progress = element.children()[2];
			
			audio.onloadeddata = function() {
				// user can now play audio
				element.removeClass('not-loaded');
				
				button.onclick = function() {
					switch(this.innerHTML) {
						case 'play_arrow':
							audio.play();
							this.innerHTML = 'pause';
							break;
						case 'pause':
							audio.pause();
							this.innerHTML = 'play_arrow';
							break;
					}
				};
				
				progress.innerHTML = '<div><div></div></div>';
				
				progress.onmousedown = function(e) {
					// prevent accidental dragging
					window.getSelection().removeAllRanges();
					
					// move slider
					var rect = this.getBoundingClientRect();
					progress.children[0].style.width = (e.clientX - rect.left) + 'px';
				
					document.body.onmousemove = function(e) {
						var diff = e.clientX - rect.left;
						
						// keep within range
						if (diff < 0)
							diff = 0;
						else if (diff > rect.width)
							diff = rect.width;
						
						progress.children[0].style.width = diff + 'px';
					};
				
					document.body.onmouseup = function(e) {
						// set new progress
						var diff = (e.clientX - rect.left) / rect.width;
						audio.currentTime = diff * (data.duration/1000);
						
						// remove listeners
						document.body.onmousemove = null;
						document.body.onmouseup = null;
					};
				};
			};
			
			audio.ontimeupdate = function() {
				// progress
				duration.innerHTML = $filter('duration')(audio.currentTime*1000);
				
				// prevent the jitters
				if (!document.body.onmousemove)
					progress.children[0].style.width = (audio.currentTime*1000 / data.duration)*100 + '%';
			};	
			
			audio.onended = function() {				
				// set to end to account for bugged durations
				duration.innerHTML = $filter('duration')(data.duration);
				progress.children[0].style.width = '100%';
			};
			
			audio.onpause = function() {
				button.innerHTML = 'play_arrow';
			};	
			
			audio.onplay = function() {
				button.innerHTML = 'pause';
				
				// mark as read
				if (data.readStatus !== undefined)
					httpService.sendAction('voicemailbox', 'setReadStatus', {'read': true, id: data.xpid});
			};
			
			audio.onerror = function() {
				// retry 3x, then give up
				if (attempts < 3) {
					retry = setTimeout(function() {
						audio.load();
					}, 1000);
					
					attempts++;
				}
				else {
					progress.innerHTML = 'Unable to load ' + (data.voicemailMessageKey ? 'voicemail' : 'recording');
				}
			};
			
			scope.$on("$destroy", function() {
				clearTimeout(retry);
				duration = null;
				
				button.onclick = null;
				button = null;
				
				progress.onmousedown = null;
				progress = null;
				
				audio.pause();
				audio.onloadeddata = null;
				audio.ontimeupdate = null;
				audio.onpause = null;
				audio.onplay = null;
				audio.onended = null;
				audio.onerror = null;
				audio = null;
			});
		}
	};
}]);