<?php

namespace Drupal\senior_portal\Plugin\Block;

use Drupal\Core\Block\BlockBase;
use Drupal\Core\Form\FormStateInterface;
use Drupal\Core\Plugin\ContainerFactoryPluginInterface;
use Symfony\Component\DependencyInjection\ContainerInterface;

/**
 * Provides a 'CostCalculatorBlock' block.
 *
 * @Block(
 *  id = "umass_cost_calculator",
 *  admin_label = @Translation("UMass cost calculator"),
 * )
 */
class CostCalculatorBlock extends BlockBase implements ContainerFactoryPluginInterface {

  /**
   * The uMass Service.
   *
   * @var \Drupal\umass_api\UmassApiManager
   */
  protected $uMassService;

  /**
   * The 'form_builder' service.
   *
   * @var \Drupal\Core\Form\FormBuilderInterface
   */
  protected $formBuilder;

  /**
   * Entity type manager service.
   *
   * @var \Drupal\Core\Entity\EntityTypeManagerInterface
   */
  protected $entityTypeManager;

  /**
   * The current route match.
   *
   * @var \Drupal\Core\Routing\CurrentRouteMatch
   */
  protected $currentRouteMatch;

  /**
   * The admin context.
   *
   * @var \Drupal\Core\Routing\AdminContext
   */
  protected $adminContext;

  /**
   * {@inheritdoc}
   */
  public static function create(ContainerInterface $container, array $configuration, $plugin_id, $plugin_definition) {
    $instance = new static(
      $configuration,
      $plugin_id,
      $plugin_definition
    );

    $instance->formBuilder = $container->get('form_builder');
    $instance->entityTypeManager = $container->get('entity_type.manager');
    $instance->currentRouteMatch = $container->get('current_route_match');
    $instance->adminContext = $container->get('router.admin_context');

    return $instance;
  }

  /**
   * {@inheritdoc}
   */
  public function defaultConfiguration() {
    return [
      'label_display' => TRUE,
    ];
  }

