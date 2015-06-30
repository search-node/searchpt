/**
 * Service to handled socket.io communication with the server.
 */
searchBoxApp.service('socket', ['$rootScope', '$q', function ($rootScope, $q) {
  "use strict";

  var socket;
  var self = this;

  /**
   * Connect to the web-socket.
   *
   * @param string token
   *   JWT authentication token from the activation request.
   */
  function getSocket(deferred) {
    // Get connected to the server.
    socket = io.connect(window.config.search.address, {
      'query': 'token=' + token,
      'force new connection': true,
      'max reconnection attempts': Infinity,
      'forceNew': true,
      'reconnection': true,
      'reconnectionDelay': 1000,
      'reconnectionDelayMax' : 5000,
      'reconnectionAttempts': Infinity
    });

    // Handle error events.
    socket.on('error', function (reason) {
      deferred.reject(reason);
    });

    socket.on('connect', function (data) {
      self.connected = true;
      deferred.resolve('Connected to the server.');
    });

    // Handle disconnect event (fires when disconnected or connection fails).
    socket.on('disconnect', function (reason) {
      if (reason == 'booted') {
        // Reload application.
        location.reload(true);
      }
    });
  }

  /**
   * Create the connection to the server with promise.
   */
  this.connect = function connect() {
    var deferred = $q.defer();

    // Try to connect to the server if not already connected.
    if (socket === undefined) {
      // Create the connection by authenticate this mirror.
      getSocket(deferred);
    }
    else {
      deferred.resolve('Connected to the server.');
    }

    return deferred.promise;
  };

  /**
   * Handled events from the socket connection.
   *
   * @param eventName
   *   Name of the event.
   * @param callback
   *   The callback to call when the event is fired.
   */
  this.on = function on(eventName, callback) {
    socket.on(eventName, function() {
      var args = arguments;
      $rootScope.$apply(function() {
        callback.apply(socket, args);
      });
    });
  };

  /**
   * Emit event into the socket connection.
   *
   * @param eventName
   *   The event to emit.
   * @param data
   *   The data to send with the event.
   * @param callback
   *   The callback to call when the event have been sent.
   */
  this.emit = function emit(eventName, data, callback) {
    socket.emit(eventName, data, function () {
      var args = arguments;
      $rootScope.$apply(function () {
        if(callback) {
          callback.apply(socket, args);
        }
      });
    });
  };
}]);