// boot
var sympto = angular.module('sympto', ['ui.directives']);
sympto.value('ui.config', {});

// routing
sympto.config(['$routeProvider', function($routeProvider) {
    $routeProvider.

    when('/',                 { templateUrl: 'views/home.htm' }).
    when('/dashboard',        { templateUrl: 'views/dashboard.htm' }).
    when('/new-user',         { templateUrl: 'views/new-user.htm' }).
    when('/add-new-cycle',    { templateUrl: 'views/add-new-cycle.htm' }).

    otherwise({ redirectTo: '/' });
}]);

// interceptors
sympto.config(function($provide, $httpProvider) {
    
    // 500 interceptor
    $httpProvider.responseInterceptors.push(function($q) {
        return createErrorInterceptor(function(response) {            
            if (response.status == 500) {
                alert(response.data);
            }    
            return $q.reject(response);
        });
    });
    
    // 403 interceptor
    $httpProvider.responseInterceptors.push(function($q, $location, $rootScope) {
        return createErrorInterceptor(function(response) {            
            if (response.status == 403) {
                $location.path('/');
                $rootScope.$broadcast("403");
            }    
            return $q.reject(response);
        });
    });
});

/**
 * Utility function that creates error-only interceptor from a template.
 * Does nothing on 200.
 */
function createErrorInterceptor(errorFn) {
    return function(promise) {
        return promise.then(function(response) {
            return response;
        }, errorFn);
    }
}


/**
 * clones an array
 */
function clonearray(a) {
    return $.extend(true, [], a);
}
