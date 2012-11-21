function AuthCtrl($scope, $http) {

    $scope.loggedIn = false;

    $http.get('app/auth/user-name').
        success(function(data) {
            $scope.userName = $.trim(data);
            $("#socialLogin").hide();
            $scope.loggedIn = true;
        }).
        error(function(data, status) {
            if (status == 403) {
                $http.get('app/auth/oauth/fb/csrf-state').success(function(data) {
                    $scope.stateHash = $.trim(data);
                });
            }
        });   
}

function ProfileCtrl($scope, $http, $location) {
    
    $scope.newProfile = ["profile", {},
                            ["cycle", { "start" : new Date() }]]; 

    $scope.initUser = function() {
        $http.put('/app/api/users/init', $scope.newProfile, 
            { headers: {'Content-Type': 'application/jsonml;charset=utf-8'} }).
            success(function(data) {
                $location.path('/dashboard');
            });            
    };
}


function MeasurementCtrl($scope, $routeParams) {
    
    $scope.measurement = ["measurement", {"date":"01-01-2012", "sex":"false", "temp":"36.4"},
                              ["vaginal-sensation",
                                "dry"],
                              ["observation",
                                "spotting"],
                              ["cervix",
                                "HARD_CLOSED_LONG"],
                              ["comment"],
                              ["medications",
                                ["medication",
                                  "Ibalgin"]]];
}
