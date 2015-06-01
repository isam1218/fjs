hudweb.service('NtpService', function() { 
/*
NTP.js http://jehiah.cz/a/ntp-for-javascript
copyright Jehiah Czebotar jehiah@gmail.com
licensed under http://unlicense.org/ please modify as needed

to use configure serverUrl to an endpoint that when queried
    GET serverUrl + '?t=' + timestamp_in_miliseconds

returns 
    time_offset_in_miliseconds + ':' + argument_t

*/
  var cookieShelfLife = 7; //7 days
  var requiredResponses = 2;
  var serverTimes = new Array;
  var serverUrl = "/path/to/getTime";
  var resyncTime = 10; // minutes

  // ***this.sync ONLY WORKS WHEN PROTOTYPE.JS IS BEING USED, PER NTP.JS DOCS***
  this.sync = function(){
      // if the time was set within the last x minutes; ignore this set request; time was synce recently enough
    var offset = this.getCookie("NTPClockOffset");
    if (offset){try{
    var t = offset.split("|")[1];   
    var d = this.fixTime()-parseInt(t,10);
    if (d < (1000 * 60 * this.resyncTime)){return false;} // x minutes; return==skip
      }catch(e){}
      }
      
      serverTimes = new Array;
      this.getServerTime();
  };

  this.getNow = function(){
    var date = new Date();
    return date.getTime();
    return (date.getTime() + (date.getTimezoneOffset() * 60000));
  };

  this.parseServerResponse = function(data){
    var offset = parseInt(data.responseText.split(":")[0]);
    var origtime = parseInt(data.responseText.split(":")[1]);     
    var delay = ((this.getNow() - origtime) / 2);
    offset = offset - delay;
    serverTimes.push(offset);
   
   // if we have enough responces set cookie
    if (serverTimes.length >= requiredResponses){
     // build average
      var average = 0;
      var i=0;
      for (i=0; i < serverTimes.length;i++){
        average += serverTimes[i];
      }
      average = Math.round(average / i);
      this.setCookie("NTPClockOffset",average); // set the new offset
      this.setCookie("NTPClockOffset",average+'|'+this.fixTime()); // save the timestamp that we are setting it
    } else {
      this.getServerTime();
    }
  };

  this.getServerTime = function(){
    try{
      var req = new Ajax.Request(serverUrl,{
        onSuccess : this.parseServerResponse,
        method : "get",
        parameters : "t=" + this.getNow()
          });
      }
    catch(e){
      return false;
    //prototype.js not available
    }
  };

  this.setCookie = function(aCookieName, aCookieValue){
    var date = new Date();
    date.setTime(date.getTime() + (cookieShelfLife * 24*60*60*1000));
    var expires = '; expires=' + date.toGMTString();
    document.cookie = aCookieName + '=' + aCookieValue + expires + '; path=/';
  };

  this.getCookie = function(aCookieName){
    var crumbs = document.cookie.split('; ');
    for (var i = 0; i < crumbs.length; i++){
      var crumb = crumbs[i].split('=');
      if (crumb[0] == aCookieName && crumb[1] != null){
        return crumb[1];
      }
    }
    return false;
  };

  this.fixTime = function(timeStamp){
    if(!timeStamp){
      timeStamp = this.getNow();
    }
    var offset = this.getCookie("NTPClockOffset");
    try{
      if (!offset){
        offset = 0;
      } else {
        offset = offset.split("|")[0];
      }
      if (isNaN(parseInt(offset,10))){
        return timeStamp;
      }
      return timeStamp + parseInt(offset,10);
    } catch(e){
      return timeStamp;
    }
  };

});