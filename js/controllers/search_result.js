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

    // Scope variable that can be used to make indications on the current
    // process. E.g display spinner.
    $scope.searching = false;

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

    /**
     * Hanled search results hits from the search box application.
     */
    $scope.hits = [];
    communicatorService.$on('hits', function (event, data) {
      var phase = this.$root.$$phase;
      if (phase === '$apply' || phase === '$digest') {
        $scope.hits = data.hits;
        $scope.searching = false;
      }
      else {
        $scope.$apply(function () {
          $scope.hits = data.hits;
          $scope.searching = false;
        });
      }
    });

    /**
     * Hanled searching message, send when search is called.
     */
    communicatorService.$on('searching', function (event, data) {
      var phase = this.$root.$$phase;
      if (phase === '$apply' || phase === '$digest') {
        $scope.searching = true;
      }
      else {
        $scope.$apply(function () {
          $scope.searching = true;
        });
      }
    });

    /**
     * Handled pager updates.
     */
    communicatorService.$on('pager', function (event, data) {
      var phase = this.$root.$$phase;
      if (phase === '$apply' || phase === '$digest') {
        $scope.pager = data;
      }
      else {
        $scope.$apply(function () {
          $scope.pager = data;
        });
      }
    });
  }
]);
