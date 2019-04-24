import { Base64 } from 'js-base64';

(function($, Drupal, drupalSettings) {

	Drupal.behaviors.generate_auth_token = {
		attach: function(context, settings) {

			var base_url = 'https://ankitbabbar-eval-test.apigee.net';
			var org = 'ankitbabbar-eval';

			var accounts_smartdoc_name = 'accounts-apis-v1-0';
			var accounts_oauth_name = 'PSUOAuth2Security';

			var payments_smartdoc_name = 'payments-apis-v1-0';
			var payments_oauth_name = 'PSUOAuth2Security';

			var client_id_accounts = drupalSettings.apigee_openbank_psu_oauth.default_auth.accounts.client_id;
			var client_secret_accounts = drupalSettings.apigee_openbank_psu_oauth.default_auth.accounts.client_secret;

			var client_id_payments = drupalSettings.apigee_openbank_psu_oauth.default_auth.payments.client_id;
			var client_secret_payments = drupalSettings.apigee_openbank_psu_oauth.default_auth.payments.client_secret;

			var template_callback_accounts = `https://api.enterprise.apigee.com/v1/o/${org}/apimodels/${accounts_smartdoc_name}/templateauths/${accounts_oauth_name}/callback`;
			var template_callback_payments = `https://api.enterprise.apigee.com/v1/o/${org}/apimodels/${payments_smartdoc_name}/templateauths/${payments_oauth_name}/callback`;

			var jose_header = `{
				"alg": "RS256",
				"kid": "${drupalSettings.apigee_openbank_psu_oauth.private_key_certificate_id}",
				"b64": "false",
				"http://openbanking.org.uk/iat": "2017-06-12T20:05:50 00:00",
				"http://openbanking.org.uk/iss": "C=UK, ST=England, L=London, O=Acme Ltd.",
				"crit": ["b64", "http://openbanking.org.uk/iat", "http://openbanking.org.uk/iss"]
			}`;

			var modalMarkup = `<div class="modal fade" id="authModal" tabindex="-1" role="dialog" aria-labelledby="authModalLabel" aria-hidden="true">
				<div class="modal-dialog modal-dialog-centered" role="document">
					<div class="modal-content">
						<div class="modal-header">
							<h3 class="modal-title">Create Authorization Token</h3>
							<button type="button" class="close" data-dismiss="modal" aria-label="Close">
								<span aria-hidden="true">&times;</span>
							</button>
						</div>
						<div class="modal-body">
							<form class="create-token">
								<div class="form-group">
									<label for="scopes">Scope</label>
									<select class="form-control" id="scopes">
										<option value="accounts">Accounts</option>
										<option value="payments">Payments</option>
									</select>
								</div>
								<div class="form-group">
									<label><input type="checkbox" name="default-token" id="default-token"> Use default</label>
								</div>
								<div class="form-group client-info">
									<label for="client-id">Custom Client Id</label>
									<input type="text" class="form-control" id="client-id">
								</div>
								<div class="form-group client-info">
									<label for="client-secret">Custom Client Secret</label>
									<input type="text" class="form-control" id="client-secret">
								</div>
								<div class="form-group row justify-content-end mr-4">
									<button type="button" class="btn btn-primary btn-send rounded-sm mr-2" data-dismiss="modal" style="font-size:.750rem;">Create Token</button>
									<button type="button" class="btn btn-primary btn-cancel" data-dismiss="modal" style="font-size:.750rem;">Cancel</button>
								</div>
							</form>

							<form class="set-token hidden">
								<div class="form-group row">
									<label for="authorization" class="col-sm-4">Authorization</label>
									<input type="text" class="form-control col-sm-7" id="authorization">
								</div>
								<div class="form-group row">
									<label for="grant-type" class="col-sm-4">Grant Type</label>
									<input type="text" class="form-control col-sm-7" id="grant-type" value="client_credentials">
								</div>
								<div class="form-group row">
									<label for="scopes" class="col-sm-4">Scope</label>
									<select class="form-control col-sm-7" id="scope-type">
										<option value="accounts">Accounts</option>
										<option value="payments">Payments</option>
									</select>
								</div>
								<div class="form-group row justify-content-end mr-4">
									<button type="button" class="btn btn-primary btn-send rounded-sm mr-2" style="font-size:.750rem;">Send</button>
									<button type="button" class="btn btn-primary btn-cancel rounded-sm" data-dismiss="modal" style="font-size:.750rem;">Cancel</button>
								</div>
							</form>

							<form class="create-request hidden">
								<div class="form-group row">
									<label for="bearer-token" class="col-sm-4">Authorization</label>
									<input type="text" class="form-control col-sm-7" id="bearer-token">
								</div>
								<div class="form-group row">
									<label for="financial-id" class="col-sm-4">x-fapi-financial-id</label>
									<input type="text" class="form-control col-sm-7" id="financial-id" value="123456789">
								</div>
								<div class="form-group row d-none">
									<label for="idempotency-key" class="col-sm-4">x-idempotency-key</label>
									<input type="text" class="form-control col-sm-7" id="idempotency-key" value="123456789">
								</div>
								<div class="form-group row">
									<label for="req-payload" class="col-sm-4">body</label>
									<textarea id="req-payload" class="col-sm-7" cols="30" rows="13"></textarea>
								</div>
								<div class="form-group row justify-content-end mr-4">
									<button type="button" class="btn btn-primary btn-send rounded-sm mr-2" style="font-size:.750rem;">Send</button>
									<button type="button" class="btn btn-primary btn-cancel rounded-sm" data-dismiss="modal" style="font-size:.750rem;">Cancel</button>
								</div>
							</form>

							<form class="authorise-request hidden">
								<div class="form-group row">
									<label for="request-token" class="col-sm-4">request</label>
									<input type="text" class="form-control col-sm-7" id="request-token">
								</div>
								<div class="form-group row justify-content-end mr-4">
									<button type="button" class="btn btn-primary btn-send rounded-sm mr-2" data-dismiss="modal" style="font-size:.750rem;">Send</button>
									<button type="button" class="btn btn-primary btn-cancel rounded-sm" data-dismiss="modal" style="font-size:.750rem;" >Cancel</button>
								</div>
							</form>

							<div class="d-flex justify-content-center">
								<div class="spinner-border d-none" style="width: 3rem; height: 3rem;" role="status">
									<span class="sr-only">Loading...</span>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>`;

			$('body', context).once().append(modalMarkup);

			$('body', context).on('click', '.try-out__btn', function(event) {
				event.preventDefault();
				var tryBtn = $(this);
				var paramRows = tryBtn.closest('.opblock-section').find('tr');
				paramRows.each(function() {
					var row = $(this);
					if (row.data('paramName') == 'Authorization') {
						row.find('.parameters-col_description').once().append('<a href="#" class="btn btn-sm authorize" data-toggle="modal" data-target="#authModal">Generate Token</a>');
					}

					var file = $('.information-container .link').attr('href');
					var methodType = $(this).parents('.opblock').find('.opblock-summary-method').text().toLowerCase();
					var methodPath = $(this).parents('.opblock').find('.opblock-summary-path').data('path');
					$.getJSON(file, function(data) {
						var method = data.paths[methodPath];

						if (method[methodType].security.length) {
							var authToken = localStorage.getItem('token') ? localStorage.getItem('token') : drupalSettings.apigee_openbank_psu_oauth.default_auth.accounts.token;
							$('#authModal').find('.create-token').addClass('hidden');
							$('#authModal').find('.set-token').removeClass('hidden');
							$('#authModal').find('.modal-title').text('Step 1: Get Client Credential Access Token');
							$('.set-token').find('#authorization').val(authToken);
						}

						$('.btn-cancel').on('click', function() {
							ResetAndCancel();
						})

						$('.create-token .btn-send').on('click', function() {
							var modalForm = $(this).closest('.modal-content').find('form');
							var defaultAuthToken = drupalSettings.apigee_openbank_psu_oauth.default_auth;
							var scope = modalForm.find('#scopes').val();
							var defaultToken = modalForm.find('#default-token').is(':checked');
							var clientId = modalForm.find('#client-id').val();
							var clientSecret = modalForm.find('#client-secret').val();
							var token = `${clientId}:${clientSecret}`;
							var base64Encoded = Base64.encode(token);

							if (row.data('paramName') == 'scope') {
								row.find('select').val(scope);
							}

							if (row.data('paramName') == 'Authorization') {
								if (defaultToken) {
									row.find('input[type="text"]').val(defaultAuthToken[scope].token);
									localStorage.setItem('token', defaultAuthToken[scope].token);
								}
								else {
									row.find('input[type="text"]').val(base64Encoded);
									localStorage.setItem('token', base64Encoded);
								}
							}
						});

						$('#authModal').find('#default-token').on('change', function() {
							if ($(this).is(':checked')) {
								$(this).closest('.form-group').siblings('.client-info').addClass('hidden');
							}
							else {
								$(this).closest('.form-group').siblings('.client-info').removeClass('hidden');
							}
						});

						$('.set-token').find('#scope-type').on('change', function() {
							$('.set-token').find('#authorization').val(drupalSettings.apigee_openbank_psu_oauth.default_auth[$(this).val()].token);
						});

						$('.set-token .btn-send').on('click', createToken);
					});
				});
			});

			function createToken() {
				$('.spinner-border').removeClass('d-none');
				localStorage.setItem('scope', $('.set-token select').val());
				var oauthURL = `${base_url}//apis/v1.0.1/oauth/token`;
				var xhttp = new XMLHttpRequest();
				xhttp.open("POST", oauthURL, true);
				xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
				xhttp.setRequestHeader("Authorization", $('.set-token #authorization').val());
				var params = `grant_type=client_credentials&scope=${localStorage.getItem('scope')}`;

				xhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 200) {
						$('.spinner-border').addClass('d-none');
			      var responseText = JSON.parse(this.responseText);
						localStorage.setItem('Authorization', `${responseText.token_type} ${responseText.access_token}`);
			      createRequestPage();
			    }
			    else if(this.readyState == 4 ) {
						ResetAndCancel();
			    }
			  };

			  xhttp.send(params);

			}

			function createRequestPage() {
				$('#authModal').find('.set-token').addClass('hidden');
				$('#authModal').find('.create-request').removeClass('hidden');

				var payload = '';
				if (localStorage.getItem('scope') == 'accounts') {
					$('#idempotency-key').closest('.row').addClass('d-none');
					$('#authModal').find('.modal-title').text('Step 2: Create Account Request');
					payload = '{"Data":{"Permissions":["ReadAccountsDetail","ReadBalances","ReadBeneficiariesDetail","ReadDirectDebits","ReadProducts","ReadStandingOrdersDetail","ReadTransactionsCredits","ReadTransactionsDebits","ReadTransactionsDetail"],"ExpirationDateTime":"2025-08-02T00:00:00-00:00","TransactionFromDateTime":"2012-05-03T00:00:00-00:00","TransactionToDateTime":"2025-05-08T00:00:00-00:00"},"Risk":{}}';
				}
				else {
					$('#idempotency-key').closest('.row').removeClass('d-none');
					$('#authModal').find('.modal-title').text('Step 2: Create Payment Request');
					payload = '{"Data":{"Initiation":{"InstructionIdentification":"ACME412","EndToEndIdentification":"FRESCO.21302.GFX.20","InstructedAmount":{"Amount":"165.88","Currency":"GBP"},"CreditorAccount":{"SchemeName":"SortCodeAccountNumber","Identification":"08080021325698","Name":"ACME Inc","SecondaryIdentification":"0002"},"RemittanceInformation":{"Reference":"FRESCO-101","Unstructured":"Internal ops code 5120101"}}},"Risk":{"PaymentContextCode":"EcommerceGoods","MerchantCategoryCode":"5967","MerchantCustomerIdentification":"053598653254","DeliveryAddress":{"AddressLine":["Flat 7","Acacia Lodge"],"StreetName":"Acacia Avenue","BuildingNumber":"27","PostCode":"GU31 2ZZ","TownName":"Sparsholt","CountySubDivision":["Wessex"],"Country":"UK"}}}';
				}

				$('#bearer-token').val(localStorage.getItem('Authorization'));
				$('#req-payload').val(payload);
				$('#idempotency-key').val(Date.parse(new Date()));
				$('.create-request .btn-send').on('click', createRequestAction);
			}

			function createRequestAction() {
				$('.spinner-border').removeClass('d-none');

				var jws = getJWS(jose_header, $('#req-payload').val());
				var postRequestURL = '';
				if (localStorage.getItem('scope') == 'accounts') {
					postRequestURL = `${base_url}/ais/open-banking/v1.0.1/account-requests`;
				}
				else {
					postRequestURL = `${base_url}/pis/open-banking/v1.0/payments`;
				}

				var xhttp = new XMLHttpRequest();
				xhttp.open("POST", postRequestURL, true);
				xhttp.setRequestHeader("Content-Type", "application/json");
				xhttp.setRequestHeader("Authorization", localStorage.getItem('Authorization'));
				xhttp.setRequestHeader("x-fapi-financial-id", $('#financial-id').val());
				xhttp.setRequestHeader("x-jws-signature", jws);
				xhttp.setRequestHeader("x-fapi-customer-ip-address", "123456");
				xhttp.setRequestHeader("Accept", "application/json");

				if (localStorage.getItem('scope') == 'payments') {
					xhttp.setRequestHeader("x-idempotency-key", $('#idempotency-key').val());
				}

				var body = $('#req-payload').val();
				xhttp.onreadystatechange = function() {
					if (this.readyState == 4 && this.status == 201) {
						$('.spinner-border').addClass('d-none');
						var responseText = JSON.parse(this.responseText);
						if (localStorage.getItem('scope') == 'accounts') {
							localStorage.setItem('RequestId', responseText.Data.AccountRequestId);
						}
						else {
							localStorage.setItem('RequestId', responseText.Data.PaymentId);
						}

						accessTokenPage();
					}
					else if(this.readyState == 4) {
						console.log('Error creating request');
					}
				}
				xhttp.send(body);
			}

			function accessTokenPage() {
				console.log('accessTokenPage');

				$('#authModal').find('.create-request').addClass('hidden');
				$('#authModal').find('.authorise-request').removeClass('hidden');
				$('#authModal').find('.modal-title').text('Step 3: Set additional Parameters for getting Access Token');
				localStorage.setItem('nonce', Date.parse(new Date()));
				var jwtResponse = '';
				if (localStorage.getItem('scope') == 'accounts') {
					jwtResponse = createJWT('accounts', localStorage.getItem('nonce'), client_id_accounts, template_callback_accounts);
				}
				else {
					jwtResponse = createJWT('payments', localStorage.getItem('nonce'), client_id_payments, template_callback_payments);
				}

				$('#request-token').val(jwtResponse.jwt);
				$('.authorise-request .btn-send').on('click', openAuthWindow);
			}

			function openAuthWindow() {
				ResetAndCancel();
				var jwt = $('#request-token').val();
				var authUrl = '';
				if (localStorage.ccScope == "accounts") {
					authUrl = `${base_url}/apis/v1.0/oauth/authorize?response_type=code&client_id=${client_id_accounts}&state=abcd1234&scope=openid accounts&redirect_uri=${template_callback_accounts}`;
				}
				else {
					authUrl = `${base_url}/apis/v1.0/oauth/authorize?response_type=code&client_id=${client_id_payments}&state=abcd1234&scope=openid accounts&redirect_uri=${template_callback_payments}`;
				}

				authUrl += `&request=${jwt}&nonce=${localStorage.getItem('nonce')}`;

				console.log('authUrl', authUrl);
				var oauth2Window = window.open(authUrl, "oauth2Window", "resizable=yes,scrollbars=yes,status=1,toolbar=1,height=500,width=500");
			}

			function getJWS(header, payload) {
				var response = getJsonWebToken(header, payload);
				var detachedJWT = response.jwt.split(".");
				var detachedJws = `${detachedJWT[0]}..${detachedJWT[2]}`;
				return detachedJws;
			}

			function createJWT(scope, nonce, clientId, callbackURL) {
				var jwtBody = `{
					"iss": "https://api.openbank.com",
					"response_type": "code",
					"client_id": "${clientId}",
					"redirect_uri": "${callbackURL}",
					"scope": "openid ${scope}",
					"state": "abcd1234",
					"nonce": "${nonce}",
					"claims": {
						"id_token": {
							"openbanking_intent_id": {
								"value": "urn:openbank:intent:${scope}:${localStorage.getItem('RequestId')}",
								"essential": true
							},
							"acr": {
								"essential": true
							}
						}
					},
					"iat": 1504521455,
					"exp": 1604525055
				}`;

				return getJsonWebToken(jose_header, jwtBody)
			}

			function getJsonWebToken(header, payload) {
				var xhttp = new XMLHttpRequest();
				xhttp.open("GET", `${location.origin}/apigee-openbank-psu-oauth/get-jwt?header=${header}&payload=${payload}`, false);
				var responseText = '';
				xhttp.send(null);
				if(xhttp.status == 200) {
					responseText = xhttp.responseText;
				}
				return JSON.parse(responseText);
			}

			function ResetAndCancel() {
				$('#authModal .set-token').removeClass('hidden');
				$('#authModal form:not(.set-token)').addClass('hidden');
				$('#authModal .spinner-border').addClass('hidden');
				$('#authModal').find('.modal-title').text('Create Authorization Token');
			}
		}
	};

})(jQuery, Drupal, drupalSettings)