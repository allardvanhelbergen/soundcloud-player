<?php

/**
 * Name of the cookie to store the queue items in.
 * @type {String}
 */
$_COOKIE_NAME = 'scpQueueItems';

$url = $_POST['url'];

// TODO: resolve url into id and title.

if (isset($_COOKIE[$_COOKIE_NAME])) {
  $value = $_COOKIE[$_COOKIE_NAME];
  // TODO: add id to the end of value with appropriate order.
  $value += '{id: ' . $id . ', order: ' . $order . '}'
} else {
  $value = '{id: ' . $id . ', order: 0}'
}
setcookie($_COOKIE_NAME, $value);

// TODO: escape title

?>
{title: '<?php $title?>'}