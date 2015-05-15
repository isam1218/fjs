hudweb.directive('avatar', ['$rootScope', '$parse', '$timeout', function($rootScope, $parse, $timeout) {
	var url = location.href.replace(location.hash, '');
	var timer;
	var current;
	
	// used as <avatar profile="member" context="widget:parent" type="{{callType}}"></avatar>
	// where context and type are optional
	return {
		restrict: 'E',
		replace: true,
		template: '<div class="Avatar"></div>',
		link: function(scope, element, attrs) {
			var obj = $parse(attrs.profile)(scope);
			var profile = obj && obj.fullProfile ? obj.fullProfile : obj;
			var context, widget;
			
			if (attrs.context) {
				widget = attrs.context.split(':')[0];
				context = attrs.context.split(':')[1];
			}
			
			/**
				AVATAR IMAGES
			*/
			
			// change class for special circle avatar
			if (attrs.type) {
				var classy = 'CallAvatar CallAvatar_';
				
				if (attrs.type == 3)
					classy += 'Queue';
				else if ((profile && profile.displayName) || attrs.type == 4 || attrs.type == 0)
					classy += 'Office';
				else
					classy += 'External';
				
				element.addClass(classy);
			}
			else
				element.addClass('AvatarNormal');
			
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
			if (widget == 'context') {
				scope.$watch($parse(attrs.profile), function (newObj) {
					showSingle();
					loadImage(element.find('img'), newObj.getAvatar(28));
				});
			}
			
			function showSingle() {
				element.html('<img class="AvatarImgPH" src="' + url + 'img/Generic-Avatar-28.png" />');
			}
			
			function showGroup() {
				element.html('<div class="GroupAvatarItem GroupAvatarItem_0"><img class="GroupAvatarItemImg" src="' + url + 'img/Generic-Avatar-28.png" /></div><div class="GroupAvatarItem GroupAvatarItem_1"><img class="GroupAvatarItemImg" src="' + url + 'img/Generic-Avatar-28.png" /></div><div class="GroupAvatarItem GroupAvatarItem_2"><img class="GroupAvatarItemImg" src="' + url + 'img/Generic-Avatar-28.png" /></div><div class="GroupAvatarItem GroupAvatarItem_3"><img class="GroupAvatarItemImg" src="' + url + 'img/Generic-Avatar-28.png" /></div>');
			}
			
			function loadImage(el, url) {
				var img = new Image();
				img.src = url;
			
				// replace default image with loaded image
				angular.element(img).bind('load', function () {
					angular.element(el).attr("src", img.src);
				});
			}
			
			/**
				CONTEXTUAL MENU
			*/
			
			// context menu doesn't apply to everyone, sorry
			if (profile.xpid == $rootScope.myPid)
				return;
			else if (widget) {
				// still interactable
				if (widget == 'callstatus') {
					element.append('<div class="AvatarForeground AvatarInteractable"></div>');
					
					return;
				}
				else if (widget == 'context' || widget == 'zoom')
					return;
			}
			
			// add arrow to indicate menu
			element.append('<div class="AvatarForeground AvatarInteractable"></div>');
			
			// set up overlay
			var overlay = angular.element(document.getElementById('ContextMenu'));
			var arrow = angular.element(overlay[0].getElementsByClassName('Arrow')[0]);
			var buttons = overlay[0].getElementsByClassName('Button');
			var rect;
			
			element.bind('mouseenter', function(e) {
				rect = element[0].getBoundingClientRect();
				$timeout.cancel(timer);
				
				if (overlay.css('display') != 'block') {
					// delay
					timer = $timeout(function() {
						showOverlay();
				
						overlay.bind('mouseleave', function(e) {							
							// keep open if user moves back onto avatar
							for (i = 0; i < element.children().length; i++)  {
								if (e.relatedTarget == element.children()[i])
									return;
							}
							
							if (e.relatedTarget != element)
								hideOverlay(500);
						});
						
						overlay.bind('mouseenter', function(e) {
							$timeout.cancel(timer);
						});
					}, 500);
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
			
			function showOverlay() {
				// send data to controller		
				var data = {
					obj: obj,
					widget: widget,
					context: context ? $parse(context)(scope) : null
				};
				
				$rootScope.$broadcast('contextMenu', data);
				
				$timeout(function() {
					// position pop-pop
					overlay.css('left', (rect.left + rect.width/2) + 'px');
					overlay.css('top', (rect.top + rect.height/2) + 'px');
					overlay.css('display', 'block');
					overlay.css('width', 'auto');
					
					// switch sides
					var oRect = overlay[0].getBoundingClientRect();
					
					if (rect.left + rect.width/2 + oRect.width >= window.innerWidth) {
						arrow.removeClass('Left').addClass('Right');
						overlay.css('left', (rect.left - oRect.width) + 'px');
					}
					else
						arrow.removeClass('Right').addClass('Left');
					
					// set width for logout reasons
					overlay.css('width', oRect.width + 'px');
			
					// button clicks
					angular.element(buttons).bind('click', function(e) {
						e.stopPropagation();
						
						// logout button shouldn't close
						if (this.className.indexOf('Logout') == -1)
							hideOverlay(0);
						else {
							var diff = window.innerHeight - oRect.top - oRect.height - 10;
							$('#ContextMenu .List').css('height', diff + 'px');
						}
					});
				}, 10);
			}
			
			function hideOverlay(t) {
				timer = $timeout(function() {
					overlay.css('display', 'none');
					overlay.unbind();
				}, t);
			}
		}
	};
}]);