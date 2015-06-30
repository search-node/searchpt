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
      'data': '/data.json',
      'filters': {
        'tags': {
          'name': 'Tags',
          'type': 'and',
          'items': [
            {
              'name': 'Angular',
              'value': 'angular'
            },
            {
              'name': 'Developer',
              'value': 'developer'
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
          'name': 'Levels (or)',
          'type': 'or',
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