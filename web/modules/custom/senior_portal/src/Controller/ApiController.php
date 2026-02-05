<?php

namespace Drupal\senior_portal\Controller;

use Drupal\Core\Cache\CacheableMetadata;
use Drupal\Core\Controller\ControllerBase;
use Drupal\Core\Cache\CacheableJsonResponse;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Controller routines for page experiments routes.
 */
class ApiController extends ControllerBase {

  /**
   * The uMass Service.
   *
   * @var \Drupal\senior_portal\UmassApiManager
   */
  protected $uMassService;

  /**
   * The Cache Backend Interface.
   *
   * @var \Drupal\Core\Cache\CacheBackendInterface
   */
  protected $cacheBackend;

  /**
   * The Entity Type Manager.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The Path Alias Manager.
   *
   * @var \Drupal\Core\Path\AliasManagerInterface
   */
  protected $pathAliasManager;

  /**
   * The File URL Generator.
   *
   * @var \Drupal\Core\File\FileUrlGeneratorInterface
   */
  protected $fileUrlGenerator;

  /**
   * {@inheritdoc}
   */
  protected function getModuleName() {
    return 'umass_cost_calculator';
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    $instance = new static();
    $instance->uMassService = $container->get('senior_portal.manager');
    $instance->entityTypeManager = $container->get('entity_type.manager');
    $instance->pathAliasManager = $container->get('path_alias.manager');
    $instance->fileUrlGenerator = $container->get('file_url_generator');
    // Injecting cache service.
    $instance->cacheBackend = $container->get('cache.default');
    return $instance;
  }

  /**
   * Get the Program Listing.
   */
  public function getProgramListing() {
    // Define cache ID and cache tags.
    $cache_id = 'umass_api:program_listing';
    $cache_tags = ['umass_api:program_listing'];
    // Cache for 12 hours.
    $cache_max_age = 43200;

    // Check if data is cached.
    $cache = $this->cacheBackend->get($cache_id);
    if ($cache && isset($cache->data)) {
      return $cache->data;
    }

    // Fetch data if not cached.
    $path = $this->buildPathRequest('sf/ProgramListingController');
    $response = $this->uMassService->fetchUmassGlobalAPI($path);
    $programListing = $response->programList ?? [];

    // Cache the data.
    $this->cacheBackend->set($cache_id, $programListing, time() + $cache_max_age, $cache_tags);
    return $programListing;
  }

  /**
   * Get the Credits and Cost Listing.
   */
  public function getCreditsCostLsting(bool $military = FALSE) {
    // Define cache ID and cache tags.
    $cache_id = 'umass_api:credits_and_cost' . ($military ? ':military' : '');
    $cache_tags = ['umass_api:credits_and_cost'];
    // Cache for 12 hours.
    $cache_max_age = 43200;

    // Check if data is cached.
    $cache = $this->cacheBackend->get($cache_id);
    if ($cache && isset($cache->data)) {
      return $cache->data;
    }

    // Fetch data if not cached.
    $path = $this->buildPathRequest('v1/ListOfCreditsAndCostController?Military=' . ($military ? 'TRUE' : 'FALSE'));
    $response = $this->uMassService->fetchUmassGlobalAPI($path);
    $creditsCostLsting = $response->programCreditsCostList ?? [];

    // Cache the data.
    $this->cacheBackend->set($cache_id, $creditsCostLsting, time() + $cache_max_age, $cache_tags);
    return $creditsCostLsting;
  }

  /**
   * Get the request from UMass API for program listing.
   */
  public function programListing() {
    $data = $this->getProgramListing();

    // Create cache metadata for program listing.
    $cache_metadata = new CacheableMetadata();
    $cache_metadata->addCacheTags(['umass_api:program_listing']);
    // Cache for 12 hours.
    $cache_metadata->setCacheMaxAge(43200);

    // Create a cacheable response and attach metadata.
    $response = new CacheableJsonResponse($data);
    $response->addCacheableDependency($cache_metadata);

    return $response;
  }

  /**
   * Get the request from UMass API for credits and cost.
   */
  public function creditsAndCost(bool $military = FALSE) {
    $data = $this->getCreditsCostLsting($military);

    // Create cache metadata for credits and cost.
    $cache_metadata = new CacheableMetadata();
    $cache_metadata->addCacheTags(['umass_api:credits_and_cost']);
    // Cache for 12 hours.
    $cache_metadata->setCacheMaxAge(43200);

    // Create a cacheable response and attach metadata.
    $response = new CacheableJsonResponse($data);
    $response->addCacheableDependency($cache_metadata);

    return $response;
  }

  /**
   * Build Path for request API.
   */
  public function buildPathRequest(string $path = '') {
    return 'ProgramCampusService/api/' . $path;
  }

  /**
   * Endpoint for getting block config data.
   */
  public function blockConfig() {
    // Load the block entity.
    $block = $this->entityTypeManager->getStorage('block')->load('umass_global_umasscostcalculator');
    $settings = [];
    $cache_metadata = new CacheableMetadata();

    if (!empty($block)) {
      $settings = $block->get('settings');

      // Handle Partners images.
      $images = [];
      if (!empty($settings['partners'])) {
        foreach ($settings['partners'] as $key => $partner) {
          $media = $this->entityTypeManager->getStorage('media')->load($partner['image']);
          if (!empty($media) && !empty($media->image->entity)) {
            $file = $media->image->entity;
            $image_url = $this->fileUrlGenerator->generateAbsoluteString($file->getFileUri());
            $images[$key] = [
              'image' => $image_url,
              'alt' => $media->image->alt ?? '',
            ];
            $cache_metadata->addCacheableDependency($media);
          }
        }
      }
      $settings['partners'] = $images;

      // Handle Apply Now URL.
      if (!empty($settings['apply_now_url'])) {
        if (is_numeric($settings['apply_now_url'])) {
          // Internal path as Node ID.
          $node = $this->entityTypeManager->getStorage('node')->load($settings['apply_now_url']);
          if ($node) {
            // Get the internal path or URL alias.
            $internal_path = $this->pathAliasManager->getAliasByPath('/node/' . $node->id());
            $settings['apply_now_url'] = $internal_path;
            $cache_metadata->addCacheableDependency($node);
          }
          else {
            // Fallback if node does not exist.
            $settings['apply_now_url'] = '';
          }
        }
        elseif (preg_match('/^https?:\/\//', $settings['apply_now_url'])) {
          // External URL - keep as is.
          $settings['apply_now_url'] = $settings['apply_now_url'];
        }
        else {
          // Invalid data fallback.
          $settings['apply_now_url'] = '';
        }
      }

      // Handle Transfer Credit Disclaimer Text.
      if (!empty($settings['bottom_slider_text'])) {
        $settings['bottom_slider_text'] = [
          'value' => $settings['bottom_slider_text']['value'] ?? '',
          'format' => $settings['bottom_slider_text']['format'] ?? 'basic_html',
        ];
      }

      // Handle General Disclaimer Text.
      if (!empty($settings['bottom_text'])) {
        $settings['bottom_text'] = [
          'value' => $settings['bottom_text']['value'] ?? '',
          'format' => $settings['bottom_text']['format'] ?? 'basic_html',
        ];
      }

      // Add block cache metadata to invalidate cache when block settings change.
      $cache_metadata->addCacheableDependency($block);
    }

    // Create a cacheable response with the collected cache metadata.
    $response = new CacheableJsonResponse($settings);
    $response->addCacheableDependency($cache_metadata);

    return $response;
  }

}
