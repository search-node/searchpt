/**
 * @file
 *
 */


angular.module('searchResultApp').controller('resultController', ['CONFIG', 'communicatorService', '$scope',
  function (CONFIG, communicatorService, $scope) {

    // Set template to use.
    $scope.template = CONFIG.templates.result;

    $scope.hits = [];
    communicatorService.$on('hits', function (event, data) {
      $scope.$apply(function() {
        $scope.hits = data.hits;
      });
      console.log($scope.hits);
    });
  }
]);