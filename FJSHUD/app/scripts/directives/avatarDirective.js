hudweb.directive('avatar', ['$rootScope', '$parse', '$timeout', 'SettingsService', 'HttpService', 'GroupService', function($rootScope, $parse, $timeout, settingsService, httpService, groupService) {
	var overlay = angular.element(document.getElementById('ContextMenu'));	
	var url = location.href.replace(location.hash, '');
	var timer;
	var current;
	
	// show updated avatars
	$rootScope.$on('fdpImage_synced', function(event, data) {
		if (!document.getElementById('AppLoading')) {
			for (var i = 0, len = data.length; i < len; i++) {
				$('.Avatar img.' + data[i].xpid).attr('src', httpService.get_avatar(data[i].xpid, 28, 28, data[i].xef001iver));
			}
		}
	});
	
	// used as <avatar profile="member" context="widget:parent" type="{{callType}}"></avatar> where context and type are optional
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

			// not a valid object, but still show an avatar
			if (!profile || !profile.xpid) {
				if (attrs.profile && attrs.profile == 4)
					showGroup();
				else
					showSingle();
				
				return;
			}
			// single vs group
			else if (profile.firstName) {
				showSingle();
				
				if (profile.icon_version)
					loadImage(element.find('img'), profile);
			}
			else if (profile.name && profile.members) {
				showGroup();
				
				// find two members with avatars
				var found = 0;
				
				for (var i = 0, len = profile.members.length; i < len; i++) {
					if (profile.members[i].fullProfile && profile.members[i].fullProfile.icon_version) {
						loadImage(angular.element(element.find('img')[found]), profile.members[i].fullProfile);
						found++;
						
						if (found == 2)
							break;
					}
				}
			}
			else
				showSingle();
			
			// set up watchers for avatars that may change
			if (widget == 'callstatus') {
				scope.$watch($parse(attrs.profile), function (newObj) {
					showSingle();
					
					if (newObj && newObj.xpid)
						loadImage(element.find('img'), newObj);
				});
			}
			
			function showSingle() {
				element.addClass('SingleAvatar');
				element.html('<div></div><img src="' + url + 'img/Generic-Avatar-28.png" />');
			}
			
			function showGroup() {
				element.addClass('GroupAvatar');
				element.html('<div><div></div><img src="' + url + 'img/Generic-Avatar-28.png" /></div><div><div></div><img src="' + url + 'img/Generic-Avatar-28.png" /></div>');
			}
			
			function loadImage(el, profile) {
				var img = new Image();
				img.src = profile.getAvatar(28);
				
				// also attach xpid to listen for updates
				el.addClass(profile.xpid);

				// replace default image with loaded image and make sure to kill event listeners
				img.onload = function(){
					el.attr("src", img.src);
					img.onload = null;
					img.onerror = null;
				};

				img.onerror = function(){
					img.onload = null;
					img.onerror = null;
				};
			}
			
			/**
				CONTEXTUAL MENU
			*/
			
			// context menu doesn't apply to everyone, sorry
			if (widget) {
                if (widget == 'callstatus' || widget == 'drag' || widget == 'zoom')
					return;
			}
			
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