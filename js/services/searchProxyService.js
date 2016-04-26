/**
 * @file
 * Search proxy.
 *
 * Allows the framework to use different search back-ends based on
 * configuration settings.
 */

/**
 * Search proxy is used to send search requests to the configured provider.
 */

angular.module('searchBoxApp').service('searchProxyService', ['CONFIG', 'communicatorService', '$injector', '$location',
  function (CONFIG, communicatorService, $injector, $location) {
    'use strict';

    // Load provider based on configuration.
    var provider = $injector.get(CONFIG.provider.service);

    /**
     * Find the size of given object.
     *
     * @return int
     *   The size of the object or 0 if empty.
     */
    function countProperties(obj) {
      var size = 0;
      for (var key in obj) {
        if (obj.hasOwnProperty(key)) {
          size++;
        }
      }

      return size;
    }

    /**
     * Encode the query object into a string.
     *
     * @param query
     *   The query object.
     *
     * @return string
     *   The encoded string that can been used as hash tag in url.
     */
    function encodeSearchQuery(query) {
      var parts = [];

      // Search text.
      if (query.hasOwnProperty('text') && query.text.length !== 0) {
        parts.push('text=' + encodeURIComponent(query.text));
      }

      // Filters.
      if (query.hasOwnProperty('filters')) {
        for (var type in query.filters) {
          if (countProperties(query.filters[type]) !== 0) {
            var filter = query.filters[type];
            var filterParts = [];
            for (var field in filter) {
              var selected = [];

              // Check if it's a simple boolean filter.
              if (typeof filter[field] === "boolean" && filter[field] === true) {
                filterParts.push(field);
              }
              else {
                // Multi level filters (taxonomy).
                for (var i in filter[field]) {
                  if (filter[field][i] === true) {
                    selected.push(i);
                  }
                }

                // Only add the filter if filter have selections.
                if (selected.length) {
                  filterParts.push(field + ':' + selected.join(';'));
                }
              }
            }

            // Only encode filters if any have be selected.
            if (filterParts.length) {
              parts.push('filters[' + type + ']=' + encodeURIComponent(filterParts.join('?')));
            }
          }
        }
      }

      // Interval search.
      if (query.hasOwnProperty('intervals') && countProperties(query.intervals) !== 0) {
        var intervalParts = [];
        for (var field in query.intervals) {
          var interval = query.intervals[field];
          intervalParts.push(field + ';' + interval.from + ';' + interval.to);
        }
        parts.push('intervals=' + encodeURIComponent(intervalParts.join('?')));
      }

      // Date search.
      if (query.hasOwnProperty('dates') && countProperties(query.dates) !== 0) {
        // @TODO: This is the same as for intervals. Refactor into function or
        // loop over type.
        var dateParts = [];
        for (var field in query.dates) {
            var date = query.dates[field];
          dateParts.push(field + ';' + date.from + ';' + date.to);
        }
        parts.push('dates=' + encodeURIComponent(dateParts.join('?')));
      }

      // Pager page.
      if (query.hasOwnProperty('pager')) {
        parts.push('pager=' + query.pager.page + ':' + query.pager.size);
      }

      return parts.join('&');
    }

    /**
     * Decode the hash tag string into search query object.
     *
     * @param string
     *   The encode string that can be used as hash tag in url.
     *
     * @return object
     *   Search query object.
     */
    function decodeSearchQuery(string) {
      var query = {};

      // Get parts.
      var parts = string.split('&');
      for (var part in parts) {
        // Decode the type identifier.
        var subParts = parts[part].split('=');
        var type = decodeURIComponent(subParts[0]);
        if (type.indexOf('[') !== -1) {
          type = type.substr(0, type.indexOf('['));
        }

        switch (type) {
          case 'text':
            query.text = decodeURIComponent(subParts[1]);
            break;

          case 'filters':
            var str = decodeURIComponent(subParts[0]);
            var filterType = str.substr(str.indexOf('[') + 1).slice(0, -1);
            var filters = decodeURIComponent(subParts[1]).split('?');

            if (filters.length) {
              // Initialize the filters on the query object.
              if (!query.hasOwnProperty('filters')) {
                query.filters = {
                  'taxonomy': {},
                  'boolean': {}
                };
              }

              for (var i in filters) {
                switch (filterType) {
                  case 'taxonomy':
                    var filter = filters[i].split(':');
                    // Reduce the array values into an object.
                    query.filters[filterType][filter[0]] = filter[1].split(';').reduce(function (obj, val, index) {
                      obj[val] = true;
                      return obj;
                    }, {});
                    break;

                  case 'boolean':
                    query.filters[filterType][filters[i]] = true;
                    break;

                  default:
                    console.error('Decoding of search hash has unknown filter type - ' + filterType);
                }

              }
            }
            break;

          case 'intervals':
            var intervals = decodeURIComponent(subParts[1]).split('?');
            if (intervals.length) {
              query.intervals = {};
              for (var i in intervals) {
                var interval = intervals[i].split(';');
                query.intervals[interval[0]] = {
                  'from': interval[1],
                  'to': interval[2]
                };
              }
            }
            break;

          // @TODO: This is the same as for intervals. Refactor into function.
          case 'dates':
            var dates = decodeURIComponent(subParts[1]).split('?');
            if (dates.length) {
              query.dates = {};
              for (var i in dates) {
                var date = dates[i].split(';');
                query.dates[date[0]] = {
                  'from': date[1],
                  'to': date[2]
                };
              }
            }
            break;

          case 'pager':
            var pager = subParts[1].split(':');
            query.pager = {
              'page': Number(pager[0]),
              'size': Number(pager[1])
            };
            break;

          default:
            console.error('Decoding of search hash has unknown parts - ' + subParts[0]);
        }
      }

      return query;
    }

    /**
     * Get basic information about the search state.
     *
     * @return object
     *  The last query form hash tag and default filters.
     */
    this.getState = function getState() {
      var state = {
        'filters': this.getRawFilters()
      };

      var hash = $location.hash();
      if (hash.length > 2) {
         state.query = decodeSearchQuery(hash);
      }

      return state;
    };

    /**
     * Search the provider loaded.
     *
     * This simply forwards the search request to the provider loaded.
     *
     * @param searchQuery
     *   The search query.
     * @param byPassUrlEncode
     *   Don't encode the query in the browsers URL. Default false.
     *
     * @returns {Number|*|Object}
     *   The search result.
     */
    this.search = function search(searchQuery, byPassUrlEncode) {
      byPassUrlEncode = (typeof byPassUrlEncode === 'undefined') ? false : byPassUrlEncode;

      // Ensure that forced fields and other changes are not reflected in the
      // UI.
      var query = angular.copy(searchQuery);

      // Ensure that intervals are set in the configuration and have both from
      // and to values.
      if (CONFIG.provider.hasOwnProperty('intervals') && CONFIG.provider.intervals.length) {
        if (query.hasOwnProperty('intervals')) {
          for (var field in query.intervals) {
            // Check if both from and to exists.
            // @TODO: Review - This can be flipped to avoid the "empty" if - continue does nothing :)
            if (!(query.intervals[field].hasOwnProperty('from') && query.intervals[field].from !== '') &&
                !(query.intervals[field].hasOwnProperty('to') && query.intervals[field].to !== '')) {
              // Remove invalidated interval.
              delete query.intervals[field];
            }
          }
        }
      }
      else {
        // Configuration does not have intervals.
        if (query.hasOwnProperty('intervals')) {
          delete query.intervals;
        }
      }

      // Keep track of the current URL.
      if (!byPassUrlEncode) {
        $location.path('/');
        $location.hash(encodeSearchQuery(query));
      }

      // Force search filters form configuration (predefined filters).
      if (CONFIG.provider.hasOwnProperty('force') && CONFIG.provider.force.length) {
        // If the query has been loaded form the URL, it may not have any
        // selected filters, hence no filters on the query object.
        if (!query.hasOwnProperty('filters')) {
          query.filters = {};
        }

        var forces = CONFIG.provider.force;
        for (var i in forces) {
          var force = forces[i];

          // Check filter type.
          if (!query.filters.hasOwnProperty(force.type)) {
            query.filters[force.type] = {};
          }

          // Check if user have selected filter, if not init it.
          if (!query.filters.hasOwnProperty(force.field)) {
            query.filters[force.type][force.field] = {};
          }

          // Insert the forced field values.
          for (var j in force.values) {
            query.filters[force.type][force.field][force.values[j]] = true;
          }
        }
      }

      return provider.search(query);
    };

    /**
     * Send auto-complete request.
     *
     * Search on from the beginning of a field.
     *
     * @param str
     *   The partial string to search for.
     *
     * @returns json
     */
    this.autocomplete = function autocomplete(str) {
      return provider.autocomplete(str);
    };

    /**
     * Get filters provided by configuration.
     *
     * @returns json
     */
    this.getRawFilters = function getRawFilters() {
      return provider.getRawFilters();
    };

    /**
     * Get filters provided by search engine used.
     *
     * @returns json
     */
    this.getFilters = function getFilters() {
      return provider.getFilters();
    };
  }
]);
