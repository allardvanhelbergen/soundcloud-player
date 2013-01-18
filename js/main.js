/**
 * Main script for SoundCloud Player.
 * Author: Allard van Helbergen (allard@vanhelbergen.com)
 */


/**
 * Set custom namespace: SoundCloud Player.
 */
var scp = {};


/**
 * Name of the cookie to store the queue items in.
 * @type {String}
 */
scp.COOKIE_NAME = 'scpQueueItems';

/**
 * The number of search results to return.
 * @type {Number}
 */
scp.NUM_SEARCH_RESULTS = 20;


/**
 * The listening Queue object definition.
 */
scp.Queue = function() {
  this.constructor = scp.Queue;
  this.currentItem = 0;
  this.items = [];
};


/**
 * Removes an item from the queue for the given id.
 * @param  {number} id Id of the item to be removed.
 */
scp.Queue.prototype.dequeue = function(id) {
  this.items.splice(id, 1);
  $('li.queue-item[data-queue-id=' + id + ']').remove();
};


/**
 * Adds an item to the end of the queue.
 * @param {Object} item Item to be added.
 */
scp.Queue.prototype.enqueue = function(item) {
  this.items.push(item);
  var id = this.getLength() - 1;
  var string = '<li class="queue-item" data-queue-id="' + id + '">' +
      '<a href="#" data-type="delete"><i class="icon-remove"></i></a> ' +
      '<a href="#" data-type="play"><i class="icon-play"></i> ' + item.title +
      '</a></li>';
  $('#scp-queue').append(string);
};


/**
 * Returns an item in the queue for the given id.
 * @param  {number} id The id of the item to return.
 * @return {Object|null}    The item.
 */
scp.Queue.prototype.getItem = function(id) {
  return this.items[id];
};


/**
 * Returns the length of the queue.
 * @return {number} The length of the queue.
 */
scp.Queue.prototype.getLength = function() {
  return this.items.length;
};


/**
 * Returns whether the queue is empty or not.
 * @return {Boolean} TRUE: queue is empty. FALSE: queue is not empty.
 */
scp.Queue.prototype.isEmpty = function() {
  return this.getLength() === 0;
};


/**
 * Embeds and starts playing the item for the given id.
 * @param  {number} id The id of the item in the queue.
 */
scp.Queue.prototype.playSound = function(id) {
  $('#scp-player').append('<div class="loader"></div>');
  SC.oEmbed(
      this.getItem(id).permalink_url,
      {auto_play: true, show_comments: false},
      document.getElementById('scp-player'));
};


/**
 * Sets the current value of the queue to a given id.
 * @param {number} id The id to set current to.
 */
scp.Queue.prototype.setCurrent = function(id) {
  this.current = id;

  $('.queue-item').removeClass('current').
      filter('[data-queue-id=' + id + ']').addClass('current');
};


/**
 * Updates the order of the queue to the passed order
 * @param  {array.<string>} newOrder An array of numbers represented as strings.
 */
scp.Queue.prototype.updateOrder = function(newOrder) {
  var newItems = [];

  for (var i = 0, id; id = newOrder[i]; i++) {
    newItems.push(this.items[id]);
  }
  this.items = newItems;
};


/**
 * Resolves a url of a sound and adds it to the queue.
 * @param  {string} url The url of the sound.
 */
scp.processAddForm = function(url) {
  SC.get('/resolve', {url: url}, function(track) {
    scp.queue.enqueue(track);
    scp.writeQueueToCookie();
  });
};


/**
 * Performs a search for a given genre and populates the search results div.
 * @param  {string} genre The genre to search for.
 */
scp.processSearchForm = function(genre) {
  // Empty the results and put in a loader png.
  var $resultsDiv = $('#scp-search-results');
  $resultsDiv.empty().append('<div class="loader"></div>');

  SC.get(
      '/tracks',
      {genres: genre, limit: scp.NUM_SEARCH_RESULTS},
      function(tracks) {
        scp.searchResults = tracks;

        // Empty the results (again...).
        $resultsDiv.empty();

        // Populate the results.
        var $resultsList = $('<ol>');
        for (var i = 0, result; result = scp.searchResults[i]; i++) {
          var resultString = '<li><a href="#" data-result-id="' + i +
              '" >' + result.title + '</a></li>';
          $resultsList.append(resultString);
        }
        $resultsDiv.append($resultsList);
      });
};


/**
 * Fills the queue with ids from the cookie.
 */
scp.fillQueueFromCookie = function() {
  var cookieItems = JSON.parse($.cookie(scp.COOKIE_NAME));

  // Cookies do not guarantee order, so we need to reorder the objects.
  cookieItems.sort(function(a, b) {
    return a.order - b.order;
  });

  for (var i = 0, item; item = cookieItems[i]; i++) {
    SC.get('/tracks/' + item.id, {}, function(track) {
      scp.queue.enqueue(track);
    });
  }
};


/**
 * Writes the items in the queue to a cookie.
 */
scp.writeQueueToCookie = function() {
  var ids = [];
  for (var i = 0, queueItem; queueItem = scp.queue.getItem(i); i++) {
    var cookieItem = {
      order: i,
      id: queueItem.id
    };
    ids.push(cookieItem);
  }
  $.cookie(scp.COOKIE_NAME, JSON.stringify(ids));
};


/**
 * Initiates SoundCloud Player.
 */
scp.init = function() {

  // Initialise client with app credentials.
  SC.initialize({
    client_id: "37332a26669b547a5b2f67c62a10240e"
  });

  // Initialise an empty queue.
  scp.queue = new scp.Queue();

  // Initialise cookie if it doesn't exist or fill the queue if it does.
  if ($.cookie(scp.COOKIE_NAME)) {
    scp.fillQueueFromCookie();
  }

  // Set up listeners.
  $('#scp-queue').
      on('click', 'a[data-type=play]', function(e) {
        e.preventDefault();
        var id = $(this).parent()[0].dataset['queueId'];
        scp.queue.setCurrent(id);
        scp.queue.playSound(id);
      }).
      on('click', 'a[data-type=delete]', function(e) {
        e.preventDefault();
        scp.queue.dequeue($(this).parent()[0].dataset['queueId']);
        scp.writeQueueToCookie();
      });

  $('#scp-add').on('submit', function(e) {
    e.preventDefault();
    scp.processAddForm($(this).find('[name=url]').val());
  });

  $('#scp-search').on('submit', function(e) {
    e.preventDefault();
    scp.processSearchForm($(this).find('[name=genre]').val());
  });

  $('#scp-search-results').on('click', 'a', function(e) {
    e.preventDefault();
    scp.queue.enqueue(scp.searchResults[this.dataset.resultId]);
    scp.writeQueueToCookie();
  });

  // Setup sorting on queue.
  $('#scp-queue').sortable({
    update: function(e, ui) {
      scp.queue.updateOrder(
          $(this).sortable('toArray', {'attribute': 'data-queue-id'}));
      scp.writeQueueToCookie();
    }
  });


  // TODO: put if error statements in all SC calls.
  // TODO: fix autoplay next by using widget API instead of oEmbed.
};


// Run when document is ready.
$(document).ready(
  scp.init
);