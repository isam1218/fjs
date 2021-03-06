hudweb.directive('resizeHeight', ['$interval', function($interval){
	
    return {
		restrict: 'A',
		link: function(scope, element, attrs) {					
			var checkIfLoaded, docLoaded = false;
			
			function updateZoomWidgetHeight(element) {
				var totalElHeights = $('.WidgetZoomBody').height() - ($('.ZoomWidgetSection.right').height() + $(".WidgetFont").height() + 60);
			    var ttlPctUsed = Math.round((totalElHeights / $('.WidgetZoomBody').height()) * 100);
			    $(element).css("max-height", ttlPctUsed +"%");
			}
			
			function updateMeWidgetHeight(element) {
				//Calls section
				var recent_call_height, recent_call_pct_height;
				var widget = $(element).closest('.WidgetMe');
				var widget_header = $(widget).find('.WidgetHeader');
				var widget_body = $(element).closest('.WidgetBody');
				var call_block = $(widget_body).find('.call-block');				
				var recent_call_section = $(call_block).find('.RecentCallSection');
				var nav_agent = navigator.userAgent;
	        	var browser = nav_agent.match(/(chrome|safari|firefox|msie)/i);
	        	//if not found, default to IE mode
	        	browser = browser && browser[0] ? browser[0] : "MSIE";
	        	
	        	//widget height
    			var widgetHeight = $(widget).outerHeight();
    			//widget header height
    			var headerHeight = $(widget_header).outerHeight();
    			//widget body height
    			var widgetBodyHeight = widgetHeight - headerHeight;    	
    			//sections height				
				var new_section_height = Math.round((widgetBodyHeight / 2));
				var new_section_height_pct = (new_section_height / widgetHeight) * 100;
				//recent call section height
				var recent_call_height = new_section_height - $(element).outerHeight();
				var recent_call_height_pct = (recent_call_height  / widgetHeight) * 100;	
				//recent call log height
				var recent_call_log_height = recent_call_height - ($(recent_call_section).find('.WidgetSectionTitle.meTitle').outerHeight() + $(recent_call_section).find('.RecentCallColumnHeaders').outerHeight() + $(recent_call_section).find('.NoRecentCalls').outerHeight() + 4);	
				var recent_call_log__height_pct =  ((recent_call_log_height / recent_call_height) * 100);						
    			
				//set the heights if the 'new call' section is showing
				if($(element).is(':visible') &&  $(element).hasClass('NewCall'))
				{
					$(call_block).css('height', new_section_height + "px");	        			        			
					//new call height
        			var new_call_height = $(call_block).find('.NewCall').outerHeight();
        			//recent call section height
					var recent_call_height = new_section_height;// - new_call_height - 20; //we need to account for the padding
					//recent call log height
					var recent_call_log_height = recent_call_height - new_call_height - ($(recent_call_section).find('.WidgetSectionTitle.meTitle').outerHeight() + $(recent_call_section).find('.RecentCallColumnHeaders').outerHeight());
					var recent_call_log__height_pct =  ((recent_call_log_height / recent_call_height) * 100);
					//recent call log height       
					var recentCallLogs = $(call_block).find('.RecentCallLogs');
					$(call_block).find('.RecentCallSection').removeAttr('style');
					$(recentCallLogs).removeAttr('style');
					$(call_block).find('.RecentCallLogs').css('height', (recent_call_log__height_pct) +'%');
														
					//reference holder height
					var pref_holder = $(widget_body).find('.Preferences-Holder');														
					//reference list height													
					$(pref_holder).css('height', new_section_height + "px").css('clear', 'both');
				
					//reference list height					
					var pref_height = new_section_height - ($(pref_holder).find('.WidgetSectionTitle').outerHeight() + $(pref_holder).find('.WidgetTabBar').outerHeight() - 70);// + 20
					var pref_holder_height = new_section_height + 15;
					
					//reference list height					
					var pref_height_pct = (pref_height / pref_holder_height) * 100;
					//reference list height	
					$(pref_holder).find('.SettingsPanel.DialogContentMainBlock_List').css('height', pref_height_pct +'%');
					if(browser == "MSIE")
						$(pref_holder).find('.SettingsPanel.DialogContentMainBlock_List').css('height', '100%');
				}
				else{	
				
					if((browser != "Firefox"))
		        	{ 										
							//widget height					
							$(widget).css('height', '100%');
							$(widget_body).css('height', '100%');
		        			var widgetHeight = $(widget).outerHeight();
		        			//widget header height
		        			var headerHeight = $(widget_header).outerHeight();
		        			//widget body height
		        			var widgetBodyHeight = widgetHeight - headerHeight;
		        			//controllers height
		        			var controllersHeight = $(call_block).find('.CurrentCall .WidgetSectionTitle').outerHeight() + $(call_block).find('.CurrentCall .LeftSide').outerHeight();
		        			//recent call section height
		        			var RecentCallHeight = (widgetBodyHeight - controllersHeight - 20);
		        			        			
		        			$(call_block).css('height', "100%");	        			
		        			var RecentCallHeightPct = ((RecentCallHeight / widgetBodyHeight) * 100) - 11;	 
		        			if(browser == 'MSIE')
		        				RecentCallHeightPct = ((RecentCallHeight / widgetBodyHeight) * 100) + 1;
		        			$(call_block).find('.RecentCallSection').css('height', RecentCallHeightPct + "%");//63%	        			
		        			//recent call log height
							var recent_call_log_height = RecentCallHeight - ($(recent_call_section).find('.WidgetSectionTitle.meTitle').outerHeight() + $(recent_call_section).find('.RecentCallColumnHeaders').outerHeight());	// + 18							    			
			    			
							var recent_call_log__height_pct =  ((recent_call_log_height / RecentCallHeight) * 100); // 88%
			        		//recent call log height	   
							$(call_block).find('.RecentCallLogs').css('position', 'absolute').css('top', '64px');
							$(call_block).find('.RecentCallLogs').css('height', recent_call_log__height_pct +'%');																							
						
		        	}else{	        		
		        			
		        			//controllers height
		        			var controllersHeight = $(element).outerHeight();
		        			//recent call section height
		        			var RecentCallHeight = widgetBodyHeight - controllersHeight;
		        			
		        			var section_height_pct = (widgetBodyHeight / widgetHeight) * 100;	        			
		        			$(call_block).css('height', section_height_pct + "%");	        			
		        			var RecentCallHeightPct = (RecentCallHeight / widgetHeight) * 100;	        				        			
		        			
		        			$(call_block).find('.RecentCallSection').css('height', RecentCallHeightPct + "%");        				        									
		        			//recent call log height
							var recent_call_log_height = RecentCallHeight - ($(recent_call_section).find('.WidgetSectionTitle.meTitle').outerHeight() + $(recent_call_section).find('.RecentCallColumnHeaders').outerHeight());
							var recent_call_log__height_pct =  ((recent_call_log_height / RecentCallHeight) * 100); 
							//recent call log height	        		
							$(call_block).find('.RecentCallLogs').css('height', recent_call_log__height_pct +'%');	        		
		          }	
			  }
			}
			
			function checkWidgetLoaded(){
				if($('.Preferences-Holder .SettingsPanel.DialogContentMainBlock_List > div div').length > 0)
				{
					updateMeWidgetHeight(element);
					docLoaded = true;
					$interval.cancel(checkIfLoaded);
				}	
			}
	       
			//video collaboration
			if($(element).hasClass('WidgetZoomBody'))
			{	
				updateZoomWidgetHeight(element);
			}
			//Me widget			
			if($(element).hasClass('NewCall') && !docLoaded)
			{	
				
				checkIfLoaded = $interval(checkWidgetLoaded, 100, 0, false);   			 			    					
			}
			if($(element).hasClass('CurrentCall'))
			{
				updateMeWidgetHeight(element);
			}	
			
			//resizes the added contacts div 
			scope.$on('watchWindowResize::resize', function( event, data ) {
				docLoaded = false;
				//video collaboration
				if($(element).hasClass('WidgetZoomBody'))
				{
					updateZoomWidgetHeight(element);
				}
				
				//Me widget			
				if($(element).hasClass('NewCall'))
				{					
					checkIfLoaded = $interval(checkWidgetLoaded, 100, 0, false);  			
				}
				if($(element).hasClass('CurrentCall'))
				{
					updateMeWidgetHeight(element);
				}
		    });
		}
    };  
}]);