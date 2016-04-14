/**
 * @file
 * Search provider for the search node framework.
 */

angular.module('searchBoxApp').service('searchNodeProvider', ['CONFIG', '$q', '$http', 'CacheFactory',
  function (CONFIG, $q, $http, CacheFactory) {
    'use strict';

    // Configuration options.
    var configuration = CONFIG.provider;

    // Search node connection handling.
    var socket;
    var loadedSocketIo = false;
    var token = null;

    // Create cache object.
    var searchCache = new CacheFactory('searchCache' + CONFIG.id, {
      maxAge: configuration.cacheExpire * 1000,
      deleteOnExpire: 'aggressive',
      storageMode: 'localStorage'
    });

    // Create auto-complete cache object.
    var autoCacheExpire = 5;
    if (configuration.hasOwnProperty("autocomplete")) {
      autoCacheExpire = configuration.autocomplete.cacheExpire
    }
    var autoCompleteCache = new CacheFactory('autoCompleteCache' + CONFIG.id, {
      maxAge: autoCacheExpire * 1000,
      deleteOnExpire: 'aggressive',
      storageMode: 'localStorage'
    });

    // Holder for the latest search query filters.
    var currentFilters = {
      'taxonomy': undefined,
      'boolean': undefined
    };

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
     * Load the socket.io library provided by the search node.
     *
     * @return {promise}
     *   An promise is return that will be resolved on library loaded.
     */
    function loadSocketIoScript() {
      var deferred = $q.defer();

      // Check if it have been loaded.
      if (!loadedSocketIo) {
        // Create script element.
        var script = document.createElement("script");
        script.type = "text/javascript";

        // Add event handlers for the library loaded.
        if (script.readyState) {
          // Handle Internet Explore.
          script.onreadystatechange = function () {
            if (script.readyState === "loaded" || script.readyState === "complete") {
              script.onreadystatechange = null;
              loadedSocketIo = true;
              deferred.resolve();
            }
          };
        } else {
          // All other browsers.
          script.onload = function () {
            loadedSocketIo = true;
            deferred.resolve();
          };
        }

        // Add the script and add it to the dom to load it.
        script.src = configuration.host + "/socket.io/socket.io.js";
        document.getElementsByTagName("head")[0].appendChild(script);
      }
      else {
        deferred.resolve();
      }

      return deferred.promise;
    }

    /**
     * Connect to the web-socket.
     *
     * @param deferred
     *   The deferred object that should be resolved on connection.
     */
    function getSocket(deferred) {
      // Load the socket library.
      loadSocketIoScript().then(function () {
        // Get connected to the server.
        socket = io.connect(configuration.host, {
          'query': 'token=' + token,
          'force new connection': true,
          'max reconnection attempts': Infinity
        });

        // Handle error events.
        socket.on('error', function (reason) {
          console.error(reason, 'Search socket error.');
          deferred.reject(reason);
        });

        socket.on('connect', function () {
          deferred.resolve('Connected to the server.');
        });

        // Handle disconnect event (fires when disconnected or connection fails).
        socket.on('disconnect', function (reason) {
          // @todo: re-connection is automatically handled by socket.io library,
          // but we might need to stop sending request until reconnection or the
          // request will be queued and sent all at once... which could give
          // some strange side effects in the application if not handled.
        });
      });
    }

    /**
     * Create the connection to the server.
     *
     * @return {promise}
     *   A promise is return that will be resolved on connection.
     */
    function connect() {
      // Try to connect to the server if not already connected.
      var deferred = $q.defer();

      if (socket === undefined) {
        if (token !== null) {
          getSocket(deferred);
        }
        else {
          $http.get(configuration.auth)
            .success(function (data) {
              token = data.token;
              getSocket(deferred);
            })
            .error(function (data, status) {
              console.error(data, 'Authentication (search) to search node failed (' + status + ')');
              deferred.reject(status);
            });
        }
      }
      else {
        deferred.resolve('Connected to the server.');
      }

      return deferred.promise;
    }

    /**
     * Builds aggregation query based on filters.
     *
     * @param filters
     */
    function buildAggregationQuery(filters) {
      // Basic aggregation query.
      var query = {
        "aggs": {}
      };

      for (var filterType in filters) {
        switch (filterType) {
          case 'taxonomy':
            var taxonomyFilters = filters[filterType];
            // Extend query with filter fields.
            for (var i = 0; i < taxonomyFilters.length; i++) {
              var filter = taxonomyFilters[i];
              query.aggs[filter.field] = {
                "terms": {
                  "field": filter.field + '.raw',
                  "size": 0
                }
              };
            }
            break;

          case 'boolean':
            var booleanFilters = filters[filterType];
            for (var i = 0; i < booleanFilters.length; i++) {
              var filter = booleanFilters[i];
              query.aggs[filter.field] = {
                "terms": {
                  "field": filter.field,
                  "size": 0
                }
              };
            }
            break;

          default:
            console.error('Aggregation filter has unknown type - ' + filterType);
        }
      }

      return query;
    }

    /**
     * Parse filter configuration and search aggregations.
     *
     * Merge result with filters configuration as not all terms may have
     * been used in the content and then not in found in the search
     * node.
     *
     * @param aggs
     *
     * @returns {{}}
     */
    function parseFilters(aggs) {
      var results = {
        'taxonomy': {},
        'boolean': {}
      };

      if (CONFIG.provider.hasOwnProperty('filters')) {
        var filterConfig = CONFIG.provider.filters;

        for (var filterType in filterConfig) {
          var filters = filterConfig[filterType];
          for (var i = 0; i < filters.length; i++) {
            var filter = angular.copy(filters[i]);

            // Set basic filter with counts.
            results[filterType][filter.field] = {
              'name': filter.name,
            };

            if (countProperties(aggs) !== 0) {
              // Run through counts and update the filters.
              switch (filterType) {
                case 'taxonomy':
                  results[filterType][filter.field].items = filter.terms;

                  for (var j = 0; j < aggs[filter.field].buckets.length; j++) {
                    var bucket = aggs[filter.field].buckets[j];
                    if (results[filterType][filter.field].items.hasOwnProperty(bucket.key)) {
                      results[filterType][filter.field].items[bucket.key].count = Number(bucket.doc_count);
                    }
                    else {
                      console.error('Filter value don\'t match configuration: ' + filter.field + ' -> ' + bucket.key);
                    }
                  }
                  break;

                case 'boolean':
                  for (var j = 0; j < aggs[filter.field].buckets.length; j++) {
                    var bucket = aggs[filter.field].buckets[j];

                    // Set default count for "true" to zero.
                    results[filterType][filter.field].count = 0;
                    if (bucket.key === 'T' && bucket.doc_count > 0) {
                      results[filterType][filter.field].count = Number(bucket.doc_count);

                      // Break has true count have been found, if not we don't break. The
                      // count will be reset to zero.
                      break;
                    }
                  }
                  break;

                default:
                  console.error('Unknown filter type used in parseFilters: ' + filterType);
              }
            }
          }
        }
      }

      return results;
    }

    /**
     * Build boolean filter based on configuration.
     *
     * @returns object
     *   The boolean filter names indexed by field name.
     */
    function buildBooleanFilters() {
      var result = {};

      if (CONFIG.provider.hasOwnProperty('filters')) {
        var filters = CONFIG.provider.filters;

        // Check for boolean filters.
        if (filters.hasOwnProperty('boolean')) {
          for (var i = 0; i < filters.boolean.length; i++) {
            var filter = filters.boolean[i];
            result[filter.field] = {
              'name': filter.name,
            };
          }
        }
      }

      return result;
    }

    /**
     * Get the list of available filters not parsed with search results.
     *
     * @return object
     *  The filters from the configuration.
     */
    this.getRawFilters = function getRawFilters() {
      var result = {};

      if (CONFIG.provider.hasOwnProperty('filters')) {
        var filters = CONFIG.provider.filters;

        // Check for taxonomy filters.
        if (filters.hasOwnProperty('taxonomy')) {
          result.taxonomy = {};
          for (var i = 0; i < filters.taxonomy.length; i++) {
            var filter = filters.taxonomy[i];
            // Set basic filter with counts.
            result.taxonomy[filter.field] = {
              'name': filter.name,
              'items': filter.terms
            };
          }
        }

        // Check for boolean filters.
        result.boolean = buildBooleanFilters();
      }

      return result;
    };

    /**
     * Get the list of available filters.
     *
     * @PLAN:
     *   Check if latest search returned aggregations, if not use the
     *   configuration to search the get all available aggregations.
     *
     *   Merge it with configuration to ensure that all possible filters are
     *   displayed with count.
     */
    this.getFilters = function getFilters() {
      var deferred = $q.defer();

      // Get filters from configuration.
      if (CONFIG.provider.hasOwnProperty('filters')) {
        // If no search has been executed yet, load the default filters across
        // all indexed data.
        if (currentFilters.taxonomy === undefined) {
          // Check if filters are cached.
          var cachedFilters = searchCache.get('filters');

          if (cachedFilters !== undefined) {
            // Store current filters.
            currentFilters = cachedFilters;

            // Return the result.
            deferred.resolve(angular.copy(currentFilters));
          }
          else {
            // Get the query.
            var query = buildAggregationQuery(CONFIG.provider.filters);

            /**
             * @TODO: Added forced fields and other search options.
             */

            // Send the request to search node.
            connect().then(function () {
              socket.emit('count', query);
              socket.once('counts', function (counts) {
                currentFilters = parseFilters(counts);

                // Store initial filters in cache.
                searchCache.put('filters', currentFilters);

                // Return the result.
                deferred.resolve(currentFilters);
              });

              // Catch search errors.
              socket.once('searchError', function (error) {
                console.error('Search error', error.message);
                deferred.reject(error.message);
              });
            });
          }
        }
        else {
          // Return the result.
          deferred.resolve(angular.copy(currentFilters));
        }
      }
      else {
        deferred.resolve({});
      }

      return deferred.promise;
    };

    /**
     * Execute search query.
     *
     * @param searchQuery
     * @returns {*}
     */
    this.search = function search(searchQuery) {
      var deferred = $q.defer();

      // Build default "match all" search query.
      var query = {
        "index": configuration.index,
        "query": {
          "filtered": {
            "query": {
              "match_all": {}
            }
          }
        }
      };

      // Text given build field search query.
      // The analyser ensures that we match the who text string sent not part
      // of.
      if (searchQuery.text !== undefined && searchQuery.text !== '') {
        var fields = configuration.fields;
        // Check if boost exist for the fields.
        if (configuration.hasOwnProperty('boost') && countProperties(configuration.boost)) {
          // Add boost to fields.
          for (var i in fields) {
            if (configuration.boost.hasOwnProperty(fields[i])) {
              fields[i] = fields[i] + '^' + configuration.boost[fields[i]];
            }
          }
        }

        query.query.filtered.query = {
          "multi_match": {
            "query": searchQuery.text,
            "fields": fields,
            "analyzer": 'string_search'
          }
        };
      }

      // Add sort fields.
      if (searchQuery.hasOwnProperty('sort') && countProperties(searchQuery.sort) > 0) {
        query.sort = {};
        for (var field in searchQuery.sort) {
          query.sort[field] = {
            "order": searchQuery.sort[field]
          };
        }
      }

      // Add filter.
      if (searchQuery.hasOwnProperty('filters')) {
        var filters = angular.copy(searchQuery.filters);

        // Build query filter.
        var queryFilter = {
          "bool": {
            "must": []
          }
        };

        // Loop over taxonomy filters.
        if (filters.hasOwnProperty('taxonomy')) {
          for (var field in filters.taxonomy) {
            var filter = filters.taxonomy[field];
            /**
             * @TODO: Needs to get information from configuration about execution
             *        type?
             */
            var terms = {
              "execution": "and"
            };

            terms[field + '.raw'] = [];
            for (var term in filter) {
              // Check the the term is "true", hence is selected.
              if (filter[term]) {
                terms[field + '.raw'].push(term);
              }
            }

            if (terms[field + '.raw'].length) {
              queryFilter.bool.must.push({ "terms": terms });
            }
          }
        }

        // Loop over boolean filters.
        if (filters.hasOwnProperty('boolean')) {
          for (var field in filters.boolean) {
            if (filters.boolean[field]) {
              var term = {};
              term[field] = filters.boolean[field];
              queryFilter.bool.must.push({ "term": term });
            }
          }
        }

        // Add the query filter if filled out.
        if (queryFilter.bool.must.length) {
          query.query.filtered.filter = queryFilter;
        }
      }

      // Add pager to the query.
      if (searchQuery.hasOwnProperty('pager')) {
        query.size = searchQuery.pager.size;
        query.from = searchQuery.pager.page * searchQuery.pager.size;
      }

      // Check if aggregations/filters counts should be used.
      if (CONFIG.provider.hasOwnProperty('filters')) {
        // Get the query.
        var aggs = buildAggregationQuery(CONFIG.provider.filters);
        angular.extend(query, aggs);
      }

      // Add range/interval search to the query.
      if (searchQuery.hasOwnProperty('intervals')) {
        // Check if any filters have been defined.
        if (!query.query.filtered.hasOwnProperty('filter')) {
          query.query.filtered.filter = {
            "bool": {
              "must": []
            }
          };
        }

        // Loop over the intervals and build range terms.
        for (var field in searchQuery.intervals) {
          var interval = {
            "range": {}
          };
          interval.range[field] = {
            "gte": searchQuery.intervals[field].from,
            "lte": searchQuery.intervals[field].to
          };
          query.query.filtered.filter.bool.must.push(interval);
        }
      }

      // Add date interval search.
      if (searchQuery.hasOwnProperty('dates')) {
        // Check if any filters have been defined.
        if (!query.query.filtered.hasOwnProperty('filter')) {
          query.query.filtered.filter = {
            "bool": {
              "should": [ ]
            }
          };
        }
        else {
          query.query.filtered.filter.bool.should = [];
        }

        // Loop over the intervals and build range terms.
        for (var field in searchQuery.dates) {
          var config = configuration.dates[field];
          var template = {
            "bool": {
              "must": [
                {
                  "range": {}
                },
                {
                  "range": {}
                }
              ]
            }
          };

          // Overlap start of the interval.
          template.bool.must[0].range[config.from] = {
            "lte": searchQuery.dates[field].from
          };
          template.bool.must[1].range[config.to] = {
            "gt": searchQuery.dates[field].from
          };
          query.query.filtered.filter.bool.should.push(angular.copy(template));

          // Overlap end of the interval.
          template.bool.must[0].range[config.from] = {
            "lt": searchQuery.dates[field].to
          };
          template.bool.must[1].range[config.to] = {
            "gte": searchQuery.dates[field].to
          };
          query.query.filtered.filter.bool.should.push(angular.copy(template));

          // Overlap both endes of the interval.
          template.bool.must[0].range[config.from] = {
            "gte": searchQuery.dates[field].from
          };
          template.bool.must[1].range[config.to] = {
            "lte": searchQuery.dates[field].to
          };
          query.query.filtered.filter.bool.should.push(angular.copy(template));
        }
      }

      // Create cache key based on the finale search query.
      var cid = CryptoJS.MD5(JSON.stringify(query)).toString();

      // Give unique id to the search query.
      query.uuid = cid;

      // Check cache for hits.
      var hits = searchCache.get(cid);
      if (hits !== undefined) {
        // Update filters cache.
        if (hits.hasOwnProperty('aggs')) {
          currentFilters = parseFilters(angular.copy(hits.aggs));
        }

        deferred.resolve(hits);
      }
      else {
        connect().then(function () {

          /**
           * Search error handler for this event.
           */
          var searchError = function searchError(err) {
            console.error('Search error', err.message);
            deferred.reject(err.message);
          };

          // Listen to search results.
          socket.on('result', function (hits) {
            // Check if this socket message is for this query.
            if (hits.uuid == query.uuid) {
              socket.removeListener('result', this);
              socket.removeListener('searchError', searchError);

              // Update cache filters cache, based on the current search result.
              if (hits.hasOwnProperty('aggs')) {
                // Store current filters.
                currentFilters = parseFilters(angular.copy(hits.aggs));
              }

              // Get uuid and remove it before cache.
              var uuid = hits.uuid;
              delete hits.uuid;

              // Save hits in cache (use uuid as it's it the cache id).
              searchCache.put(uuid, hits);

              deferred.resolve(hits);
            }
          });

          // Catch search errors.
          socket.on('searchError', searchError);

          // Send query.
          socket.emit('search', query);
        });
      }

      return deferred.promise;
    };

    /**
     * Auto-complete search.
     *
     * @param str
     *   The string the search should search for.
     *
     * @returns {promise.promise|Function|jQuery.promise|d.promise|*|promise}
     */
    this.autocomplete = function autocomplete(str) {
      var deferred = $q.defer();

      if (!configuration.hasOwnProperty("autocomplete")) {
        var err = new Error('Auto complete not configured');
        console.error('Search error', err.message);
        deferred.reject(err.message);
      }
      else {
        var query = {
          "index": configuration.autocomplete.index,
          "query": {
            "match_phrase_prefix": {
              "title": {
                "query": str
              }
            }
          },
          "size": configuration.autocomplete.size
        };

        // Add uuid to this search query.
        query.uuid = CryptoJS.MD5(JSON.stringify(query)).toString();

        var hits = autoCompleteCache.get(query.uuid);
        if (hits !== undefined) {
          deferred.resolve(hits);
        }
        else {
          // Connect to search node and execute the search.
          connect().then(function () {
            /**
             * Search error handler for this event.
             */
            var searchError = function searchError(err) {
              console.error('Search error', err.message);
              deferred.reject(err.message);
            };

            // Listen to search results.
            socket.on('result', function (hits) {
              // Check if this socket message is for this query.
              if (hits.uuid == query.uuid) {
                socket.removeListener('result', this);
                socket.removeListener('searchError', searchError);

                // Get uuid and remove it before cache.
                var uuid = hits.uuid;
                delete hits.uuid;

                // Save hit in cache.
                autoCompleteCache.put(uuid, hits);

                deferred.resolve(hits);
              }
            });

            // Catch search errors.
            socket.on('searchError', searchError);

            // Send query.
            socket.emit('search', query);
          });
        }
      }

      return deferred.promise;
    }
  }
]);
