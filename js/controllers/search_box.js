/**
 * @file
 *
 */

angular.module('searchBoxApp').controller('boxController', ['CONFIG', 'communicatorService', 'searchProxy', '$scope',
  function (CONFIG, communicatorService, searchProxy, $scope) {

    // Set template to use.
    $scope.template = CONFIG.templates.box;

    // Init the query object.
    $scope.query = {
      'text': '',
      'filters': {}
    };


    // Check if filters are defined by the provider.
    if (CONFIG.provider.hasOwnProperty('filters')) {
      $scope.filters = CONFIG.provider.filters;
    }

    $scope.search = function search() {
      // Build query based on selections.

      console.log($scope.query);

      var hits = searchProxy.search($scope.query);

      communicatorService.$emit('hits', {"hits" : hits});
    }
  }
]);