  /**
   * {@inheritdoc}
   */
  public function blockForm($form, FormStateInterface $form_state) {
    // Scholarships, Grants, and Employer Benefits.
    // Table.
    $form['sge_fieldset'] = [
      '#type' => 'fieldset',
      '#required' => TRUE,
      '#title' => $this->t('Scholarships, Grants, and Employer Benefits'),
    ];
    $form['sge_fieldset']['sge'] = [
      '#type' => 'table',
      '#header' => [
        $this->t('Name'),
        $this->t('Amount'),
        $this->t('Operations'),
      ],
      '#prefix' => '<div id="sge-wrapper">',
      '#suffix' => '</div>',
    ];
    // Rows count.
    if (!$sge_rows = $form_state->get('sge_rows')) {
      $sge_rows = !empty($this->configuration['sge']) ? count($this->configuration['sge']) : 1;
      $form_state->set('sge_rows', $sge_rows);
    }
    // Build the table rows and columns.
    for ($i = 0; $i < $sge_rows; $i++) {
      $form['sge_fieldset']['sge'][$i]['name'] = [
        '#type' => 'textfield',
        '#required' => TRUE,
        '#default_value' => $this->configuration['sge'][$i]['name'] ?? '',
      ];
      $form['sge_fieldset']['sge'][$i]['amount'] = [
        '#type' => 'number',
        '#required' => TRUE,
        '#default_value' => $this->configuration['sge'][$i]['amount'] ?? '',
      ];
      $form['sge_fieldset']['sge'][$i]['op'] = [
        '#type' => 'submit',
        '#name' => $i . '-row',
        '#value' => $this->t('Remove'),
        '#name' => 'remove_sge_' . $i,
        '#disabled' => $sge_rows <= 1,
        '#data' => ['sge', 'sge_rows', 'sge_fieldset'],
        '#submit' => [[$this, 'removeSubmit']],
        '#limit_validation_errors' => [],
        '#ajax' => [
          'callback' => [$this, 'addRemoveCallback'],
          'wrapper' => 'sge-wrapper',
        ],
      ];
    }
    $form['sge_fieldset']['add_another'] = [
      '#type' => 'submit',
      '#value' => $this->t('Add another custom benefit'),
      '#name' => 'add_another_sge',
      '#data' => ['sge', 'sge_rows', 'sge_fieldset'],
      '#submit' => [[$this, 'addAnotherSubmit']],
      '#limit_validation_errors' => [],
      '#ajax' => [
        'callback' => [$this, 'addRemoveCallback'],
        'wrapper' => 'sge-wrapper',
      ],
    ];

    // Fieldset for Apply Now URL.
    $form['apply_now_url_fieldset'] = [
      '#type' => 'fieldset',
      '#title' => $this->t('Apply Now URL'),
      '#description' => $this->t('Configure the Apply Now link as an internal path or an external URL.'),
    ];

    // Radio buttons to switch between internal and external URL.
    $form['apply_now_url_fieldset']['apply_now_url_type'] = [
      '#type' => 'radios',
      '#title' => $this->t('Select URL Type'),
      '#options' => [
        'internal' => $this->t('Internal Path'),
        'external' => $this->t('External URL'),
      ],
      '#default_value' => (!empty($this->configuration['apply_now_url']) && preg_match('/^https?:\/\//', $this->configuration['apply_now_url'])) ? 'external' : 'internal',
    ];

    // Wrapper to toggle between internal and external URL fields.
    $form['apply_now_url_fieldset']['apply_now_url_wrapper'] = [
      '#type' => 'container',
      '#attributes' => ['id' => 'apply-now-url-wrapper'],
    ];

    // Internal URL field.
    $form['apply_now_url_fieldset']['apply_now_url_wrapper']['apply_now_url_internal'] = [
      '#type' => 'entity_autocomplete',
      '#title' => $this->t('Internal Path'),
      '#target_type' => 'node',
      '#selection_handler' => 'default',
      '#default_value' => (!empty($this->configuration['apply_now_url']) && !preg_match('/^https?:\/\//', $this->configuration['apply_now_url']))
        ? $this->entityTypeManager->getStorage('node')->load($this->configuration['apply_now_url'])
        : NULL,
      '#states' => [
        'visible' => [
          ':input[name="settings[apply_now_url_fieldset][apply_now_url_type]"]' => ['value' => 'internal'],
        ],
        'required' => [
          ':input[name="settings[apply_now_url_fieldset][apply_now_url_type]"]' => ['value' => 'internal'],
        ],
      ],
    ];

    // External URL field.
    $form['apply_now_url_fieldset']['apply_now_url_wrapper']['apply_now_url_external'] = [
      '#type' => 'textfield',
      '#title' => $this->t('External URL'),
      '#default_value' => (isset($this->configuration['apply_now_url']) && preg_match('/^https?:\/\//', $this->configuration['apply_now_url']))
        ? $this->configuration['apply_now_url']
        : '',
      '#element_validate' => [
        [$this, 'validateExternalUrl'],
      ],
      '#states' => [
        'visible' => [
          ':input[name="settings[apply_now_url_fieldset][apply_now_url_type]"]' => ['value' => 'external'],
        ],
        'required' => [
          ':input[name="settings[apply_now_url_fieldset][apply_now_url_type]"]' => ['value' => 'external'],
        ],
      ],
    ];

    // Disclaimer Fieldset.
    $form['bottom_text_fieldset'] = [
      '#type' => 'fieldset',
      '#required' => TRUE,
      '#title' => $this->t('Disclaimer Settings'),
      '#description' => $this->t('Configure the text displayed at the bottom of the block.'),
    ];

    $form['bottom_text_fieldset']['bottom_slider_text'] = [
      '#type' => 'text_format',
      '#title' => $this->t('Transfer Credit Disclaimer Text'),
      '#required' => TRUE,
      '#description' => $this->t('Enter text to display at the bottom of the Transfer Credit section. Supports basic HTML formatting.'),
      '#default_value' => $this->configuration['bottom_slider_text']['value'] ?? '',
    // Default text format.
      '#format' => $this->configuration['bottom_slider_text']['format'] ?? 'basic_html',
    ];

    $form['bottom_text_fieldset']['bottom_text'] = [
      '#type' => 'text_format',
      '#title' => $this->t('General Disclaimer Text'),
      '#required' => TRUE,
      '#description' => $this->t('Enter text to display at the bottom of the Cost Calculator block. Supports basic HTML formatting.'),
      '#default_value' => $this->configuration['bottom_text']['value'] ?? '',
    // Default text format.
      '#format' => $this->configuration['bottom_text']['format'] ?? 'basic_html',
    ];

    return $form;
  }

  /**
   * Custom validation for external URL.
   */
  public function validateExternalUrl(array &$element, FormStateInterface $form_state, array &$form) {
    if ($form_state->getValues()['settings']['apply_now_url_fieldset']['apply_now_url_type'] === 'external') {
      $url = $form_state->getValues()['settings']['apply_now_url_fieldset']['apply_now_url_wrapper']['apply_now_url_external'];
      if (!empty($url) && !preg_match('/^https?:\/\/.+/', $url)) {
        $form_state->setError($element, $this->t('Please enter a valid external URL starting with http:// or https://.'));
      }
    }
  }

  /**
   * Callback for add another button.
   */
  public function addRemoveCallback(array &$form, FormStateInterface $form_state) {
    $name = $form_state->getTriggeringElement()['#data'][0];
    $parent_wrapper = $form_state->getTriggeringElement()['#data'][2];
    return $form['settings'][$parent_wrapper][$name];
  }

