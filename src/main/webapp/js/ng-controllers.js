function AuthCtrl($scope, $http, $location) {

    $scope.loggedIn = false;

    $http.get('app/auth/user-name').
        success(function(data) {
            $scope.userName = $.trim(data);
            $("#socialLogin").hide();
            $scope.loggedIn = true;
        }).
        error(function(data, status) {
            if (status == 403) {
                $location.path('/');
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

        $http.put('/app/api/user/init', $scope.newProfile, 
            { headers: {'Content-Type': 'application/jsonml;charset=utf-8'} }).
            success(function(data) {
                $location.path('/dashboard');
            });            
    };
}


function CycleCtrl($scope, $http, Chart) {

    // templates
    $scope.cycle = [];
    var measurementModel = [ "measurement", { "date" : new Date(), "temp" : 0 },
                            [ "vaginal_sensation", "" ],
                            [ "mucus", "" ],
                            [ "cervix", "" ],
                            [ "comment", "" ]                            
                         ];
    /**
     * set new m.
     */
    $scope.initMeasurement = function() {
        $scope.measurement = measurementModel;
    };    

    // init
    $scope.initMeasurement();    
    
    // load data
    $http.get('app/api/cycle/current').
        success(function(data) {
            $scope.cycle = data;
            Chart.init($scope.cycle);
        
            // setup point click handler
            $("#chart").bind("plotclick", function (event, pos, item) {
                if (item) {
                    var m = utils.selectMeasurement($scope.cycle, item.datapoint[0]);
                    m[1].date = new Date(m[1].date);
                    m[1].temp = parseFloat(m[1].temp);
                    $scope.measurement = m;
                    $scope.$digest();
                }
            });
        });

    /**
     * save m.
     */
    $scope.saveMeasurement = function() {
        var mcopy = $.extend(true, [], $scope.measurement);

        $scope.cycle.push(mcopy); 
        Chart.refreshWithData($scope.cycle);

        mcopy[1].temp = mcopy[1].temp.toString();  
        $http.put('/app/api/cycle/add-measurement', mcopy, 
            { headers: {'Content-Type': 'application/jsonml;charset=utf-8'} }).
            success(function(data) {
            });
    };

    /**
     * if the current m. is in the cycle, it can be deleted
     */
    $scope.canDeleteCurrentMeasurement = function() {
        return utils.selectMeasurement($scope.cycle, $scope.measurement[1].date.getTime()) != null;
    };            
}
