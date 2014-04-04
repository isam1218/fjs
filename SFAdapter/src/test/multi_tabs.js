var CHANGE_TAB_TIMEOUT = 2000;
var MASTER_ACTIVITY_TIMEOUT = 500;
document.onreadystatechange = function () {
    if (document.readyState == "complete") {
        var tabId = Math.random();
        var timeoutId = null;
        var runMaster = function() {
            masterIteration();
        };

       // console.time("writeToStorage");
        var masterIteration = function() {
            //console.timeEnd("writeToStorage");
            //console.time("writeToStorage");

            localStorage["maintab"] = tabId+"|"+Date.now();
            localStorage["Leader_" + tabId] = "1";
            document.title = "Master";
            document.body.innerHTML = "<h1>Master</h1>";
            clearTimeout(timeoutId);
            timeoutId = setTimeout(masterIteration, MASTER_ACTIVITY_TIMEOUT);
        };

     //   console.time("storage");

        var f = function(fn) {
            if (window.addEventListener){
                window.addEventListener('storage',fn);
            } else {
                window.attachEvent('storage',fn);
            }
        };

        f(function() {
            var lsvals = localStorage["maintab"].split("|");
            if(lsvals[0]!=tabId && lsvals[0] < tabId) {
                localStorage["Leader_" + tabId] = "0";
                document.title = "Slave";
                document.body.innerHTML = "<h1>Slave</h1>";
                clearTimeout(timeoutId);
                timeoutId = setTimeout(runMaster, CHANGE_TAB_TIMEOUT);
            }
        });


        if(localStorage["maintab"]) {
             var lsvals = localStorage["maintab"].split("|");
             if((Date.now() - parseInt(lsvals[1]))>CHANGE_TAB_TIMEOUT) {
                 runMaster();
             }
             else {
                 timeoutId = setTimeout(runMaster, CHANGE_TAB_TIMEOUT);
             }
        }
        else {
            runMaster();
        }

        var closeTab = function() {
            delete localStorage["Leader_" + tabId];
            window.close();
        };
        setTimeout(closeTab, getRandomInt(1000, 10000));

        function getRandomInt(min, max) {
            return Math.floor(Math.random() * (max - min + 1)) + min;
        }
    }
};


