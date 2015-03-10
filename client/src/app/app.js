import angular from 'angular';
import 'angular-ui-router';
import 'ocLazyLoad';
import {routing} from 'common/utils/routing';
import 'common/core';

var app = angular.module('exp', ['ui.router', 'oc.lazyLoad' ]);

app.config(routing(app));

app.config(function ($urlRouterProvider, $locationProvider, $stateProvider, $httpProvider) {
  $locationProvider.html5Mode(true);
  $httpProvider.useApplyAsync(true);
  $urlRouterProvider.otherwise('/login');
});

angular.element(document).ready(function() {
  angular.bootstrap(document.body, [ app.name ], {
    // strictDi: true // turning off for now
  });
});
