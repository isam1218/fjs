public with sharing class FonAdapterController {
    final static String SERVLET_NAME = '/accounts/token';
    final static String COMMENTS_FIELD_LABEL = 'Comments';
    final static String DESCRIPTION_FIELD_NAME = 'Description';
  
    public string nameFile{get;set;}
    public Blob contentFile{get;set;}
    String[] filelines = new String[]{};
    List<HudAccount__c> accstoupload; 
    public String password {get; set;}
    public String username {get; set;}
    public String serverURL {get; set;}
    public String label{get; set;}
    public String userId{get;set;} 
    Set<String> accountIds = new Set<String>();
    Set<String> accountLogins = new Set<String>();
    Boolean isDisabled = true;
    
    public Boolean getIsDisabled(){
        if(getuploadedServer()!= null) {
            return false;
        }
        return this.isDisabled;
    }
  
    public HttpRequest buildWebServiceRequest(){
       HttpRequest req = null;
       if(!String.isEmpty(serverURL) && !String.isEmpty(username) && !String.isEmpty(password)) {
           req = new HttpRequest();
           if(serverURL.endsWith('/')) {
                serverUrl = serverURL.substring(0, serverUrl.length()-1);
           }
           req.setEndpoint(serverURL + SERVLET_NAME);
           req.setMethod('POST');       
           req.setBody('username=' + EncodingUtil.urlEncode(username , 'UTF-8') + '&passwd=' + EncodingUtil.urlEncode(password, 'UTF-8'));
       }
       return req; 
    }
    
    public List<SelectOption> getItems() {
       List<SelectOption> options = new List<SelectOption>();
       Map<String, SobjectField> fieldMap = Task.getsObjectType().getDescribe().Fields.getMap(); 
       String labelName;
       String name;
       for(String f :  fieldMap.keySet()) {
           DisplayType ftype = fieldMap.get(f).getDescribe().getType();
           labelName = fieldMap.get(f).getDescribe().getLabel();
           name = fieldMap.get(f).getDescribe().getName();
           if(ftype == DisplayType.TextArea) {
               if(!DESCRIPTION_FIELD_NAME.equals(name)){
                    options.add(new SelectOption(name,labelName));
               }
               else {          
                    options.add(new SelectOption(name, COMMENTS_FIELD_LABEL));
               }  
           }
       }
       this.label = getLabel();
       if(this.label == null)
           this.label = DESCRIPTION_FIELD_NAME;
       return options;
    }
    
    private String getLabel() {
       AdminCredentials__c serv = getuploadedServer();
       if (serv != NULL) {
          return serv.CommentsLabel__c;
       }
       return null;
    }
    
    public PageReference applyLabel() {
       AdminCredentials__c serv = getuploadedServer();
       if (serv  != NULL) {
          serv.CommentsLabel__c = this.label;
          update serv;
       }
       return null;
    }  
  
    public HttpResponse invokeWebService(Http h, HttpRequest req){
       HttpResponse res = null;
       try {
           res = h.send(req);
       }
       catch (CalloutException e){
           createError('Unauthorized endpoint, please check Setup->Security->Remote site settings. endpoint = ' + serverURL + '.'); 
       } 
       catch (Exception ex) {
           createError('Incorrect administrator credentials or server URL. Cannot get token.');  
       }
       return res;
    }
    
    public void handleWebServiceResponse(HttpResponse res){
        if(res != null)  {
            final String tokenRes = res.getBody();
            if(!String.isEmpty(tokenRes)) {
               final String token = tokenRes.substring(6);
               setToken(token);
            }
            else {
               createError('Incorrect administrator credentials or server URL. Cannot get token.');  
            }
        }
    }
    
    public PageReference login() {
       if(String.isEmpty(username) || String.isEmpty(password) || String.isEmpty(serverURL )){
           createError('Administrator credentials or server URL are empty.'); 
       }
       else {
           Http h = new Http();
           HttpRequest req = buildWebServiceRequest();
           if(null != req) {
               HttpResponse res = invokeWebService(h, req);
               handleWebServiceResponse(res);
           }
       } 
       return null;
    }      
    
    public void setToken(final String token) {
         String tmpLabel = deleteOldCredentials();  
         AdminCredentials__c admin = new AdminCredentials__c();      
         admin.Token__c = token;
         admin.ServerURL__c = serverURL;
         admin.Login__c = username;
         admin.CommentsLabel__c = tmpLabel;
         try {
             insert admin;
         }
         catch (Exception e) {
            createError('An error has occured with admin data. Please check the credentials or try again later.'); 
         } 
    }
  
    public PageReference upload() {
      boolean isError = false;
      boolean isWarnings = false;
      if(contentFile == null) {
          createError('Empty file or no file is choosen.'); 
          isError = true;
      }
      if(!isError){
          nameFile=contentFile.toString();
          filelines = nameFile.split('\n');
          if(0 >= nameFile.length()){
              createError('File is empty.'); 
              isError = true;
          }
          if(!isError){
              accstoupload = new List<HudAccount__c>();
              for(Integer i=0; i<filelines.size(); i++) {    
                  String[] inputvalues = new String[]{};
                  inputvalues = filelines[i].split(',');            
                  if(2 > inputvalues.size()) {
                      createWarning('You have less than two values in line: ' + (i + 1) + '.'); 
                      isWarnings = true;
                  }
                  else {
                      inputvalues[0] = inputvalues[0].trim(); 
                      inputvalues[1] = inputvalues[1].trim();  
                      if(!isInCallCenter(inputvalues[0], i)) {
                           isWarnings = true;
                      }
                      if(!accountIds.contains(inputvalues[0]) && !accountLogins.contains(inputvalues[1])) {
                          checkDuplicateLogin(inputvalues[1]);
                          if(!updateOldAccount(inputvalues[0], inputvalues[1], (i + 1), isWarnings)) { 
                              try {
                                   HudAccount__c a = new HudAccount__c();
                                   a.UserId__c = inputvalues[0];
                                   a.UserHudLogin__c = inputvalues[1];   
                                   accstoupload.add(a);
                                   accountIds.add(inputvalues[0]);  
                                   accountLogins.add(inputvalues[1]);  
                               }
                               catch(Exception ecept) {
                                   createWarning('Bad user id: ' + inputvalues[0] + ' or HUD login: ' + inputvalues[1] + ', Line ' + (i + 1)); 
                                   isWarnings = true;
                               }
                           } 
                           else {
                              accountIds.add(inputvalues[0]); 
                              accountLogins.add(inputvalues[1]);   
                           } 
                      }
                      else {
                           createWarning('You try to load duplicate HUD login ' +  inputvalues[1] + '. Only the first from the file will be uploaded'); 
                           isWarnings = true; 
                      }
                  }
              }
              try {
                  if(0 < accstoupload.size()) {
                      insert accstoupload;
                  }
              }
              catch(DmlException ex) {
                  for(Integer j=0; j<accstoupload.size(); j++) { 
                      try {
                            insert accstoupload[j];
                      }
                      catch(DmlException exp) {
                          createWarning('Can not insert account: ' + accstoupload[j].UserHudLogin__c  + '.'); 
                          isWarnings = true; 
                      } 
                  }
              }
              if(!isError) {
                  if(isWarnings) {
                      createInfo('File uploaded with warnings.'); 
                  }
                  else {
                      createInfo('File uploaded successfully.'); 
                  }
              }   
          } 
      }
      if(null != accstoupload) {
         accstoupload.clear();
      }
      if(null != accountIds) {
         accountIds.clear();
      }
      if(null != accountLogins) {
         accountLogins.clear();
      }      
      return null;
    }
    
    private boolean isInCallCenter(final String id, final Integer i) {
        boolean hasCallCenter = false;
        try{
            List<User> clist = [select id, Name, CallCenterId from User where id =: id Limit 1];
            if(clist != null && clist.size() > 0 && clist.get(0) != null) {
                if(!String.isEmpty(clist.get(0).CallCenterId)) {
                    hasCallCenter = true;       
                }
                else {
                   createWarning('User  ' + clist.get(0).Name + ' is not added to any Call Center. Line ' + (i + 1) + '.'); 
                }
            } 
        }
        catch(Exception ex) {
        } 
        return hasCallCenter;
    }
    
    public List<HudAccount__c> getuploadedAccounts() {
       List<HudAccount__c> clist = [select id, UserHudLogin__c, UserId__c from HudAccount__c Limit 500] ;
       if (clist != NULL)
         if (clist.size() > 0)
           return clist;
       return null;
    }  
   
    private boolean updateOldAccount(final String userId, final String login, final Integer line, boolean isWarnings) {
        try {
            final HudAccount__c account = [select id, UserId__c, UserHudLogin__c  from HudAccount__c Where UserId__c =: userId Limit 1];  
            if(null != account) {
                account.UserHudLogin__c = login;
                try {
                    update account;
                    ApexPages.Message errormsg = new ApexPages.Message(ApexPages.severity.INFO, 'Change HUD login for user id = ' + account.UserId__c + ' , old HUD account is ' + 
                        account.UserHudLogin__c + ', new HUD account is ' + login);    
                    ApexPages.addMessage(errormsg);
                    return true;
                } catch (DmlException e) {
                   createWarning('Can not upload account from line ' + line);
                   isWarnings = true;
                }
            }
        }
        catch(QueryException ex) {
        }
        return false;
    }  
    
    private void checkDuplicateLogin(final String login) {
          final List<HudAccount__c> accounts = [select UserId__c, UserHudLogin__c  from HudAccount__c Where UserHudLogin__c =: login Limit 100];  
          final List<String> logins = new List<String>();
          if(null != accounts && accounts.size() != 0) {
              for(Integer i = 0 ; i < accounts.size(); i++) {
                  logins.add(accounts.get(i).UserId__c);
              } 
              ApexPages.Message errormsg = new ApexPages.Message(ApexPages.severity.INFO, 'Login = ' + login + ' is used by more than one SF users. Previous user ids: ' + 
                  logins);   
              ApexPages.addMessage(errormsg);     
          }
    }
    
    private String deleteOldCredentials() {
        String tmpLabel = null;  
        try {
            List<AdminCredentials__c> clist = [select id, CommentsLabel__c from AdminCredentials__c LIMIT 500] ;
            if(clist.size() > 0) {
                delete clist ;
                tmpLabel = clist[0].CommentsLabel__c;
            }
        } catch(Exception e) {
            createError('Can not delete old server credentials.');
        }
       return tmpLabel;
    }
    
    public AdminCredentials__c getuploadedServer() {
        List<AdminCredentials__c> clist = [select id, Login__c, ServerURL__c, Token__c, CommentsLabel__c  from AdminCredentials__c Limit 1] ; 
        if (clist != NULL)
            if (clist.size() > 0) {     
                return clist[0];
            }
       return null;
    }   
    
    public void removeAccount() {
        Boolean isDeleted = false;
        try {
            HudAccount__c account = [select id, UserHudLogin__c from HudAccount__c where id =: userId Limit 1];  
            if(null != account) {
               delete account;
            }
        }
        catch(Exception ex) {
        }
    } 
    
    private void createError(final String errMsg) {
        ApexPages.Message errormsg = new ApexPages.Message(ApexPages.severity.ERROR, errMsg);    
        ApexPages.addMessage(errormsg);
    }
    
    private void createWarning(final String warMsg) {
        ApexPages.Message errormsg = new ApexPages.Message(ApexPages.severity.WARNING, warMsg);    
        ApexPages.addMessage(errormsg);
    }
    
    private void createInfo(final String infMsg) {
        ApexPages.Message errormsg = new ApexPages.Message(ApexPages.severity.INFO, infMsg);    
        ApexPages.addMessage(errormsg);
    }    
}