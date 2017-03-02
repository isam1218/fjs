Required: node.js, bower, less compiler

Frameworks/libraries: angular, jquery, moment, bootstrap, google analytics

---

###DEVELOPMENT

All front-end files are located in the FJSHUD folder. The only useful file outside of this is Tools/install.sh, which can be used for initial setup to quickly install the dependencies. You WILL need to install bower globally for this to work. Bower (third-party library) dependencies are specified in app/bower.json.

Another tool you'll need is a LESS compiler. Koala is a good choice. You'll have to keep it running as you develop, since nothing in the code auto-compiles CSS for you. Once everything is set up, run "node server.js" from within the FJSHUD folder to make "http://localhost:9900/app/" available. Yes, the "/app/" is required.

In app/properties.js, change the {{ }} variables to point to real URLs. The httpService.js file will use the auth URL to redirect the user to login and then initialize the web worker. The worker uses the server URL to establish the FDP long-polling sync. The worker stores the "state" of the app, and the httpService takes that state and broadcasts it to all other Angular controllers, services, and directives.

FDP data is returned to the front-end in "feeds." Each feed represents a particular data type, like voicemails or avatar images. Often, however, feeds have to be merged together to make any sense. For instance, there is a separate feed for HUD status updates (contactstatus), and we use the "xpid" property to match each status to the actual contact on another feed.

###DISTRIBUTION

The build process is based on grunt. While there are many tasks registered in the Gruntfile, the only important one is "build-dist."

###DEBUGGING

Check the network requests to see if the "sync" API is returning the correct data. It's not safe to rely on console.log(), because the data will most likely have been tampered with by then.

A lot of client data is stored in localStorage, and localStorage isn't cleared unless you wipe your browser's entire history. If you suspect cookies are at the root of an issue, just use localStorage.clear() from the console.