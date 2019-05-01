<?php

namespace Drupal\apigee_openbank_psu_oauth\Controller;
use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\Request;

/**
 * Class PSUOAuth2CallbackController.
 */
class PSUOAuth2CallbackController extends ControllerBase {

  /**
   * Callback for OAuth2.
   *
   * @return string
   *   Obtain Token and closes itself, and set parent token.
   */
  public function callback(string $scope, Request $request) {
    $code = $request->get('code');
    return [
      '#markup' => '<div class="spinner-border" style="width: 3rem; height: 3rem;" role="status">
      <span class="sr-only">Loading...</span>
    </div>',
      '#attached' => [
        'library' => 'apigee_openbank_psu_oauth/apigee-oauth-callback',
        'drupalSettings' => [
          'apigee_openbank_oauth_callback' => [
            'code' => $code,
            'scope' => $scope,
            'base_url' => 'https://ankitbabbar-eval-test.apigee.net',
          ]
        ],
      ],
    ];
  }

}
