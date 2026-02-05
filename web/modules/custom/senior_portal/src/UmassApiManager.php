<?php

namespace Drupal\senior_portal;

use Drupal\Core\Messenger\MessengerInterface;
use GuzzleHttp\Client;
use GuzzleHttp\Exception\ClientException;
use GuzzleHttp\Exception\ConnectException;
use GuzzleHttp\Utils;
use Symfony\Component\DomCrawler\Crawler;

/**
 * UmassAPIManager.
 *
 * @package Drupal\umass_api
 */
class UmassApiManager {

  /**
   * The HTTP client.
   *
   * @var \GuzzleHttp\Client
   */
  protected Client $client;

  /**
   * Messenger service.
   *
   * @var \Drupal\Core\Messenger\MessengerInterface
   */
  protected MessengerInterface $messenger;

  /**
   * Class constructor.
   *
   * @param \GuzzleHttp\Client $client
   * @param \Drupal\Core\Messenger\MessengerInterface $messenger
   *
   * @todo Remove not required.
   */
  public function __construct(
    Client $client,
    MessengerInterface $messenger,
  ) {
    $this->client = $client;
    $this->messenger = $messenger;
  }

  /**
   * Fetch UMASS Global API.
   *
   * @param $path
   *
   * @return array|mixed
   *
   * @throws \GuzzleHttp\Exception\GuzzleException
   */
  public function fetchUmassGlobalAPI($path): mixed {
    try {
      // Process the response of the HTTP request.
      $response = $this->client
        ->get('https://api.umassglobal.edu/' . $path, [
          'headers' => [
            'Content-Type' => 'application/json',
            'Accept' => 'application/json',
          ],
        ]);
      $status = $response->getStatusCode();

      if ($status == '200') {
        return Utils::jsonDecode($response->getBody());
      }
      else {
        $this->messenger->addWarning('Bad response.');
      }
    }
    catch (ConnectException $e) {
      $this->messenger->addError('Unable to resolve domain.');
    }

    return [];
  }
}
