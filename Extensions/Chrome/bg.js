			chrome.extension.onMessage.addListener(function(request, sender, sendResponse) {
				switch(request.action) {
					case "showTab": 
						chrome.windows.getAll(null, function(windows){
						for(var i=0; i<windows.length; i++) {
						var window = windows[i];
						chrome.tabs.getAllInWindow(window.id, function(tabs){
							for(var i=0; i<tabs.length; i++) {
								var tab = tabs[i];
								if(getPath(tab.url) == getPath(request.url)) {
									chrome.windows.update(window.id, {focused :true});
									chrome.tabs.update(tab.id, {selected: true});
									return "ok";
								}
							}
						});
					}
				});
					break;
				}
			});
			
			var getPath = function(url) {
					return url.substring(0,url.indexOf("#")+37);
			};


			