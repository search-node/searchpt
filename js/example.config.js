/**
 * @file
 * Set application configuration.
 *
 * @TODO: Load configuration from JSON file.
 */
angular.module('searchAppConfig', [])
  .constant('CONFIG', {
    'name' : 'Search prototype',
    'version': '0.1-alpha1',
    'templates': {
      'box': '/js/views/search.html',
      'result': '/js/views/result.html'
    },
    'provider': {
      'service': 'jsonProvider',
      'data': '/data.json'
    }
  });
