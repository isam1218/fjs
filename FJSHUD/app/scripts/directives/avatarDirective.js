hudweb.directive('avatar', ['$rootScope', '$parse', '$timeout', 'SettingsService', 'HttpService', 'GroupService', function($rootScope, $parse, $timeout, settingsService, httpService, groupService) {
	var overlay = angular.element(document.getElementById('ContextMenu'));	
	var url = location.href.replace(location.hash, '');
	var timer;
	var current;
	
	// show updated avatars
	$rootScope.$on('fdpImage_synced', function(event, data) {
		if (!document.getElementById('AppLoading')) {
			for (var i = 0, len = data.length; i < len; i++) {
				$('.Avatar.' + data[i].xpid + ' img').attr('src', httpService.get_avatar(data[i].xpid, 28, 28, data[i].xef001iver));
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
			var avatarObjType = $parse(attrs.type)(scope);
			var context, widget, rect;
			if (attrs.context) {
				widget = attrs.context.split(':')[0];
				context = attrs.context.split(':')[1];
			}
			/**
				AVATAR IMAGES
			*/
			// change class for special circle avatar
			// all avatars not in dock or contact widget...
			if (attrs.type){
				var classy = 'CallAvatar CallAvatar_';
				// notifications...
				if (avatarObjType.type){
					switch(avatarObjType.type){
						case 2:
						case 5:
							// chat msg --> square avatar
							element.addClass('AvatarNormal');
							break;
						case 3:
							// Queues
							if (avatarObjType.msgType == 'q-alert-abandoned' || avatarObjType.msgType == 'q-alert-rotation'){
								// long wait/abandoned Q call --> (orange circle avatar)
								classy += 'Queue';
								element.addClass(classy);
							} else {
								// Q chat/broadcast/alert --> avatar normal [square avatar]
								element.addClass('AvatarNormal');
							}
							break;
						case 4:
							// missed call / voicemail
							if (profile && profile.displayName)
								classy += 'Office';
							else if (!profile)
								classy += 'External';
							element.addClass(classy);
							break;
					}
				} else {
					// non-notifications...
					switch(attrs.profile){
						case 'vm.myProfile':
						case 'member':
						case 'recorder':
							// vms/confs/records --> only blue circles
							classy += 'Office';
							element.addClass(classy);
							break;
						default:
							if (attrs.profile !== 'recording'){
								element.addClass('AvatarNormal');
							}
							// all else --> queue is orange circle, external is green circle, internal is blue
							if (avatarObjType == 3 || avatarObjType == 1)
								classy += 'Queue';
							else if (avatarObjType == 5)
								classy += 'External';
							else
								classy += 'Office';
							element.addClass(classy);
							break;
					}
				}
			}
			else {
				// dock and contact widget -> all square avatars
				element.addClass('AvatarNormal');
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
				loadImage(element.find('img'), profile.getAvatar(28));
			}
			else if (profile.name) {
				showGroup();
				
				for (var i = 0; i < 4; i++)
					loadImage(element.find('.GroupAvatarItem_' + i + ' img'), profile.getAvatar(i, 28));
			}
			else
				showSingle();
			
			// set up watchers for avatars that may change
			if (widget == 'context' || widget == 'callstatus') {
				scope.$watch($parse(attrs.profile), function (newObj) {
					showSingle();
					loadImage(element.find('img'), newObj ? newObj.getAvatar(28) : '');
				});
			}
			
			// also attach xpid to listen for updates
			element.addClass(profile.xpid);
			
			function showSingle() {
				element.html('<img class="AvatarImgPH default" src="' + url + 'img/Generic-Avatar-28.png" />');
			}
			
			function showGroup() {
				element.html('<div class="GroupAvatarItem GroupAvatarItem_0"><img class="GroupAvatarItemImg default" src="' + url + 'img/Generic-Avatar-28.png" /></div><div class="GroupAvatarItem GroupAvatarItem_1"><img class="GroupAvatarItemImg default" src="' + url + 'img/Generic-Avatar-28.png" /></div><div class="GroupAvatarItem GroupAvatarItem_2"><img class="GroupAvatarItemImg default" src="' + url + 'img/Generic-Avatar-28.png" /></div><div class="GroupAvatarItem GroupAvatarItem_3"><img class="GroupAvatarItemImg default" src="' + url + 'img/Generic-Avatar-28.png" /></div>');
			}
			
			function loadImage(el, url) {
				var img = new Image();
				img.src = url;
			
				// replace default image with loaded image
				angular.element(img).bind('load', function () {
					angular.element(el).attr("src", img.src);
					angular.element(this).unbind();
				});
				
				// make sure to kill event listeners
				angular.element(img).bind('error', function () {
					angular.element(this).unbind();
				});
			}
			
			/**
				CONTEXTUAL MENU
			*/
			
			// context menu doesn't apply to everyone, sorry
			if (widget) {
				// still interactable
				if (widget == 'callstatus') {
					element.append('<div class="AvatarForeground AvatarInteractable"></div>');
					
					return;
				}
				else if (widget == 'context' || widget == 'drag' || widget == 'zoom')
					return;
			}
			
			// add arrow to indicate menu
			element.append('<div class="AvatarForeground AvatarInteractable"></div>');
			
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