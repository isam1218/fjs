hudweb.directive('droppable', ['HttpService', 'ConferenceService', 'SettingsService', '$parse', '$timeout', '$location', '$rootScope', function(httpService, conferenceService, settingsService, $parse, $timeout, $location, $rootScope) {
	var timeout;
	var overlay = angular.element(document.getElementById('ContextMenu'));
	var current, timer;

	// used as droppable="Type,Type,Type"
	return {
		restrict : 'A',
		link : function(scope, element, attrs) {
			if (attrs.droppable == '')
				return;

			var obj, type;
			var drops = attrs.droppable.split(',');
			var context, widget, rect;
			if (attrs.context) {
				widget = attrs.context.split(':')[0];
				context = attrs.context.split(':')[1];
			}
			
			// element can be dropped onto
			$(element).droppable({
				tolerance : 'pointer',
				greedy : true,
				over : function(event,ui) {
					var isolatedScope = angular.element(ui.draggable).data('_scope');

					// find original draggable object
					if (ui.draggable[0].attributes.dockable)
						obj = $parse(ui.draggable[0].attributes.dockable.nodeValue)(isolatedScope);
					else if (isolatedScope.gadget.data)
						obj = isolatedScope.gadget.data;
					else
						obj = null;

					// get type of object
					if (obj.firstName !== undefined)
						type = 'Contact';
					else if (obj.loggedInMembers !== undefined)
						type = 'QueueStat';
					else if (obj.roomNumber !== undefined)
						type = 'ConferenceRoom';
					else if (obj.name !== undefined)
						type = 'Group';
					else if (obj.record !== undefined
							|| obj.recorded !== undefined)
						type = 'Call';

					// check for allowed cases
					if (drops.indexOf(type) != -1
						&& (!$(this).hasClass('InnerDock') || obj.xpid != $rootScope.myPid)) {
						$(this).addClass('DroppableArea');
						$(ui.helper).removeClass('not-allowed');
					}
				},
				out : function(event, ui) {
					$(this).removeClass('DroppableArea');

					if ($('.DroppableArea').length == 0)
						$(ui.helper).addClass('not-allowed');
				},
				drop : function(event, ui) {
					$('.DroppableArea').removeClass('DroppableArea');

					// re-check basic criteria
					if (timeout || drops.indexOf(type) == -1)
						return;

					// dock new item
					if ($(this).hasClass('InnerDock') && ui.draggable[0].attributes.dockable) {
						// can't dock yourself
						if (obj.xpid != $rootScope.myPid) {
							var rect = document.getElementById('InnerDock').getBoundingClientRect();

							var data = {
								name : 'GadgetConfig__empty_Gadget' + type + '_' + obj.xpid,
								value : JSON.stringify({ 
									"contextId" : "empty", "factoryId" : "Gadget" + type,
									"entityId" : obj.xpid,
									"config" : {
										"x" : (ui.position.left - rect.left) / rect.width * 100,
										"y" : (ui.position.top - rect.top) / rect.height * 100
									},
									"index" : $rootScope.dockIndex
								})
							};

							httpService.sendAction('settings', 'update', data);
						}
					}
					// dragging and dropping to transfer modal
					else if (scope.$parent.currentCall && scope.$parent.transferComponent && type == 'Contact'){

						// cold vs warm vs toVm
						if (settingsService.getPermission('canTransferFrom')) {
							var action;
							var feed = 'mycalls';
							var params = {};

							if (element[0].className == 'IconText ToVoicemail ui-droppable'){
								// dragging to vm icon
								action = 'transferToVoicemail';
								params.mycallId = scope.currentCall.xpid;
								params.toContactId = obj.xpid;
								// if try to drag myself or try to drag the person I'm already talking to -> return out...
								if (params.toContactId == $rootScope.myPid || params.toContactId == scope.$parent.currentCall.contactId)
									return;

								httpService.sendAction(feed, action, params);
							}
							else if (element[0].className == 'IconText ColdTransfer ui-droppable'){
								// drag to cold transfer icon
								action = 'transferToContact'
								params.mycallId = scope.$parent.currentCall.xpid;
								params.toContactId = obj.xpid;
								// if try to drag myself or try to drag the person I'm already talking to -> return out...
								if (params.toContactId == $rootScope.myPid || params.toContactId == scope.$parent.currentCall.contactId)
									return;

								httpService.sendAction(feed, action, params);
							}
							else if (element[0] == 'div.IconText.WarmTransfer'){
								// drag to warm transfer icon
								// console.log('WARM TRANSFER DRAG');
								return;
							} else {
								// drag to non-icon section -> set dragged contact as the selected transfer contact in the "TO:" field
								scope.selectTransferContact(obj);
								scope.$apply();
							}
						}
						return;

					}
					// start conference via active call
					else if (scope.$parent.currentCall) {
						var currentConf = scope.$parent.currentCall.details.conferenceId;

						// already on a conference call
						if (currentConf) {
							httpService.sendAction('conferences', 'joinContact', { conferenceId : currentConf, contactId : obj.xpid });

							$location.path('/conference/' + currentConf + '/currentcall');
						}
						// new conference
						else {
							conferenceService.getConferences().then(function(data) {
								var conferences = data.conferences;
								var found = null;
								var len = conferences.length;

								// find first empty room on same server
								for ( var i = 0; i < len; i++) {
									if (conferences[i].serverNumber.indexOf($rootScope.meModel.server_id) != -1 && conferences[i].status && (!conferences[i].members || conferences[i].members.length == 0)) {
											found = conferences[i].xpid;
											break;
									}
								}

								// try again for linked server
								if (!found) {
									for ( var i = 0; i < len; i++) {
										// find first room on same server
										if (conferences[i].status && !conferences[i].members || conferences[i].members.length == 0) {
											found = conferences[i].xpid;
											break;
										}
									}
								}

								if (found) {
									// transfer existing call
									httpService.sendAction('mycalls', 'transferToConference', { mycallId : scope.$parent.currentCall.xpid, conferenceId : found });

									// add a brief timeout before adding the second user to the conference
									timeout = setTimeout(function() {
										httpService.sendAction('conferences', 'joinContact', { conferenceId : found, contactId : obj.xpid });
									}, 2000);

									$location.path('/conference/' + found + '/currentcall');
								}
							});
						}
					}
					// join conference normally
					else if (scope.conference || (scope.item && scope.item.recent_type == 'conference') || (scope.gadget && scope.gadget.name.indexOf('ConferenceRoom') != -1)) {
						var xpid = scope.conference ? scope.conference.xpid : scope.gadget ? scope.gadget.data.xpid : scope.item.xpid;

						if (type == 'Contact') {
							httpService.sendAction('conferences', 'joinContact', { conferenceId : xpid, contactId : obj.fullProfile ? obj.fullProfile.xpid : obj.xpid });
						} else {
							httpService.sendAction('mycalls', 'transferToConference', { mycallId : obj.xpid, conferenceId : xpid });

							$location.path('/conference/'+ xpid + '/currentcall');
						}
					}
					// park call
					else if (scope.gadget && scope.gadget.name.indexOf('GadgetParkedCalls') != -1) {
						httpService.sendAction('mycalls', 'transferToPark', {mycallId : obj.xpid});
					}
					// transfer call
					else {
						// check if I have isXFerFromIsEnabled personal permission...
						if (settingsService.getPermission('canTransferFrom')) {
							var feed;
							var action = 'transferToContact';
							var params = {};
							var transferToExternal = function(type, toWhom) {
								switch (type) {
								case 'mobile':
									action = 'transferToContactMobile';
									params.toContactId = toWhom;
									break;
								case 'business':
									action = 'transferTo';
									params.toNumber = toWhom;
									break;
								}
								feed = 'mycalls';
								params.mycallId = obj.xpid;
								httpService.sendAction(feed, action, params);
								return;
							};

							/* [TRANSFERRING UNANSWERED QUEUE CALLS (D&D)] */
							// checking CP and server version *(CP < cp14 or server version < 3.5.1 does not receive this functionality HUDF-1424)*
							// add new CP versions to this array...
							var possibleCpVersions = ["cp14"];
							var cpFourteen = false;
							// check for "cp14" or "fcs-stg3-cp" or "fcs-stg-cp", etc for testing environment purposes (1st three letters of cp_location propertyValue string will be 'fcs')
							var parseReturnsFcs = $rootScope.meModel.cp_location.indexOf('fcs') != -1 && $rootScope.meModel.cp_location.indexOf('fcs') == 0 ? true : false;
							
							for (var j = 0; j < possibleCpVersions.length; j++){
								if ($rootScope.meModel.cp_location == possibleCpVersions[j]){
									cpFourteen = true;
									break;
								}
							}
							if (parseReturnsFcs){
								cpFourteen = true;
							}
							
							// var cpFourteen = $rootScope.meModel.cp_location == "cp14" ? true : false;
							var serverVersionCloud;
							var serverVersionSplit = $rootScope.meModel.server_version.split('.');
							var sv1 = serverVersionSplit[0];
							var sv2 = serverVersionSplit[1];
							var sv3 = serverVersionSplit[2];
							var sv4 = serverVersionSplit[3]
							// if (<3) or (<= 3-3.5) or (3.5.0-3.5.1)
							if ( (parseInt(sv1) < 3) || (parseInt(sv1) === 3 && parseInt(sv2) < 5) || (parseInt(sv1) === 3 && parseInt(sv2) === 5 && parseInt(sv3) < 1) )
								serverVersionCloud = false;
							else
								serverVersionCloud = true;

							// incoming queue calls have the 'taken' property on the obj and it will have value 'false' if incoming. They do not have type property...
							// other calls have no 'taken' property on the obj
							// so checking to see if it's an incoming, unanswered q call, *and also if user meets the server and CP requirements (see HUDF-1424)*
							if (obj.taken != null && obj.taken === false && serverVersionCloud && cpFourteen) {
								feed = 'queue_call';
								params.queueCallId = obj.xpid;
								// if drag to leftbar...(scope has contact property on it), else if (item for recents), else dragging to dock...
								if (scope.contact)
									params.contactId = scope.contact.xpid;
								else if (scope.item)
									params.contactId = scope.item.xpid;
								else if (scope.gadget)
									params.contactId = scope.gadget.data.xpid;
								// else drag to dock
	
								httpService.sendAction(feed, action, params);
								return;
							}

							/* [TRANSFERRING TO EXTERNAL CONTACT (D&D)] */
							// if drag to dock...
							if (scope.gadget && !scope.gadget.data.primaryExtension) {
								if (scope.gadget.data.phoneMobile && scope.gadget.data.phoneBusiness) {
									enterElement(scope.gadget.data.phoneBusiness, scope.gadget.data.phoneMobile, scope.gadget.data.xpid);
								} else if (scope.gadget.data.phoneMobile) {
									// transfer to mobile number
									transferToExternal('mobile',scope.gadget.data.xpid);
									return;
								} else if (scope.gadget.data.phoneBusiness) {
									// transfer to business number
									transferToExternal('business',scope.gadget.data.phoneBusiness);
									return;
								}
								// else if drag to contact panel...
							} else if (scope.contact && !scope.contact.primaryExtension) {
								if (scope.contact.phoneMobile && scope.contact.phoneBusiness) {
									enterElement(scope.contact.phoneBusiness, scope.contact.phoneMobile, scope.contact.xpid);
								} else if (scope.contact.phoneMobile) {
									// mobile
									transferToExternal('mobile',scope.contact.xpid);
									return;
								} else if (scope.contact.phoneBusiness) {
									// business
									transferToExternal('business',scope.contact.phoneBusiness);
									return;
								}
								// else if drag to recents...
							} else if (scope.item && !scope.item.primaryExtension) {
								if (scope.item.phoneMobile && scope.item.phoneBusiness) {
									enterElement(scope.item.phoneBusiness, scope.item.phoneMobile, scope.item.xpid);
								} else if (scope.item.phoneMobile) {
									// mobile
									transferToExternal('mobile',scope.item.xpid);
									return;
								} else if (scope.item.phoneBusiness) {
									// business
									transferToExternal('business',scope.item.phoneBusiness);
									return;
								}
							}

							/* [TRANSFERRING TO INTERNAL CONTACT (D&D)] */
							feed = 'calls';
							// queue call vs my call vs other's call
							if (obj.agentContactId)
								params.fromContactId = obj.agentContactId;
							else if (obj.sipId)
								params.fromContactId = $rootScope.myPid;
							else
								params.fromContactId = obj.xpid;

							// contact id comes from multiple places
							if (scope.contact)
								params.toContactId = scope.contact.xpid;
							else if (scope.member)
								params.toContactId = scope.member.contactId;
							else if (scope.gadget)
								params.toContactId = scope.gadget.data.xpid;
							else if (scope.item)
								params.toContactId = scope.item.xpid;

							httpService.sendAction(feed, action, params);
						}
					}//end transfer call

					// prevent sibling overlap
					timeout = setTimeout(function() {
						timeout = null;
					}, 100);

					function enterElement(business, mobile, externalXpid){
						var avatar = element[0].getElementsByClassName('Avatar')[0];
						rect = avatar.getBoundingClientRect();
						$timeout.cancel(timer);

						if (overlay.css('display') != 'block') {
							// delay
							timer = $timeout(showOverlay(business, mobile, externalXpid), settingsService.getSetting('avatar_hover_delay')*1000);
						}
						else if (current != element) {
							// hovered over a new avatar
							showOverlay();
						}

						current = element;
					};

					function showOverlay(business, mobile, externalXpid) {
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

						obj.type = 'transfer';
						obj.business = business;
						obj.mobile = mobile;
						obj.externalXpid = externalXpid;
						obj.callId = obj.xpid;

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
			});
		}
	};
} ]);