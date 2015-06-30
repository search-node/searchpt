/**
 * @file
 * Dummy search provider that reads the search results from a JSON file.
 */

angular.module('searchBoxApp').service('jsonProvider', ['CONFIG', '$http',
  function (CONFIG, $http) {
    var data = [];

    // Load JSON file.
    $http.get(CONFIG.provider.data)
      .then(function(res){
        data = res.data;
      });

    this.search = function query($query) {
      // @TODO search the data.
      return data;
    }
  }
]);