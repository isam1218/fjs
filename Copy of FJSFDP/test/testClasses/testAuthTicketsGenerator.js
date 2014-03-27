namespace("fjs.test")
fjs.test.Tickets = {
    get: function() {
        var ticket = "validTicket";
        if(fjs.utils.Browser.isChrome()) {
            ticket+="1";
        }
        if(fjs.utils.Browser.isFirefox()) {
            ticket+="2";
        }
        if(fjs.utils.Browser.isIE()) {
            ticket+="3";
        }
        return ticket;
    }
};