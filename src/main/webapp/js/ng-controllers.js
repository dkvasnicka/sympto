var controllers = angular.module('controllers', [ 'backend' ]);

controllers.controller('AuthCtrl', function($scope, $http, $location) {

    $scope.loggedIn = false;

    $http.get('app/auth/user-name').
        success(function(data) {
            $scope.userName = $.trim(data);
            $("#socialLogin").hide();
            $scope.loggedIn = true;
        });

    $scope.$on('403', function(event) {
        $http.get('app/auth/oauth/fb/csrf-state').success(function(data) {
            $scope.stateHash = $.trim(data);                    
        });
    });   
});

controllers.controller('ProfileCtrl', function($scope, $http, $location) {
    
    $scope.newProfile = ["profile", {},
                            ["cycle", { "start" : new Date() }]]; 

    $scope.initUser = function() {
        var profileCopy = clonearray($scope.newProfile);

        profileCopy[2][1].start = profileCopy[2][1].start.getTime().toString();
        $http.put('/app/api/user/init', profileCopy, 
            { headers: {'Content-Type': 'application/jsonml;charset=utf-8'} }).
            success(function(data) {
                $location.path('/dashboard');
            });            
    };
});

controllers.controller("NewCycleCtrl", function($scope, $http, $location) {

    $scope.save = function() {
        $http.put('/app/api/cycle/new/' + $scope.start.getTime().toString(), 
            {}).
            success(function(data) {                
                $location.path('/dashboard');
            });
    }        

});    

controllers.controller("CycleCtrl", function($scope, $http, Chart, Cycle) {

    $scope.measurement = [];
    
    Cycle.init();

    $scope.$on('cycleLoaded', function(event, cycle) {
        Chart.init(cycle);
    });


    $scope.$on('plotClick', function(event, m) {
        $scope.measurement = m;
        $scope.$apply();
    });
   
    /**
     * set new m.
     */
    $scope.initMeasurement = function() {
        $scope.measurement = Cycle.getMeasurementTemplate();
    };    

    // init
    $scope.initMeasurement();    

    /**
     * save m.
     */
    $scope.saveMeasurement = function() {
        var mcopy = clonearray($scope.measurement);
        // grrrrrrr - need to discard data types and use String
        mcopy[1].date = mcopy[1].date.getTime().toString();
        mcopy[1].temp = mcopy[1].temp.toString();
  
        $http.put('/app/api/cycle/save-measurement', mcopy, 
            { headers: { 'Content-Type' : 'application/jsonml;charset=utf-8' } }).
            success(function(data) {
                Cycle.addOrUpdateMeasurement(mcopy, $scope.measurement, data.updated);
                Chart.refreshWithData(Cycle.getCycle());                
            });
    };

    /**
     * delete m.
     */
    $scope.deleteMeasurement = function() {
        
        if (confirm("Do you really want to delete this measurement?")) {
            $http.delete('/app/api/cycle/delete-measurement/' + $scope.measurement[1].date.getTime().toString(), {}). 
                    success(function(data) {
                        Cycle.deleteMeasurement($scope.measurement);
                        $scope.initMeasurement();
                        Chart.refreshWithData(Cycle.getCycle());
                    });
        }
    };


    /**
     * if the current m. is in the cycle, it can be deleted
     */
    $scope.isCurrentMeasurementInCycle = function() {
        return utils.selectMeasurement(Cycle.getCycle(), $scope.measurement[1].date.getTime().toString()) != null;
    };            
});

controllers.controller("CycleChooserCtrl", function($scope, $http, $filter, Cycle) {

    $scope.cycles = [];
    $scope.currentCycle = null;

    $scope.changeCycle = function() {
        
        // set session attr
        $http.put('/app/api/cycle/current', $scope.currentCycle, 
            { headers: { 'Content-Type' : 'text/plain;charset=utf-8' } }).
            success(function(data) {
                // init
                Cycle.init();  
            });
    }

    $scope.$on('cycleLoaded', function(event, cycle) {
        $scope.currentCycle = cycle[1].start;
    });

    $scope.label = function(c) {
        return $filter('date')(c.start) + " - " + 
            (c.end === undefined ? "..." : $filter('date')(c.end));
    }

    // init cycles
    $http.get('app/api/cycle/all').
        success(function(data) {
            $scope.cycles = data;
        });
});    
