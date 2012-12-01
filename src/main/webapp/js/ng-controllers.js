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
                $http.get('app/auth/oauth/fb/csrf-state').success(function(data) {
                    $scope.stateHash = $.trim(data);                    
                });
                $location.path('/');                
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


function CycleCtrl($scope, $http) {

    $scope.cycle = [];
    $scope.measurement = [ "measurement", { "date" : new Date() },
                            [ "vaginal_sensation", "" ],
                            [ "mucus", "" ],
                            [ "cervix", "" ],
                            [ "comment", "" ]                            
                         ];
    
    $scope.chart = null;

    $http.get('app/api/cycle/current').
        success(function(data) {
            $scope.cycle = data;

            // init chart
            $scope.chart = $.plot($("#chart"), [
                { label: "Temp",  data: utils.getMeasurementsInFlotFormat($scope.cycle) },
                ], {
                series: {
                    lines: { show: true },
                    points: { show: true }
                },
                xaxis	: { mode: "time", timeformat: "%d.%m.", tickSize: [1, "day"] },
				grid	: { 
					backgroundColor : "white",
					clickable: true
				} 
            });

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

    $scope.saveMeasurement = function() {
        var mcopy = $.extend(true, [], $scope.measurement);

        $scope.cycle.push(mcopy); 
        $scope.chart.setData([ utils.getMeasurementsInFlotFormat($scope.cycle) ]); 
        $scope.chart.setupGrid();       
        $scope.chart.draw();

        mcopy[1].temp = mcopy[1].temp.toString();  
        $http.put('/app/api/cycle/add-measurement', mcopy, 
            { headers: {'Content-Type': 'application/jsonml;charset=utf-8'} }).
            success(function(data) {
            });
    };
}
