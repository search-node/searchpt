
/**
 * @file
 * Defines the Angular JS application.
 */

// Define the angular applications.
var searchBoxApp = angular.module('searchBoxApp', ['communicationService', 'searchAppConfig', 'angular-cache']);
var searchResultApp = angular.module('searchResultApp', ['communicationService', 'searchAppConfig']);

/**
 * When the document is ready bootstrap the two applications.
 */
angular.element(document).ready(function() {
  // Bootstrap the search result area. This has to be booted first to ensure
  // that it's ready for events from the search box bootstrap process.
  var result = document.getElementById("searchResultApp");
  if (result) {
    angular.bootstrap(result, ['searchResultApp']);
  }

  // Bootstrap search box.
  var box = document.getElementById("searchBoxApp");
  if (box) {
    angular.bootstrap(box, ['searchBoxApp']);
  }
});