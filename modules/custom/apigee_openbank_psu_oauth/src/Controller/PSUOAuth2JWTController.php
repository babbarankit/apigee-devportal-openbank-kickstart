<?php

namespace Drupal\apigee_openbank_psu_oauth\Controller;

use Symfony\Component\HttpFoundation\RequestStack;
use Drupal\Core\Controller\ControllerBase;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;
use Symfony\Component\HttpKernel\Exception\HttpException;

/**
 * Class PSUOAuth2JWTController.
 */
class PSUOAuth2JWTController extends ControllerBase {

  /**
   * Request stack.
   *
   * @var \Symfony\Component\HttpFoundation\RequestStack
   */
  public $request;

  /**
   * Class constructor.
   *
   * @param \Symfony\Component\HttpFoundation\RequestStack $request
   *   Request stack.
   */
  public function __construct(RequestStack $request) {
    $this->request = $request;
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    // Instantiates this form class.
    return new static(
      // Load the service required to construct this class.
      $container->get('request_stack')
    );
  }

  /**
   * Getjwt.
   *
   * @return string
   *   Return Hello string.
   */
  public function getJWT() {
    $header_str = $this->request->getCurrentRequest()->get('header');
    $payload_str = $this->request->getCurrentRequest()->get('payload');
    $header = json_decode($header_str, FALSE);
    $payload = json_decode($payload_str, FALSE);
    if (!$header || !$payload) {
      throw new HttpException(400, "Failed to generate");
    }
    $config = \Drupal::config('apigee_openbank_psu_oauth.openbanksettings');
    $path = $config->get('private_key_path');
    $private_key_path = "file://$path";
    $jwt = $this->generateJWT('sha256', $header, $payload, $private_key_path);
    return new JsonResponse($jwt);
  }

  /**
   *
   */
  private function base64UrlEncode($data) {
    return rtrim(strtr(base64_encode($data), '+/', '-_'), '=');
  }

  /**
   *
   */
  private function generateJWT($algo, $header, $payload, $private_key_path) {
    $headerEncoded = $this->base64UrlEncode(json_encode($header));

    $payloadEncoded = $this->base64UrlEncode(json_encode($payload));

    // Delimit with period (.)
    $dataEncoded = "$headerEncoded.$payloadEncoded";
    $private_key = openssl_pkey_get_private($private_key_path);
    $result = openssl_sign($dataEncoded, $signature, $private_key_path, $algo);

    if ($result === FALSE) {
      throw new HttpException(500, "Failed to generate signature: " . implode("\n", getOpenSSLErrors()));
    }
    $signatureEncoded = $this->base64UrlEncode($signature);
    $jwt = "$dataEncoded.$signatureEncoded";
    return ['jwt' => $jwt];
  }

}
