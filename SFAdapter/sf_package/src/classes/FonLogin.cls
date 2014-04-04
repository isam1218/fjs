global with sharing class FonLogin{
    private final static String ADM_LOGIN = 'admLogin';
    private final static String ADM_PASSWRD = 'admPassword';
    private final static String SERVER_URL = 'serverUrl';
    private final static String USER_HUD_LOGIN = 'hudLogin';
    private final static String EMAIL = 'email';
    
    global static String getLoginInfo() {
       final List<AdminCredentials__c> admCred = [SELECT Login__c, Token__c, ServerURL__c FROM AdminCredentials__c LIMIT 1];
       final List<HudAccount__c> hudLogin = [SELECT UserHudLogin__c FROM HudAccount__c WHERE UserId__c =: UserInfo.getUserId() LIMIT 1];
       final List<User> users = [SELECT Username FROM User WHERE Id =: UserInfo.getUserId() LIMIT 1];
       
       JSONGenerator res = JSON.createGenerator(true);
       res.writeStartObject();
         if(0 != admCred.size()) {
           if(admCred[0].Login__c != null) {
               res.writeStringField(ADM_LOGIN, admCred[0].Login__c);   
           }
           if(admCred[0].Token__c != null) {
                res.writeStringField(ADM_PASSWRD, admCred[0].Token__c);
           }
           if(admCred[0].ServerURL__c != null) {
               res.writeStringField(SERVER_URL, admCred[0].ServerURL__c);
           } 
           if(0 != users.size()) {
                res.writeStringField(EMAIL, users[0].Username);
           }
           if(0 != hudLogin.size()) {
                res.writeStringField(USER_HUD_LOGIN, hudLogin[0].UserHudLogin__c);
           }
         }    
       return res.getAsString();
    }
    
    global static String getCalllogFieldName() {
       final List<AdminCredentials__c> admCred = [SELECT CommentsLabel__c FROM AdminCredentials__c LIMIT 1];
       String label = null;
       if(admCred != null && admCred.size() > 0) {
            label = admCred[0].CommentsLabel__c;
       }
       if(!String.isEmpty(label)) {
           final Map<String, SobjectField> fieldMap = Task.getsObjectType().getDescribe().Fields.getMap();          
           if(fieldMap.containsKey(label.toLowerCase())) {
               return label;
           }
       }
       return null;
    }
}