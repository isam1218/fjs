@isTest
public class FonLoginTest{
    private final static String ADM_LOGIN = 'Test login';
    private final static String ADM_PASSWRD = 'Test password';
    private final static String SERVER_URL = 'http://test.com/test.html';
    private final static String USER_HUD_LOGIN = 'Test hud login';
    private final static String COMMENTS_FIELD = 'TestField';
    
    public class Info {
        String admLogin;
        String admPassword;
        String serverURL;
        String hudLogin;
        String email;
    }
    
    public class AdmInfo {
        String admLogin;
        String admPassword;
        String serverURL;
    }
    
    static testmethod void validateGetLoginInfo() {
        System.assertEquals('{\n}', FonLogin.getLoginInfo());
        
        final AdminCredentials__c cred = new AdminCredentials__c();
        cred.Login__c = ADM_LOGIN;
        cred.Token__c = ADM_PASSWRD;
        cred.ServerURL__c = SERVER_URL;
        insert cred;
        
        AdmInfo atest = (AdmInfo)JSON.deserialize(FonLogin.getLoginInfo(), AdmInfo.class);
        System.assertEquals(ADM_LOGIN, atest.admLogin);
        System.assertEquals(ADM_PASSWRD, atest.admPassword);
        System.assertEquals(SERVER_URL, atest.serverURL);
        
        final HudAccount__c userLogin = new HudAccount__c();
        userLogin.UserHudLogin__c = USER_HUD_LOGIN;
        userLogin.UserId__c = UserInfo.getUserId();
        insert userLogin;
        
        Info test = (Info)JSON.deserialize(FonLogin.getLoginInfo(), Info.class);
        System.assertEquals(ADM_LOGIN, test.admLogin);
        System.assertEquals(ADM_PASSWRD, test.admPassword);
        System.assertEquals(SERVER_URL, test.serverURL);
        System.assertEquals(USER_HUD_LOGIN, test.hudLogin); 
        List<User> users = [SELECT Username FROM User WHERE Id =: UserInfo.getUserId()];
        System.assertEquals(users.size(), 1); 
        System.debug(users[0]);
        System.assertEquals(users[0].Username, test.email); 
    }
    
    static testmethod void validateGetCalllogFieldName() {
        System.assertEquals(null, FonLogin.getCalllogFieldName());
        
        final AdminCredentials__c cred = new AdminCredentials__c();
        cred.Login__c = ADM_LOGIN;
        cred.Token__c = ADM_PASSWRD;
        cred.ServerURL__c = SERVER_URL;
        cred.CommentsLabel__c = COMMENTS_FIELD;
        insert cred;
        System.assertEquals(null, FonLogin.getCalllogFieldName()); 
        
    }
}