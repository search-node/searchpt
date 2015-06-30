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
    // @TODO: There must be a better way? Maybe ask the search provider for
    //        filters?
    if (CONFIG.provider.hasOwnProperty('filters')) {
      $scope.filters = CONFIG.provider.filters;
    }

    /**
     * Execute the search and emit the results.
     */
    $scope.search = function search() {
      communicatorService.$emit('hits', {"hits" : searchProxy.search($scope.query)});
    }
  }
]);
