var sympto = angular.module('sympto', ['ui.directives']);
sympto.value('ui.config', {});

// routing
sympto.config(['$routeProvider', function($routeProvider) {
      $routeProvider.
          
          when('/',             { templateUrl: 'views/home.htm' }).
          when('/dashboard',    { templateUrl: 'views/dashboard.htm' }).
          when('/new-user',     { templateUrl: 'views/new-user.htm' }).
            
          otherwise({ redirectTo: '/' });
}]);
