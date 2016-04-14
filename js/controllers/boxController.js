/**
 * @file
 * This is the main controller for the application.
 *
 * It controls the search box and filters.
 */

angular.module('searchBoxApp').controller('boxController', ['CONFIG', 'communicatorService', 'searchProxyService', '$scope',
  function (CONFIG, communicatorService, searchProxyService, $scope) {
    'use strict';

    /**
     * Execute the search and emit the results.
     */
    function search() {
      // Send info to results that a new search have started.
      communicatorService.$emit('searching', {});

      // Add sorting to the search query. It's added here to make it possible to
      // override or add sorting in search queries from the UI. If it was added
      // in the provider it would limit further sorting from the UI.
      if (CONFIG.provider.hasOwnProperty('sorting')) {
        $scope.query.sort = {};
        $scope.query.sort[CONFIG.provider.sorting.field] = CONFIG.provider.sorting.order;
      }

      // Start the search request.
      searchProxyService.search($scope.query).then(
        function (data) {
          // Updated filters.
          searchProxyService.getFilters().then(
            function (filters) {
              $scope.filters = filters;
            },
            function (reason) {
              console.error(reason);
            }
          );

          // Send results.
          communicatorService.$emit('hits', {"hits": data});
        },
        function (reason) {
          console.error(reason);
        }
      );
    }

    /**
     * Initialize the controller and configure the basic scope.
     */
    function init() {
      // Get state from previous search.
      var state = searchProxyService.getState();

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

      // Check if any dates have been configured.
      if (CONFIG.provider.hasOwnProperty('dates')) {
        $scope.dates = CONFIG.provider.dates;
        $scope.query.dates = {};
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

        // Check if an initial search should be executed.
        if (CONFIG.hasOwnProperty('initialQueryText')) {
          $scope.query.text = angular.copy(CONFIG.initialQueryText);

          // Execute the search.
          search();
        }
        else {
          // Get filters based on search content (maybe slow).
          searchProxyService.getFilters().then(
            function (filters) {
              $scope.filters = filters;
            },
            function (reason) {
              console.error(reason);
            }
          );
        }
      }
    }

    /**
     * Updated search based on pager.
     */
    function pagerUpdated(data) {
      $scope.query.pager = {
        'size': data.size,
        'page': data.page
      };
      search();
    }

    /**
     * Communication listener for pager changes from the search results
     * application.
     */
    communicatorService.$on('pager', function (event, data) {
      var phase = this.$root.$$phase;
      if (phase === '$apply' || phase === '$digest') {
        pagerUpdated(data);
      }
      else {
        $scope.$apply(function () {
          pagerUpdated(data);
        });
      }
    });

    /**
     * Search click handler.
     *
     * Simple wrapper for search that resets the pager before executing the
     * search.
     */
    $scope.searchClicked = function searchClicked() {
      // Reset pager.
      if ($scope.query.hasOwnProperty('pager')) {
        $scope.query.pager = angular.copy(CONFIG.provider.pager);
      }

      search();
    };

    /**
     * Auto-complete callback.
     */
    $scope.autocomplete = function autocomplete() {
      if (CONFIG.provider.hasOwnProperty('autocomplete')) {
        $scope.autocompleteString = '';
        if ($scope.query.text.length >= CONFIG.provider.autocomplete.minChars) {
          searchProxyService.autocomplete($scope.query.text).then(
            function (data) {
              if (data.hits) {
                // Use regex to ensure cases (letters) are matched.
                var re = new RegExp('^' + $scope.query.text, 'i');
                var res = data.results[0][CONFIG.provider.autocomplete.field];
                $scope.autocompleteString = res.replace(re, $scope.query.text);
              }
              else {
                $scope.autocompleteString = '';
              }
            },
            function (reason) {
              console.error(reason);
            }
          );
        }
      }
    };

    // Get the show on the road.
    init();
  }
]);
