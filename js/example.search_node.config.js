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
      'result': '/js/views/result.html',
      'pager': '/js/directive/pager-directive.html'
    },
    'provider': {
      'service': 'searchNodeProvider',
      'host': 'https://search.node.vm',
      'auth': '/auth.php',
      'index': 'e7df7cd2ca07f4f1ab415d457a6e1c13',
      'fields': ['title', 'body:value'],
      'pager': {
        'size': 8,
        'page': 0
      },
      'cacheExpire': 5,
      'filters': [
        {
          'field': 'field_level',
          'name': 'Level',
          'type': 'and',
          'terms': {
            "1": {
              'value': '1'
            },
            "2": {
              'value': '2'
            },
            "3": {
              'value': '3'
            },
            "4": {
              'value': '4'
            },
            "5": {
              'value': '5'
            },
            "6": {
              'value': '6'
            },
            "7": {
              'value': '7'
            },
            "8": {
              'value': '8'
            }
          }
        },
        {
          'field': 'field_teknologi',
          'name': 'Teknologi',
          'type': 'and',
          'terms': {
            "Angular": {
              'value': 'Angular'
            },
            "Apache": {
              'value': 'Apache'
            },
            "Javascript": {
              'value': 'Javascript'
            },
            "PHP": {
              'value': 'PHP'
            }
          }
        }
      ]
    }
  });
