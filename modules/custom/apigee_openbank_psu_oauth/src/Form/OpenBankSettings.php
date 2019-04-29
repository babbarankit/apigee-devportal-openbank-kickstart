<?php

namespace Drupal\apigee_openbank_psu_oauth\Form;

use Drupal\Core\Form\ConfigFormBase;
use Drupal\Core\Form\FormStateInterface;

/**
 * Class OpenBankSettings.
 */
class OpenBankSettings extends ConfigFormBase {

  /**
   * {@inheritdoc}
   */
  protected function getEditableConfigNames() {
    return [
      'apigee_openbank_psu_oauth.openbanksettings',
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function getFormId() {
    return 'open_bank_settings';
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state) {
    $config = $this->config('apigee_openbank_psu_oauth.openbanksettings');
    $form['accounts_client'] = [
      '#type' => 'details',
      '#title' => $this->t('Default Accounts Client'),
      '#open' => TRUE,
    ];
    $form['accounts_client']['accounts_client_id'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Accounts Client Id'),
      '#description' => $this->t('Default OAuth2 Accounts Client'),
      '#maxlength' => 128,
      '#size' => 64,
      '#default_value' => $config->get('accounts_client_id'),
    ];
    $form['accounts_client']['accounts_client_secret'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Accounts Client Secret'),
      '#description' => $this->t('Default OAuth2 Accounts Client Secret'),
      '#maxlength' => 128,
      '#size' => 64,
      '#default_value' => $config->get('accounts_client_secret'),
    ];
    $form['payments_client'] = [
      '#type' => 'details',
      '#title' => $this->t('Default Payments Client'),
      '#open' => TRUE,
    ];
    $form['payments_client']['payments_client_id'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Payments Client Id'),
      '#description' => $this->t('Default OAuth2 Payments Client'),
      '#maxlength' => 128,
      '#size' => 64,
      '#default_value' => $config->get('payments_client_id'),
    ];
    $form['payments_client']['payments_client_secret'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Payments Client Secret'),
      '#description' => $this->t('Default OAuth2 Payments Client Secret'),
      '#maxlength' => 128,
      '#size' => 64,
      '#default_value' => $config->get('payments_client_secret'),
    ];
    $form['private_key_path'] = [
      '#type' => 'textfield',
      '#title' => $this->t('TPP Private Key Path'),
      '#description' => $this->t('Third Party Provider (TPP) Private Key Path'),
      '#maxlength' => 128,
      '#size' => 32,
      '#default_value' => $config->get('private_key_path'),
      '#required' => TRUE,
    ];
    $form['private_key_certificate_id'] = [
      '#type' => 'textfield',
      '#title' => $this->t('Private Key Certificate Id'),
      '#description' => $this->t('Private Key Certificate Id'),
      '#maxlength' => 128,
      '#size' => 32,
      '#default_value' => $config->get('private_key_certificate_id'),
      '#required' => TRUE,
    ];
    return parent::buildForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function validateForm(array &$form, FormStateInterface $form_state) {
    $file_name = $form_state->getValue('private_key_path');
    if (empty($file_name) || !file_exists($file_name)) {
      $form_state->setErrorByName('tpp_private_key_path', $this->t('No Such File Exists'));
    }
    if (!openssl_pkey_get_private("file://$file_name")) {
      $form_state->setErrorByName('tpp_private_key_path', $this->t('Not a valid Private Key'));
    }
    parent::validateForm($form, $form_state);
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
    parent::submitForm($form, $form_state);
    $this->config('apigee_openbank_psu_oauth.openbanksettings')
      ->set('accounts_client_id', $form_state->getValue('accounts_client_id'))
      ->set('accounts_client_secret', $form_state->getValue('accounts_client_secret'))
      ->set('payments_client_id', $form_state->getValue('payments_client_id'))
      ->set('payments_client_secret', $form_state->getValue('payments_client_secret'))
      ->set('jwt_secret', $form_state->getValue('jwt_secret'))
      ->set('private_key_path', $form_state->getValue('private_key_path'))
      ->set('private_key_certificate_id', $form_state->getValue('private_key_certificate_id'))
      ->save();
  }

}
