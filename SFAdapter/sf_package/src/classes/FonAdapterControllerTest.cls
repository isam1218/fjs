@isTest
public class FonAdapterControllerTest {
   final static String ADM_LOGIN = 'admin16975';
   final static String ADM_PASSWORD = 'DC8104CC24A0565B19188638E428ADAE16D2D19FE9E0FB7F9A384709E8B2';
   final static String HUD_LOGIN = 'test hud login';
   final static String SERVER_URL = 'https://huc-dev.fonality.com:8082/';
   final static String SERVER_URL_WITHOUT_SLASH = 'https://huc-dev.fonality.com:8082';
   final static String COMMENTS_FIELD = 'Test';
   final static String COMMENTS_FIELD_2 = 'Test2';
   final static String SERVLET_NAME = '/accounts/token';
    
   static testmethod void validateLogin() {
        FonAdapterController controller = new FonAdapterController();
        System.assertEquals(null, controller.login()); 
        
        FonAdapterController controller1 = new FonAdapterController();
        controller1.serverURL = SERVER_URL;
        controller1.username = ADM_LOGIN;
        System.assertEquals(null, controller1.login()); 
        
        FonAdapterController controller2 = new FonAdapterController();
        controller2.serverURL = 'http';
        controller2.password = 'test&';
        controller2.username = ADM_LOGIN;
        System.assertEquals(null, controller2.login()); 
        
        FonAdapterController controller3 = new FonAdapterController();
        final HttpRequest req = controller3.buildWebServiceRequest();
        System.assertEquals(null, req);  
        HttpResponse res = new HttpResponse();
        res.setBody('token=token');
        controller3.handleWebServiceResponse(null);
        controller3.handleWebServiceResponse(res); 
       
        FonAdapterController controller4 = new FonAdapterController();
        controller4.serverURL = SERVER_URL;
        controller4.username = ADM_LOGIN;
        controller4.password = ADM_PASSWORD;
        final HttpRequest req4 = controller4.buildWebServiceRequest();
        System.assertEquals(SERVER_URL_WITHOUT_SLASH + SERVLET_NAME, req4.getEndpoint());  
        HttpResponse res4 = new HttpResponse();
        res4.setBody('token=token');
        controller4.handleWebServiceResponse(null);
        controller4.handleWebServiceResponse(res4); 
       
        FonAdapterController controller5 = new FonAdapterController();
        controller5.serverURL = SERVER_URL_WITHOUT_SLASH;
        controller5.username = ADM_LOGIN;
        controller5.password = ADM_PASSWORD;
        final HttpRequest req5 = controller5.buildWebServiceRequest();
        System.assertEquals(SERVER_URL_WITHOUT_SLASH + SERVLET_NAME, req5.getEndpoint());  
        HttpResponse res5 = new HttpResponse();
        res5.setBody('token=token');
        controller5.handleWebServiceResponse(null);
        controller5.handleWebServiceResponse(res5); 
    }
    
    static testmethod void validateSetToken() {
        AdminCredentials__c server = new AdminCredentials__c();
        server.Login__c = ADM_LOGIN + '1';
        server.Token__c = ADM_PASSWORD + '1'; 
        server.ServerURL__c = SERVER_URL + '1'; 
        insert server; 
        
        FonAdapterController controller = new FonAdapterController();
        controller.serverURL = SERVER_URL;
        controller.username = ADM_LOGIN;
        controller.setToken(ADM_PASSWORD);
        
        List<AdminCredentials__c> adm = [SELECT Login__c, Token__c, ServerURL__c FROM AdminCredentials__c];
        System.assertEquals(1, adm.size());
        System.assertEquals(ADM_LOGIN, adm[0].Login__c);
        System.assertEquals(ADM_PASSWORD, adm[0].Token__c); 
        System.assertEquals(SERVER_URL, adm[0].ServerURL__c);  
        
        FonAdapterController controller1 = new FonAdapterController();
        controller1.serverURL = SERVER_URL;
        controller1.setToken(ADM_PASSWORD);
    }
    
