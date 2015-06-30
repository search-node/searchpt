/**
 * @file
 *
 */

searchBoxApp.controller('boxController', ['communicatorService', '$interval',
  function (communicatorService, $interval) {
    $interval(function () {
      communicatorService.$emit('test', { data : 'test' });
    }, 1000);
  }
]);
