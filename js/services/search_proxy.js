/**
 * @file
 * Search service provider.
 *
 * Allows the framework to use different search back-ends.
 */
angular.module('searchBoxApp').service('searchProxy', ['CONFIG', 'communicatorService', '$injector',
  function (CONFIG, communicatorService, $injector) {

    // Load provider based on configuration.
    var provider = $injector.get(CONFIG.provider.service);

    this.search = function query($query) {
      return provider.search($query);
    }
  }
]);
