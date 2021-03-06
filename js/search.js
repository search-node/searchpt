
/**
 * @file
 * Defines the Angular JS application.
 */

// Define the angular applications.
angular.module('searchBoxApp', ['communicationService', 'searchAppConfig', 'angular-cache', 'ngSanitize']);
angular.module('searchResultApp', ['communicationService', 'searchAppConfig', 'ngSanitize', 'bw.paging']);

/**
 * When the document is ready bootstrap the two applications.
 */
angular.element(document).ready(function ready() {
  "use strict";

  // Bootstrap the search result area. This has to be booted first to ensure
  // that it's ready for events from the search box bootstrap process.
  var result = document.getElementById("searchResultApp");
  if (result) {
    angular.bootstrap(result, ['searchResultApp']);
  }
  else {
    console.error('Unable to bootstrap searchResultApp. Missing HTML tag with id "searchResultApp"');
  }

  // Bootstrap search box.
  var box = document.getElementById("searchBoxApp");
  if (box) {
    angular.bootstrap(box, ['searchBoxApp']);
  }
  else {
    console.error('Unable to bootstrap searchBoxApp. Missing HTML tag with id "searchBoxApp"');
  }
});
