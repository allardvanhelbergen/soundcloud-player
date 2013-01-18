/**
 * SoundCloud bookmarklet script. Adds the current url to the queue by writing
 * it to the queue cookie.
 *
 * Author: Allard van Helbergen (allard@vanhelbergen.com)
 */


/**
 * Namespace for the SoundCloud player bookmarklet.
 * @type {Object}
 */
var scp = {};


/**
 * Url to submit the AJAX call to.
 * @type {String}
 */
scp.SUBMIT_URL = 'http://www.vanhelbergen.com/labs/soundcloud-player/submit.php';


/**
 * Makes a call to the backend to store the cookie.
 */
scp.run = function() {
  var currentLocation = location.href;
  // TODO: check if valid SoundCloud url, else throw error.
  $.post(scp.SUBMIT_URL, {url: currentLocation}, function(data) {
    // TODO: display success message with title passed back from backend.
  });
};


// Load jQuery if it doesn't exist.
if (!window.jQuery) {
  var jQueryScript = document.createElement('script');
  jQueryScript.src = 'https://ajax.googleapis.com/ajax/libs/jquery/1.7.2/jquery.min.js';
  jQueryScript.onload = scp.run;
  document.body.appendChild(jQueryScript);
} else {
  scp.run();
}