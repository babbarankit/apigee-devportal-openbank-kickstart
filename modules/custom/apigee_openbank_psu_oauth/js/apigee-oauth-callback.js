(function($, Drupal, drupalSettings) {
  'use strict';

  Drupal.behaviors.oauth_callback = {
    attach: function(context, settings) {
      var oauthURL = `${drupalSettings.apigee_openbank_oauth_callback.base_url}/apis/v1.0.1/oauth/token`;
      var scope = drupalSettings.apigee_openbank_oauth_callback.scope;
      var code = drupalSettings.apigee_openbank_oauth_callback.code;
      var client_token = drupalSettings.apigee_openbank_psu_oauth.default_auth[scope].token;
      var client_id = drupalSettings.apigee_openbank_psu_oauth.default_auth[scope].client_id;
      var redirect_uri = `${location.origin}/oauth2-callback/${scope}`;

      var jwtHeader = {
        "alg": "RS256",
        "expiresIn": "1h"
      };
      var jwtPayload = {
        "iss": client_id
      };

      $.ajax({
        type: 'GET',
        url: `${location.origin}/apigee-openbank-psu-oauth/get-jwt?header=${JSON.stringify(jwtHeader)}&payload=${JSON.stringify(jwtPayload)}`,
        success: function(response) {
          if (response.jwt) {
            var jwt = response.jwt;

            $.ajax({
              type: 'POST',
              url: oauthURL,
              headers: {
                'Authorization': client_token,
                'Content-type': 'application/x-www-form-urlencoded',
              },
              data: {
                'client_id': client_id,
                'redirect_uri': redirect_uri,
                'grant_type': 'authorization_code',
                'code': code,
                'scope': scope,
                'client_assertion': jwt
              },
              success: function(response) {
                if (response.access_token) {
									var refererr = $(window.opener.document);
									var target = refererr.find('.opblock.is-open tr[data-param-name="Authorization"] .markdown');
									target.append(`<div class="alert alert-primary">Copy the code to the input below <pre><code>Bearer ${response.access_token}</code></pre></div>`);
									window.close();
                }
              }
            });
          }
        }
      });
    }
  };
})(jQuery, Drupal, drupalSettings);
