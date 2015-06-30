/**
 * @file
 * Dummy search provider that reads the search results from a JSON file.
 */

angular.module('searchBoxApp').service('jsonProvider', ['CONFIG', '$http',
  function (CONFIG, $http) {
    // Load JSON file based on configuration.
    var data = [];
    $http.get(CONFIG.provider.data)
      .then(function(res){
        data = res.data;
      });

    /**
     * Search function to query the json data.
     *
     * @param $query
     *   The query parameters to search
     *
     * @returns {Array}
     *   The hits found.
     */
    this.search = function query(query) {

      console.log(query);

      // @TODO search the data.
      return data;
    }
  }
]);