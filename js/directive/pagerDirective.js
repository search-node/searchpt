/**
 * @file
 * Paging directive.
 */

/**
 * Paging directive.
 */
angular.module('searchResultApp').directive('searchPager', ['CONFIG',
  function (CONFIG) {
    'use strict';

    return {
      restrict: 'E',
      replace: true,
      scope: true,
      controller: function ($scope) {

        /**
         * Click handler to change page.
         *
         * @param page
         */
        $scope.changePage = function changePage(page) {
          $scope.pager.page = page;
          $scope.search();
        };

        $scope.prevPage = function prevPage() {
          if ($scope.pager.page > 0) {
            $scope.pager.page--;
            $scope.search();
          }
        };

        $scope.nextPage = function nextPage() {
          if ($scope.pager.page < $scope.pager.max - 1) {
            $scope.pager.page++;
            $scope.search();
          }
        };

        // Keep an any on changes in number of hits.
        $scope.$watch('hits', function (hits) {
          var hits = $scope.hits.hits;
          var pages = [];
          $scope.pager.max = 0;
          if (hits > $scope.pager.size) {
            $scope.pager.max = Math.ceil(hits / $scope.pager.size);
            for (var i = 0; i < $scope.pager.max; i++) {
              pages.push(i);
            }
          }
          $scope.pager.pages = pages;
        });
      },
      templateUrl: CONFIG.templates.pager
    };
  }
]);
