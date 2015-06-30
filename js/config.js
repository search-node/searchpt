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
      'data': '/search_data.json',
      'filters': {
        'tags': {
          'name': 'Tags',
          'items': [
            {
              'name': 'Services',
              'value': 'services'
            },
            {
              'name': 'Angular',
              'value': 'angular'
            },
            {
              'name': 'Javascript',
              'value': 'javascript'
            },
            {
              'name': 'Chrome',
              'value': 'chrome'
            }
          ]
        },
        'levels':{
          'name': 'Levels',
          'items': [
            {
              'name': 'First',
              'value': 1
            },
            {
              'name': 'Second',
              'value': 2
            },
            {
              'name': 'Third',
              'value': 3
            },
            {
              'name': 'Fourth',
              'value': 4
            }
          ]
        }
      }
    }
  });