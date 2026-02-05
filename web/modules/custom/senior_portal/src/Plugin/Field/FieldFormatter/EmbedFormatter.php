<?php

namespace Drupal\senior_portal\Plugin\Field\FieldFormatter;

use Drupal\Core\Field\FieldItemListInterface;
use Drupal\Core\Field\FormatterBase;

/**
 * Plugin implementation of the 'embed_formatter'.
 *
 * @FieldFormatter(
 *   id = "embed_formatter",
 *   label = @Translation("Embed Code Renderer"),
 *   field_types = {
 *     "text",
 *     "text_long",
 *     "text_with_summary",
 *     "string",
 *     "string_long"
 *   }
 * )
 */
class EmbedFormatter extends FormatterBase {

  /**
   * {@inheritdoc}
   */
  public function viewElements(FieldItemListInterface $items, $langcode) {

    $elements = [];

    foreach ($items as $delta => $item) {

      $embed_code = $item->value;

      // Render as inline HTML (embed).
      $elements[$delta] = [
        '#type' => 'inline_template',
        '#template' => '{{ embed|raw }}',
        '#context' => [
          'embed' => $embed_code,
        ],
      ];
    }

    return $elements;
  }

}
