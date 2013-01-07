var restResources = angular.module('restResources', [ 'ngResource' ]);

restResources.factory('UserName', function($resource) {
    return $resource('app/auth/user');
});

restResources.factory('CSRFToken', function($resource) {
    return $resource('app/auth/oauth/fb/csrf');
});
