/**
 * @file
 * This is the controller for the search result application.
 *
 * It simply updated the view when hits have been received.
 */

angular.module('searchResultApp').controller('resultController', ['CONFIG', 'communicatorService', '$scope',
  function (CONFIG, communicatorService, $scope) {
    'use strict';

    // Set template to use.
    $scope.template = CONFIG.templates.result;


    // Check if the provider supports an pager.
    if (CONFIG.provider.hasOwnProperty('pager')) {
      // Add pager information to the scope.
      $scope.pager = angular.copy(CONFIG.provider.pager);
    }

    /**
     * Update pager information.
     */
    $scope.search = function search() {
      communicatorService.$emit('pager', $scope.pager);
    };

    $scope.hits = [];
    communicatorService.$on('hits', function (event, data) {
      console.log(data.hits);
      $scope.$apply(function() {
        $scope.hits = data.hits;
      });
    });

    communicatorService.$on('pager', function (event, data) {
      $scope.$apply(function() {
        $scope.pager = data;
      });
    });
  }
]);
