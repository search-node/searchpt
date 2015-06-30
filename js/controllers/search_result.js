/**
 * @file
 *
 */


searchResultApp.controller('resultController', ['communicatorService',
  function (communicatorService) {
    communicatorService.$on('test', function (event, data) {
      console.log(data);
    });
  }
]);