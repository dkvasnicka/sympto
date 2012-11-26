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
                { label: "Temp",  data: getMeasurementsInFlotFormat($scope.cycle) },
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
                    console.log(new Date(item.datapoint[0]));                   
                }
            });
        });

    $scope.saveMeasurement = function() {
        $scope.cycle.push($.extend(true, [], $scope.measurement)); 
        $scope.chart.setData([ getMeasurementsInFlotFormat($scope.cycle) ]); 
        $scope.chart.setupGrid();       
        $scope.chart.draw();
        // TODO: save to server
    };
}

function getMeasurementsInFlotFormat(cycle) {

    var result = [];

    $.each(cycle.slice(2), function(idx, m) {        
        result.push([new Date(m[1].date).getTime(), parseFloat(m[1].temp)]);        
    });
    
    return result;
}

