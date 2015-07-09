/**
 * @file
 * This is the main controller for the application.
 *
 * It controls the search box and filters.
 */

angular.module('searchBoxApp').controller('boxController', ['CONFIG', 'communicatorService', 'searchProxy', '$scope',
  function (CONFIG, communicatorService, searchProxy, $scope) {
    'use strict';

    // Set template to use.
    $scope.template = CONFIG.templates.box;

    // Init the query object.
    $scope.query = {
      'text': '',
      'filters': {}
    };


    // Check if filters are defined by the provider.
    $scope.filters = searchProxy.getFilters();

    /**
     * Execute the search and emit the results.
     */
    $scope.search = function search() {
      communicatorService.$emit('hits', {"hits" : searchProxy.search($scope.query)});
    }
  }
]);
