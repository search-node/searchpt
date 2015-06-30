/**
 * @file
 * Service to communication between search box and search result.
 */

angular.module('communicationService', [])
  .service('communicatorService', function($rootScope, $window){
    // Store rootScopes for each service user.
    $window.rootScopes = $window.rootScopes || [];
    $window.rootScopes.push($rootScope);

    this.$emit = function emit(name, args) {
      angular.forEach($window.rootScopes, function(scope) {
        scope.$emit(name, args);
      });
    };

    this.$on = function on(name, listener) {
      $rootScope.$on(name, function (event, message) {
        listener.apply($rootScope, [event, message]);
      });
    }

  });