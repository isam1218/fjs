hudweb.directive('avatar', ['$rootScope', '$parse', '$timeout', 'SettingsService', 'HttpService', function($rootScope, $parse, $timeout, settingsService, httpService) {
	var overlay = angular.element(document.getElementById('ContextMenu'));	
	var url = location.href.replace(location.hash, '');
	var defaultSize = 40;
	var timer;
	var current;
	
	// show new avatars by image
	$rootScope.$on('fdpImage_synced', function(event, data) {
		if (!document.getElementById('AppLoading')) {
			for (var i = 0, len = data.length; i < len; i++) {
				var avatars = document.querySelectorAll('.Avatar div[class="' + data[i].xpid + '"]');
				
				for (var j = 0; j < avatars.length; j++) {
					var size = avatars[j].getAttribute('size');
					
					avatars[j].innerHTML = '<div class="Darken"></div><img src="' + httpService.get_avatar(data[i].xpid, size, size, data[i].xef001iver) + '" />';
				}
				
				avatars = null;
			}
		}
	});
	
	// show new avatars by name
	$rootScope.$on('contacts_synced', function(event, data) {
		if (!document.getElementById('AppLoading')) {
			for (var i = 0, len = data.length; i < len; i++) {
				// we only care about external contacts
				if (data[i].xef001type != 'delete' && !data[i].primaryExtension) {
					var split = data[i].fullName.split(' ');
					var fName = split[0].charAt(0);
					var lName = '';
						
					if (split.length > 1)
						lName = split[split.length-1].charAt(0);
						
					var avatars = document.querySelectorAll('.Avatar div[class="' + data[i].xpid + '"] .Initials');
					
					// update initials
					for (var j = 0; j < avatars.length; j++)
						avatars[j].innerHTML = fName + lName;
					
					avatars = null;
				}
			}
		}
	});
	
	/**
		<avatar profile="member" // required user object
				context="widget:parent" // string of app area + optional data object
				type="{{callType}}" // integer to add colored border
				size="width" // integer to change default img src size
		</avatar>
	*/
	return {
		restrict: 'E',
		replace: true,
		template: '<div class="Avatar"></div>',
		priority: -1,
		link: function(scope, element, attrs) {
			var obj = $parse(attrs.profile)(scope);
			var profile = obj && obj.fullProfile ? obj.fullProfile : obj;
			var context, widget, rect;
			
			if (attrs.context) {
				widget = attrs.context.split(':')[0];
				context = attrs.context.split(':')[1];
			}
			
			/**
				AVATAR IMAGES
			*/
			
			// change class for special call avatar
			if (attrs.type){
				var classy = 'Call_';
				
				switch(attrs.profile){
					case 'vm.myProfile':
					case 'member':
					case 'recorder':
						// vms/confs/records --> only blue circles
						classy += 'Office';
						break;
					default:
						switch(parseInt(attrs.type)) {
							case 1:
							case 3:
								classy += 'Queue';
								break;
							case 5:
								classy += 'External';
								break;
							default:
								classy += 'Office';
								break;
						}
						
						break;
				}
				
				element.addClass(classy);
			}
			
			// group vs single
			if (attrs.profile == 4 || (profile && profile.name && profile.members)) {
				element.addClass('GroupAvatar');
				
				// find two group members to include
				var found = 0;
				var html = '';
				
				if (profile.members) {
					for (var i = 0, len = profile.members.length; i < len; i++) {
						if (profile.members[i].fullProfile) {
							html += getAvatar(profile.members[i].fullProfile);
						
							found++;						
							if (found == 2) break;
						}
					}
				}
				
				// fill in any missing avatars
				for (var i = found; i < 2; i++) {
					html += getAvatar(null);
				}
				
				element.html(html);
			}
			else {
				element.addClass('SingleAvatar');
				element.html(getAvatar(profile));
			}
			
			// set up watchers for avatars that may change
			if (widget == 'callstatus') {
				scope.$watch($parse(attrs.profile), function (newObj, oldObj) {
					if (newObj != oldObj)
						element.html(getAvatar(newObj));
				});
			}
			
			if (attrs.profile == 'me') {
				// if myself, pull data from rootscope
				settingsService.getSettings().then(function() {
					var temp = {
						xpid: $rootScope.myPid,
						fullName: $rootScope.meModel.display_name,
						icon_version: $rootScope.meModel.icon_version
					};
					
					element.html(getAvatar(temp));
				});
			}
			
			function getAvatar(profile) {
				var html = '';
				var classy = '';
				var size = attrs.size ? attrs.size : defaultSize;
				
				if (profile && profile.fullName) {
					// remember xpid so we can update src later on
					classy = ' class="' + profile.xpid + '"';
					
					// user's custom image
					if (profile.icon_version) {						
						html = '<div class="Darken"></div><img src="' + httpService.get_avatar(profile.xpid, size, size, profile.icon_version) + '" />';
					}
					// initials
					else {
						var split = profile.fullName.split(' ');
						var fName = split[0].charAt(0);
						var lName = '';
						
						if (split.length > 1)
							lName = split[split.length-1].charAt(0);
						
						html = '<div class="Initials">' + fName + lName + '</div>';
					}
				}
				// default image
				else
					html = '<div class="Darken"></div><img src="' + url + 'img/Generic-Avatar.png" />';
				
				return ('<div' + classy + ' size="' + size + '">' + html + '</div>');
			}
			
			/**
				CONTEXTUAL MENU
			*/
			
			// context menu doesn't apply to everyone, sorry
            if (!profile || !profile.xpid || widget == 'callstatus' || widget == 'drag' || widget == 'zoom')
				return;
			
			element.bind('mouseenter', function(e) {
				rect = element[0].getBoundingClientRect();
				$timeout.cancel(timer);

				if (overlay.css('display') != 'block') {
					// delay
					timer = $timeout(showOverlay, settingsService.getSetting('avatar_hover_delay')*1000);
				}
				else if (current != element) {
					// hovered over a new avatar
					showOverlay();
				}
					
				current = element;
			});
			
			element.bind('mouseleave', function(e) {
				// hide pop-pop
				if (overlay.css('display') != 'block')
					$timeout.cancel(timer);
				else if (e.relatedTarget && e.relatedTarget.id != 'ContextMenu')
					hideOverlay(500);
			});
			
			// insta-menu
			element.bind('click', function(e) {
				e.preventDefault();
				e.stopImmediatePropagation();
				
				showOverlay();
			});
			
			function showOverlay() {
				overlay.bind('mouseleave', function(e) {
					// keep open if user moves back onto avatar
					for (var i = 0, iLen = current.children().length; i < iLen; i++)  {
						if (e.relatedTarget == current.children()[i])
							return;
					}
					
					if (e.relatedTarget != current)
						hideOverlay(500);
				});
				
				overlay.bind('mouseenter', function(e) {
					$timeout.cancel(timer);
				});
						
				// send data to controller		
				
				var data = {
					obj: obj,
					widget: widget,
					context: context ? $parse(context)(scope) : null
				};
				
				$rootScope.$broadcast('contextMenu', data);
				$rootScope.contextShow = true;

				$timeout(function() {
					// position pop-pop				
					overlay.addClass('NoWrap');
					overlay.removeClass('Bump');
					
					overlay.css('display', 'block');
					overlay.css('width', 'auto');
					overlay.css('top', (rect.top + rect.height/2) + 'px');
					
					var oRect = overlay[0].getBoundingClientRect();
					
					// can't fit on screen
					if (oRect.bottom >= window.innerHeight)
						overlay.addClass('Bump');
					
					// can fit on right side
					if (oRect.width < window.innerWidth - rect.right || oRect.width > rect.left) {
						overlay.css('left', (rect.left + rect.width/2) + 'px');
						overlay.css('right', 'auto');
						
						$('#ContextMenu .Arrow').removeClass('Right').addClass('Left');
					}
					// can fit on left side
					else {
						overlay.css('right', (window.innerWidth - rect.left - rect.width/2) + 'px');
						overlay.css('left', 'auto');
						
						$('#ContextMenu .Arrow').removeClass('Left').addClass('Right');
					}
					
					// set width for logout reasons
					overlay.removeClass('NoWrap');
					overlay.css('width', (overlay[0].getBoundingClientRect().width + 2) + 'px');
			
					// button clicks
					$('#ContextMenu .Button').bind('click', function(e) {
						e.stopPropagation();
						
						// logout button shouldn't close
						if (this.className.indexOf('Logout') == -1)
							hideOverlay(0);
						else {
							var diff = window.innerHeight - oRect.top - oRect.height - 10;
							$('#ContextMenu .List').css('height', diff + 'px');
						}
					});
				}, 10, false);
			}
			
			function hideOverlay(t) {
				timer = $timeout(function() {
					overlay.css('display', 'none');
					overlay.unbind();
					
					$('#ContextMenu .Button').unbind('click');
					$rootScope.contextShow = false;
				}, t);
			}
		}
	};
}]);