  /**
   * Submit handler for the "Add another" button.
   *
   * Increments the counter and causes a rebuild.
   */
  public function addAnotherSubmit(array &$form, FormStateInterface $form_state) {
    $name = $form_state->getTriggeringElement()['#data'][1];
    // Increase number of rows count.
    $rows = $form_state->get($name);
    $form_state->set($name, $rows + 1);

    // Rebuild form.
    $form_state->setRebuild();
  }

  /**
   * Submit handler for the "Remove" button.
   */
  public function removeSubmit(array &$form, FormStateInterface $form_state) {
    $name = $form_state->getTriggeringElement()['#data'][0];
    $row_name = $form_state->getTriggeringElement()['#data'][1];
    $parent_wrapper = $form_state->getTriggeringElement()['#data'][2];
    // Get the row id of the remove input.
    $row_id = $form_state->getTriggeringElement()['#parents'][1];

    // Remove the row from the user input and reindex data.
    $input = $form_state->getUserInput();
    unset($input['settings'][$parent_wrapper][$name][$row_id]);
    $input['settings'][$parent_wrapper][$name] = array_values($input['settings'][$parent_wrapper][$name]);

    // Update user input and data object.
    $form_state->setUserInput($input);

    // Decrease number of rows count.
    $rows = $form_state->get($row_name);
    $form_state->set($row_name, $rows - 1);

    // Rebuild form state.
    $form_state->setRebuild();
  }

  /**
   * {@inheritdoc}
   */
  public function blockSubmit($form, FormStateInterface $form_state) {
    $values = $form_state->getValues();

    // Scholarships, Grants, Employer Benefits.
    $sge = [];
    foreach ($values['sge_fieldset']['sge'] as $item) {
      if (empty($item['name']) || empty($item['amount'])) {
        continue;
      }
      $sge[] = [
        'name' => $item['name'],
        'amount' => $item['amount'],
      ];
    }

    // Apply Now URL.
    $url_type = $values['apply_now_url_fieldset']['apply_now_url_type'] ?? 'internal';
    if ($url_type === 'internal') {
      $this->configuration['apply_now_url'] = $values['apply_now_url_fieldset']['apply_now_url_wrapper']['apply_now_url_internal'] ?? '';
    }
    else {
      $external_url = trim($values['apply_now_url_fieldset']['apply_now_url_wrapper']['apply_now_url_external'] ?? '');
      if (!empty($external_url) && preg_match('/^https?:\/\//', $external_url)) {
        $this->configuration['apply_now_url'] = $external_url;
      }
      else {
        $this->configuration['apply_now_url'] = '';
      }
    }

    // Transfer Credit Disclaimer Text.
    $this->configuration['bottom_slider_text'] = [
      'value' => $values['bottom_text_fieldset']['bottom_slider_text']['value'] ?? '',
      'format' => $values['bottom_text_fieldset']['bottom_slider_text']['format'] ?? 'basic_html',
    ];

    // General Disclaimer Text.
    $this->configuration['bottom_text'] = [
      'value' => $values['bottom_text_fieldset']['bottom_text']['value'] ?? '',
      'format' => $values['bottom_text_fieldset']['bottom_text']['format'] ?? 'basic_html',
    ];

    // Save SGE configurations.
    $this->configuration['sge'] = $sge;
  }

  /**
   * Implements \Drupal\block\BlockBase::blockBuild().
   *
   * {@inheritdoc}
   */
  public function build() {
    // Render React app inside a div with an ID.
    $build = [
      '#markup' => '<div id="cost-calculator-app"></div>',
      '#attached' => [
        'library' => ['senior_portal/main'],
      ],
    ];


    // Check if we're on a node page and get the degree devel and program code.
    $degree_level = NULL;
    $program_code = NULL;
    $node = $this->currentRouteMatch->getParameter('node');

    // Get the program node that is referenced from field_program.
    if ($node !== NULL && $node->bundle() !== 'program' && $node->hasField('field_program')) {
      $node = $node->field_program->entity;
    }

    if (
      $node !== NULL &&
      $node->hasField('field_program_code') &&
      !$node->field_program_code->isEmpty() &&
      $node->hasField('field_degree_type') &&
      !$node->field_degree_type->isEmpty()
    ) {
      $degree_type_tax = $node->field_degree_type->entity;

      if (!empty($degree_type_tax)) {
        $degree_level = $degree_type_tax->label();
      }

      $program_code = $node->field_program_code->value;
    }

    // Add the degree_level to drupalSettings.
    if ($degree_level) {
      $build['#attached']['drupalSettings']['umass_calculator'] = [
        'degree_level' => $degree_level,
        'program_code' => $program_code,
      ];

    }

    $build['#attached']['drupalSettings']['umass_calculator']['is_admin'] = $this->adminContext->isAdminRoute();

    return $build;
  }

}
