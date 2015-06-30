/**
 * @file
 *
 */

angular.module('searchBoxApp').controller('boxController', ['CONFIG', 'communicatorService', 'searchProxy', '$scope',
  function (CONFIG, communicatorService, searchProxy, $scope) {

    // Set template to use.
    $scope.template = CONFIG.templates.box;

    $scope.search = function search($query) {
      // Build query based on selections.
      var query = '';

      var hits = searchProxy.search($query);

      communicatorService.$emit('hits', {"hits" : hits});
    }
  }
]);
