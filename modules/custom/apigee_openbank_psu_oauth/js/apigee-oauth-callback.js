(function($, Drupal, drupalSettings) {
  Drupal.behaviors.oauth_callback = {
    attach: function(context, settings) {
      var base_url = 'https://ankitbabbar-eval-test.apigee.net';
      var token_uri = '/apis/v1.0.1/oauth/token';

      var oauthURL = base_url + token_uri; 
      var scope = drupalSettings.apigee_openbank_oauth_callback.scope;
      var code = drupalSettings.apigee_openbank_oauth_callback.code;
      var client_token = drupalSettings.apigee_openbank_psu_oauth.default_auth[scope].token;
      var client_id = drupalSettings.apigee_openbank_psu_oauth.default_auth[scope].client_id;
      var redirect_uri = 'http://localhost/oauth2-callback/accounts';

      console.log(code, scope);
      jwtHeader = {
        "alg": "RS256",
        "expiresIn": "1h"
      };

      jwtPayload = {
        "iss": `"${client_id}"`
      }

      // console.log('window opener', window.opener.document);

      $.ajax({
        type: 'GET',
        url: `http://localhost/apigee-openbank-psu-oauth/get-jwt?header=${JSON.stringify(jwtHeader)}&payload=${JSON.stringify(jwtPayload)}`,
        success: function(response) {
          var jwt = response.jwt;

          console.log('jwt', jwt);

          var xhttp = new XMLHttpRequest();
          xhttp.open("POST", oauthURL, true);
          xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
          xhttp.setRequestHeader("Authorization", client_token);
          var params = `client_id=${client_id}&redirect_uri=${redirect_uri}&grant_type=authorization_code&code=${code}&scope=${scope}&client_assertion=${jwt}`;

          xhttp.onreadystatechange = function() {
            if (this.readyState == 4 && this.status == 200) {
              console.log(this.responseText);
            }
            else if(this.readyState == 4 ) {
              //ResetAndCancel();
              console.log('Error');
            }
          };
  
          xhttp.send(params);
        }
      });
    }
  };
})(jQuery, Drupal, drupalSettings);