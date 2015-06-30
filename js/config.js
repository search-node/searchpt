/**
 * @file
 * Set application configuration.
 */
angular.module('searchApp.config', [])
  .constant('CONFIG', {
    'name' : 'Search prototype',
    'version': '0.1-alpha1',
    'provider': {
      'module': 'testProvider'
    }
  });