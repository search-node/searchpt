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


    /**
     * Pager search.
     */
    $scope.search = function search() {

    };

    $scope.hits = [];
    communicatorService.$on('hits', function (event, data) {
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