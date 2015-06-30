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
      'box': '/js/views/search_box.html',
      'result': '/js/views/search_result.html'
    },
    'provider': {
      'service': 'jsonProvider',
      'data': '/search_data.json'
    }
  });