/**
 * @file
 * Dummy search provider that reads the search results from a JSON file.
 */

/**
 * Search provider for JSON files.
 */
angular.module('searchBoxApp').service('jsonProvider', ['CONFIG', '$q', '$http',
  function (CONFIG, $q, $http) {
    'use strict';

    // Load JSON file based on configuration.
    var data = [];
    $http.get(CONFIG.provider.data)
      .then(function(res){
        data = res.data;
      });

    /**
     * The filters available.
     *
     * @returns json array.
     */
    this.getFilters = function getFilters() {
      return {
        'tags': {
          'name': 'Tags',
          'type': 'and',
          'items': [
            {
              'name': 'Angular',
              'value': 'angular'
            },
            {
              'name': 'Developer',
              'value': 'developer'
            },
            {
              'name': 'Javascript',
              'value': 'javascript'
            },
            {
              'name': 'Chrome',
              'value': 'chrome'
            }
          ]
        },
        'levels':{
          'name': 'Levels (or)',
          'type': 'or',
          'items': [
            {
              'name': 'First',
              'value': 1
            },
            {
              'name': 'Second',
              'value': 2
            },
            {
              'name': 'Third',
              'value': 3
            },
            {
              'name': 'Fourth',
              'value': 4
            }
          ]
        }
      };
    };

    /**
     * Search function to query the json data.
     *
     * @param query
     *   The query parameters to search
     *
     * @returns {Array}
     *   The hits found.
     */
    this.search = function query(query) {
      var self = this;
      var hits = angular.copy(data);

      var deferred = $q.defer();

      // Search title.
      if (query.text !== '') {
        hits = JSON.search(data, '//*[contains(title, "' + query.text + '")]');
      }

      // Search filters.
      angular.forEach(query.filters, function (filter, name) {
        // Get search type 'or' or 'and'.
        var type = self.getFilters();
        var xp = false;

        angular.forEach(filter, function (enabled, value) {
          if (enabled) {
            if (type == 'or') {
              // Or type search needs to build and xpath expression for all items
              // in the filter.
              if (xp === false) {
                xp = '//*[' + name + '="' + value + '"]';
              }
              else {
                xp += '|//*[' + name + '="' + value + '"]';
              }
            }
            else {
              // "And" type search simply limites the results.
              hits = JSON.search(hits, '//*[' + name + '="' + value + '"]');
            }
          }
        });

        // After all other search apply the "or" search expression.
        if (type == 'or' && xp) {
          hits = JSON.search(hits, xp);
        }
      });

      // This may seem strange, but it's to keep up with the way search node
      // works. So it makes sens to return an resolve the promise just after
      // each other.
      deferred.resolve({
        'hits': hits.length,
        'results': hits
      });

      return deferred.promise;
    };
  }
]);