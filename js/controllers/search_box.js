/**
 * @file
 * This is the main controller for the application.
 *
 * It controls the search box and filters.
 */

angular.module('searchBoxApp').controller('boxController', ['CONFIG', 'communicatorService', 'searchProxy', '$scope',
  function (CONFIG, communicatorService, searchProxy, $scope) {
    'use strict';

    /**
     * Execute the search and emit the results.
     */
    function search() {
      searchProxy.search($scope.query).then(
        function (data) {
          // Updated filters.
          searchProxy.getFilters().then(
            function (filters) {
              $scope.filters = filters;
            },
            function (reason) {
              console.error(reason);
            }
          );

          // Send results.
          communicatorService.$emit('hits', {"hits" : data});
        },
        function (reason) {
          console.error(reason);
        }
      );
    }

    /**
     * Initials this controller and configure the basic scope.
     */
    function init() {
      // Get state from pervious searches.
      var state = searchProxy.init();

      // Get filters.
      $scope.filters = state.filters;

      // Set template to use.
      $scope.template = CONFIG.templates.box;

      // Init the query object.
      $scope.query = {
        'text': '',
        'filters': {}
      };

      // Check if any intervals have been configured.
      if (CONFIG.provider.hasOwnProperty('intervals')) {
        $scope.intervals = CONFIG.provider.intervals;
        $scope.query.intervals = {};
      }

      // Check if any search query have been located from the hash tag.
      if (state.hasOwnProperty('query')) {
        // Query found in state, so execute that search.
        $scope.query = state.query;
        search();
      }
      else {
        // Check if the provider supports an pager.
        if (CONFIG.provider.hasOwnProperty('pager')) {
          // Add pager information to the search query.
          $scope.query.pager = angular.copy(CONFIG.provider.pager);
        }

        // Check if an inital search should be executed.
        if (CONFIG.hasOwnProperty('initialQueryText')) {
          $scope.query.text = angular.copy(CONFIG.initialQueryText);

          // Execture the search.
          search();
        }
        else {
          // Get filters based on search content (maybe slow).
          searchProxy.getFilters().then(
            function (filters) {
              $scope.filters = filters;
            },
            function (reason) {
              console.error(reason);
            }
          );
        }
      }

      $scope.$watch('query.text');
    }

    /**
     * Communication lister for pager changes from the search results
     * application.
     */
    communicatorService.$on('pager', function (event, data) {
      $scope.query.pager = {
        'size': data.size,
        'page': data.page
      };
      search();
    });

    /**
     * Search click handler.
     *
     * Simple wrapper for search that reest the pager before executing the
     * searh.
     */
    $scope.searchClicked = function searchClicked() {
      // Reset pager.
      if ($scope.query.hasOwnProperty('pager')) {
        $scope.query.pager = angular.copy(CONFIG.provider.pager);
      }

      search();
    };

    /**
     * Handles auto complete in the search box.
     */
    $scope.autocomplete = function autocomplete() {
      searchProxy.autocomplete($scope.query).then(
        function (strings) {
          console.log(strings);
        },
        function (reason) {
          console.error(reason);
        }
      );
    }

    // Get set show on the road.
    init();
  }
]);