   static testmethod void validateUpload() {
        final User usr = createTestUser();
        HudAccount__c user0 = new HudAccount__c();
        user0.UserId__c = usr.id;
        user0.UserHudLogin__c = HUD_LOGIN; 
        insert user0;
       
        FonAdapterController controller = new FonAdapterController();
        controller.contentFile = Blob.valueOf(usr.id +',' + HUD_LOGIN);
        controller.upload();
        
        HudAccount__c account = [SELECT UserHudLogin__c, UserId__c FROM HudAccount__c WHERE UserId__c =: usr.id];
        System.assertEquals(HUD_LOGIN, account.UserHudLogin__c);
        
        System.assertEquals(1, controller.getuploadedAccounts().size());
        HudAccount__c uloadAccount = controller.getuploadedAccounts()[0];
        System.assertEquals(account.UserHudLogin__c, uloadAccount.UserHudLogin__c);
        System.assertEquals(HUD_LOGIN, uloadAccount.UserHudLogin__c);
        System.assertEquals(account.UserId__c, uloadAccount.UserId__c);
           
        FonAdapterController controller4 = new FonAdapterController();
        controller4.contentFile = Blob.valueOf('\n');
        System.assertEquals(null, controller4.upload()); 
        
        FonAdapterController controller3 = new FonAdapterController();
        controller3.contentFile = Blob.valueOf('');
        System.assertEquals(null, controller3.upload());
       
        FonAdapterController controller5 = new FonAdapterController();
        controller5.contentFile = Blob.valueOf(usr.id +',');
        System.assertEquals(null, controller5.upload());
       
        FonAdapterController controller6 = new FonAdapterController();
        controller6.contentFile = null;
        System.assertEquals(null, controller6.upload());
       
        FonAdapterController controller7 = new FonAdapterController();
        controller7.contentFile = Blob.valueOf('2242' +',' + 'sldkgjdflkj');
        System.assertEquals(null, controller7.upload());
    }
    
    static testmethod void getuploadedAccounts() {
        FonAdapterController controller = new FonAdapterController();
        System.assertEquals(null, controller.getuploadedAccounts());  
        
        HudAccount__c user = new HudAccount__c();
        user.UserId__c = createTestUser().id;
        user.UserHudLogin__c = HUD_LOGIN; 
        insert user;
        System.assertEquals(1, controller.getuploadedAccounts().size());   
    }
    
    static testmethod void getuploadedServer() {
        FonAdapterController controller = new FonAdapterController();
        System.assertEquals(null, controller.getuploadedServer());  
        
        AdminCredentials__c server = new AdminCredentials__c();
        server.Login__c = ADM_LOGIN;
        server.Token__c = ADM_PASSWORD; 
        server.ServerURL__c = SERVER_URL; 
        server.CommentsLabel__c = COMMENTS_FIELD;  
        insert server;
        System.assertEquals(server , controller.getuploadedServer());   
    }
    
    static testmethod void applyLabel() {
        FonAdapterController controller = new FonAdapterController();
        System.assertEquals(null, controller.applyLabel());  
        AdminCredentials__c server = new AdminCredentials__c();
        server.Login__c = ADM_LOGIN;
        server.Token__c = ADM_PASSWORD; 
        server.ServerURL__c = SERVER_URL; 
        server.CommentsLabel__c = COMMENTS_FIELD;  
        insert server;
        controller.label = COMMENTS_FIELD_2;
        controller.applyLabel();
        System.assertEquals(COMMENTS_FIELD_2, controller.getuploadedServer().CommentsLabel__c);   
    }
    
     static testmethod void removeAccount() {
        FonAdapterController controller = new FonAdapterController();
   		HudAccount__c user = new HudAccount__c();
        user.UserId__c = createTestUser().id;
        user.UserHudLogin__c = HUD_LOGIN; 
        insert user;
      	controller.userId = user.id;       
        controller.removeAccount();
    }
    
    private static User createTestUser() {
        Profile p = [SELECT Id FROM Profile WHERE Name='Standard User']; 
        User u = new User(Alias = 'standt', Email='user@testorg.com', 
        EmailEncodingKey='UTF-8', LastName='Testing', LanguageLocaleKey='en_US', 
        LocaleSidKey='en_US', ProfileId = p.Id, 
        TimeZoneSidKey='America/Los_Angeles', UserName='user@testorg.com');
        insert u;
        return u;
    }
    
    static testmethod void getItems() {
        FonAdapterController controller = new FonAdapterController();
   		List<SelectOption> options = controller.getItems();
        System.assert(options.size() > 0);
    }
}