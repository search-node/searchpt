/**
 * @file
 * Search proxy.
 *
 * Allows the framework to use different search back-ends based on
 * configuration settings.
 */

/**
 * Search proxy is used to send search requests to the configured provide.
 */
angular.module('searchBoxApp').service('searchProxy', ['CONFIG', 'communicatorService', '$injector',
  function (CONFIG, communicatorService, $injector) {
    'use strict';

    // Load provider based on configuration.
    var provider = $injector.get(CONFIG.provider.service);

    /**
     * Search the provider loaded.
     *
     * This simply forwards the search request to the provider loaded.
     *
     * @param query
     *   The search query.
     *
     * @returns {Number|*|Object}
     *   The search result.
     */
    this.search = function query(query) {
      return provider.search(query);
    }
  }
]);
