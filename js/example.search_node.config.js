/**
 * @file
 * Set application configuration.
 */
angular.module('searchAppConfig', [])
  .constant('CONFIG', {
    'id' : 'Search prototype',
    'initialQueryText': '',
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
      'sorting': {
        'field': 'title',
        'order': 'asc'
      },
      'intervals': ['created'],
      'filters': {
        'taxonomy': [
          {
            'field': 'field_level',
            'name': 'Level',
            'type': 'and',
            'terms': {
              "First": {
                'value': 'First'
              },
              "Second": {
                'value': 'Second'
              },
              "Third": {
                'value': 'Third'
              },
              "Fourth": {
                'value': 'Fourth'
              },
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
              "Javascript": {
                'value': 'Javascript'
              },
            }
          }
        ]
      }
    }
  });
