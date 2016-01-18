hudweb.directive('loginSubmit', function($parse) {
  return {
	  restrict: 'A',
      require: ['loginSubmit', '?form'],
      controller: ['$scope', function ($scope) {
    	  this.attempted = false;
          this.scope = $scope;
          var formController = null;
          
          this.setAttempted = function() {
              this.attempted = true;
          };
          
          this.setFormController = function(controller) {
            formController = controller;
          };
          
          this.needsAttention = function (fieldModelController) {
              if (!formController) return false;
              
              if (fieldModelController) {
                  return fieldModelController.$invalid && (fieldModelController.$dirty || this.attempted);
              } else {
                  return formController && formController.$invalid && (formController.$dirty || this.attempted);
              }
          };
      }],
      compile: function(cElement, cAttributes, transclude) {
    	  return {
              pre: function(scope, formElement, attributes, controllers) {

                  var submitController = controllers[0];

                  var formController = (controllers.length > 1) ? controllers[1] : null;
                  
                  submitController.setFormController(formController);

                  scope.login = scope.login || {};
                  scope.login[attributes.name] = submitController;
              },
              post: function(scope, formElement, attributes, controllers) {
            	  
                  var submitController = controllers[0];
                  var formController = (controllers.length > 1) ? controllers[1] : null;

                  var fn = $parse(attributes.loginSubmit);
                  
                  
                var allTrim = function(str)
          	  	{
          	  		return str.replace(/^\s+/, '').replace(/\s+$/, '');
          	  	};
          	  			
          	  	var validateLoginForm = function(form, scope)
          	  	{
          	  		var username = allTrim(form.username.value);
          	  		var password=  allTrim(form.password.value);
          	  		
          	  		var validForm = validateField(username,"usernameEmpty");	
          	  		if(!validForm)scope.emptyUserLoginField = true;
          	  		
          	  		validForm = validateField(password,"passwordEmpty") && validForm;
          	  	    if(!validForm && !scope.emptyUserLoginField)scope.emptyPWLoginField = true;
          	  	    scope.$safeApply();
          	  	    
          	  		var recaptcha_response_field = form.recaptcha_response_field;
          	  		if(recaptcha_response_field != null){
          	  			var recaptcha_response = recaptcha_response_field.value;
          	  			validForm = validateField(recaptcha_response,"captchaTextEmpty") && validForm;
          	  			validForm = validateField(recaptcha_response,"captchaAudioEmpty") && validForm;    			
          	  		}
          	  		
          	  		if(!validForm){
          	  			/*var errorMessage = document.getElementById("errorMessage");
          	  			if(errorMessage){
          	  				errorMessage.style.display = "none";
          	  			}*/
          	  		}
          	  		
          	  	  return validForm;
          	  	  
          	  	 };
          	
          	  	 //return true if valid (not empty)value. 
          	  	 var validateField = function(fieldValue, errorMessageId)
          	  	 {
          	  		if(allTrim(fieldValue)){
          	  			document.getElementById(errorMessageId).style.display = "none";
          	  			return true;
          	  		}else{
          	  			document.getElementById(errorMessageId).style.display = "block";    			
          	  			return false;		
          	  		}
          	
          	  	 };
          	  	 

                 formElement.bind('submit', function (event) {
                      submitController.setAttempted();
                      if (!scope.$$phase) scope.$apply();
                      
                      var isValid = validateLoginForm(event.currentTarget, submitController.scope);
                      if (!formController.$valid && !isValid){
                    	  
                    	  return false;
                      }

                      scope.$apply(function() {
                          fn(scope, {$event:event});
                      });
                });
              }
      };        
    }      
  };
});      