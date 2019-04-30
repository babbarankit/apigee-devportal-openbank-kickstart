(function($, Drupal, drupalSettings) {
  Drupal.behaviors.oauth_callback = {
    attach: function(context, settings) {
      var base_url = 'https://ankitbabbar-eval-test.apigee.net';
      var token_uri = '/apis/v1.0.1/oauth';
      console.log(code, scope);
      var oauthURL = base_url + token_uri; 
      var scope = drupalSettings.apigee_openbank_oauth_callback.scope;
      var code = drupalSettings.apigee_openbank_oauth_callback.code;
      var client_token = drupalSettings.apigee_openbank_psu_oauth.default_auth[scope].token;
      var client_id = drupalSettings.apigee_openbank_psu_oauth.default_auth[scope].client_id;
      var redirect_uri = 'http://localhost/oauth2-callback/accounts';
      /*var xhttp = new XMLHttpRequest();
      xhttp.open("POST", oauthURL, true);
      xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
      xhttp.setRequestHeader("Authorization", token);
      xhttp.onreadystatechange = function() {
        if (this.readyState == 4 && this.status == 201) {
        }
        else if(this.readyState == 4) {
          console.log('Error creating request');
        }
      }
      xhttp.send(body);*/
      console.log(code, scope);
    }
  };
})(jQuery, Drupal, drupalSettings);