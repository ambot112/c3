<?php

namespace Drupal\senior_portal\Form;

use Drupal\Core\Form\FormBase;
use Drupal\Core\Form\FormStateInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Fix aliases.
 */
class CostCalculatorForm extends FormBase {

  /**
   * The uMass Service.
   *
   * @var \Drupal\umass_api\UmassApiManager
   */
  protected $uMassService;

  /**
   * The program listing.
   *
   * @var array
   */
  protected $programListing;

  /**
   * The form total page.
   *
   * @var int
   */
  protected static $totalPages = 7;

  /**
   * The form current page.
   *
   * @var int
   */
  protected static $currentPage = 1;

  /**
   * {@inheritdoc}
   */
  public function getFormId(): string {
    return 'alias_fixer';
  }

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container) {
    $instance = new static();
    $instance->uMassService = $container->get('umass_api.manager');
    return $instance;
  }

  /**
   * {@inheritdoc}
   */
  public function buildForm(array $form, FormStateInterface $form_state, array $block_configs = []) {

    $form['#prefix'] = '<div id="cost-calculator-wrapper">';
    $form['#suffix'] = '</div>';

    $form['total_page'] = [
      '#type' => 'hidden',
      'value' => $this->totalPages,
    ];

    $form['current_page'] = [
      '#type' => 'hidden',
      'value' => $this->currentPage,
    ];

    $form['heading'] = [
      '#type' => 'tag',
      '#tag' => 'h3',
      '#value' => $this->t('Choose Your Program'),
    ];

    $form['degree_level'] = [
      '#type' => 'select',
      '#title' => $this->t('Select Degree Type'),
      '#options' => $this->getDegreeLevelOptions(),
      '#ajax' => [
        'callback' => [$this, 'ajaxFormCallback'],
        'wrapper' => 'cost-calculator-wrapper',
        // 'progress' => 'none',
      ],
    ];

    $form['interest'] = [
      '#type' => 'select',
      '#title' => $this->t('Select Area of Interest'),
      '#options' => $this->getInterestOptions($form_state->getValue('degree_level') ?: NULL),
      '#ajax' => [
        'callback' => [$this, 'ajaxFormCallback'],
        'wrapper' => 'cost-calculator-wrapper',
        // 'progress' => 'none',
      ],
    ];

    $form['program'] = [
      '#type' => 'select',
      '#title' => $this->t('Select Program'),
      '#options' => $this->getProgramOptions($form_state->getValue('degree_level') ?: NULL, $form_state->getValue('interest') ?: NULL),
    ];

    $form['military'] = [
      '#type' => 'checkbox',
      '#title' => $this->t('I\'m active-duty military or spouse.'),
    ];

    if ($this->currentPage !== 1) {
      $form['back'] = [
        '#type' => 'submit',
        '#value' => $this->t('Back'),
      ];
    }

    if ($this->currentPage !== $this->totalPages) {
      $form['submit'] = [
        '#type' => 'submit',
        '#value' => $this->t('Next'),
      ];
    }

    return $form;
  }

  /**
   * {@inheritdoc}
   */
  public function submitForm(array &$form, FormStateInterface $form_state) {
  }

  /**
   * Callback for party checkbox.
   */
  public function ajaxFormCallback(array $form, FormStateInterface $form_state) {
    return $form;
  }

  /**
   * Get the Degree Options.
   */
  public function getDegreeLevelOptions() {
    $program_list = $this->getProgramListing();
    $options = [];
    foreach ($program_list as $item) {
      // Skip 'Certificates & Courses'.
      if (!in_array($item->levelDescription, $options) && $item->levelDescription !== 'Certificates & Courses') {
        $options[$item->levelDescription] = $item->levelDescription;
      }
    }
    asort($options);
    $options = ['' => $this->t('Select')] + $options;
    return $options;
  }

  /**
   * Get the Interest Options.
   */
  public function getInterestOptions($degree_level = NULL) {
    $options = [];
    if (!empty($degree_level)) {
      $program_list = $this->getProgramListing();

      foreach ($program_list as $item) {
        // Skip levelCode UC.
        if (
          !in_array($item->areaOfInterest, $options) &&
          $degree_level === $item->levelDescription &&
          $item->levelCode !== 'UC'
        ) {
          $options[$item->areaOfInterest] = $item->areaOfInterest;
        }
      }
      asort($options);
    }
    $options = ['' => $this->t('Select')] + $options;
    return $options;
  }

  /**
   * Get the Program Options.
   */
  public function getProgramOptions($degree_level = NULL, $interest = NULL) {
    $program_list = $this->getProgramListing();
    $options = [];
    foreach ($program_list as $item) {
      // Skip levelCode UC.
      if (
        !in_array($item->programName, $options) &&
        $degree_level === $item->levelDescription &&
        $interest === $item->areaOfInterest &&
        $item->levelCode !== 'UC'
      ) {
        $options[$item->programCode] = $item->programName;
      }
    }
    asort($options);
    $options = ['' => $this->t('Select')] + $options;
    return $options;
  }

  /**
   * Get the Program Listing.
   */
  public function getProgramListing() {
    if (empty($this->programListing)) {
      $path = $this->buildPathRequest('sf/ProgramListingController');
      $response = $this->uMassService->fetchUmassGlobalAPI($path);
      $this->programListing = $response->programList;
    }

    return $this->programListing;
  }

  /**
   * Build Path for request api.
   */
  public function buildPathRequest(string $path = '', array $args = []) {
    return 'ProgramCampusService/api/' . $path;
  }

}
