/**
 * @file
 * Search provider for the search node framework.
 */



angular.module('searchBoxApp').service('searchNodeProvider', ['CONFIG', '$q', '$http',
  function (CONFIG, $q, $http) {
    'use strict';

    // Configuration options.
    var configuration = CONFIG.provider;

    // Search node connection handling.
    var socket;
    var loadedSocketIo = false;
    var token = null;

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
          // Handle internet explore.
          script.onreadystatechange = function () {
            if (script.readyState == "loaded" || script.readyState == "complete") {
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
     *   The is a deferred object that should be resolved on connection.
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
          // request will be queued and send all at once... which could give some
          // strange side effects in the application if not handled.
        });
      });
    }

    /**
     * Create the connection to the server.
     *
     * @return {promise}
     *   An promise is return that will be resolved on connection.
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


    this.getFilters = function getFilters() {

    };

    this.search = function query(searchQuery) {
      console.log(searchQuery);
      var deferred = $q.defer();

      // Build default match all search query.
      var query = {
        "index": configuration.index,
        "query": {
          "match_all": {}
        }
      };

      // Text given build field search query.
      // The analyser ensures that we match the who text string sent not part
      // of. @TODO: It this the right behaviour.
      if (searchQuery.text !== undefined && searchQuery.text !== '') {
        query.query = {
          "multi_match": {
            "query": searchQuery.text,
            "fields": configuration.fields,
            "analyzer": 'string_search'
          }
        };
      }

      //// Add sort
      //query.sort = search.sort;
      //
      //// Add filter.
      //// @TODO: move to the start.
      //if (search.filter !== undefined) {
      //  query.query = {
      //    "filtered": {
      //      "query": query.query,
      //      "filter": search.filter
      //    }
      //  };
      //}

      // Add pager to the query.
      if (searchQuery.hasOwnProperty('pager')) {
        query.size = sesearchQueryarch.pager.size;
        query.from = searchQuery.pager.page * searchQuery.pager.size;
      }

      connect().then(function () {
        socket.emit('search', query);
        socket.on('result', function (hits) {
          deferred.resolve(hits);
        });

        // Catch search errors.
        socket.on('searchError', function (error) {
          console.error('Search error', error.message);
          deferred.reject(error.message);
        });
      });

      return deferred.promise;
    };
  }
]);
