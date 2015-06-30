
/**
 * @file
 * Defines the Angular JS application.
 */

// Define the angular applications.
var searchBoxApp = angular.module('searchBoxApp', ['communicationService', 'searchAppConfig']);
var searchResultApp = angular.module('searchResultApp', ['communicationService', 'searchAppConfig']);

/**
 * When the document is ready bootstrap the two applications.
 */
angular.element(document).ready(function() {
  // Bootstrap search box.
  var box = document.getElementById("searchBoxApp");
  if (box) {
    angular.bootstrap(box, ['searchBoxApp']);
  }

  // Bootstrap the search result area.
  var result = document.getElementById("searchResultApp");
  if (result) {
    angular.bootstrap(result, ['searchResultApp']);
  }
});