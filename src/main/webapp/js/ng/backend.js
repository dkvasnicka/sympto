var backend = angular.module('backend', []);

backend.service('Cycle', function($rootScope, $http) {
    
    var Cycle = {};
    var currentMeasurementTemplate = [ "measurement", { "date" : new Date(), "temp" : 0.0 },
                            [ "vaginal_sensation", "" ],
                            [ "mucus", "" ],
                            [ "cervix", "" ],
                            [ "comment", "" ]                            
                         ];    
    
    var cycle = [];

    Cycle.init = function() {
        $http.get('app/api/cycle/current').
        success(function(data) {
            cycle = data;
            $rootScope.$broadcast('cycleLoaded', cycle);
        });        
    };
    
    Cycle.initWith = function(start) {
        $http.get('app/api/cycle/' + start).
        success(function(data) {
            cycle = data;
            $rootScope.$broadcast('cycleLoaded', cycle);
        });        
    };
    
    Cycle.getCycle = function() {
        return cycle;
    };

    Cycle.getMeasurementTemplate = function() {
        return currentMeasurementTemplate;
    };

    Cycle.deleteMeasurement = function(m) {
        for (var i = 0; i < cycle.length; i++) {
            var o = cycle[i];
            if ($.isArray(o) && o[1].date.toString() == m[1].date.getTime().toString()) {
                cycle.splice(i, 1);
                return true;
            }
        }

        return false;
    };

    Cycle.addOrUpdateMeasurement = function(m, morig, serverCallUpdateFlag) {
        if (serverCallUpdateFlag === "true") {
            this.deleteMeasurement(morig);
        }

        cycle.push(m);                    
    };

    return Cycle;
});    

backend.service('Chart', function($rootScope, Cycle) {
    var Chart = {};
    
    Chart.chart = null;
    Chart.init = function(data) {

        // init chart
        this.chart = $.plot($("#chart"), prepareChartData(data), {
                series: {
                    lines: { show: true },
                    points: { show: true }
                },
                xaxis	: { mode: "time", timeformat: "%d.%m.", tickSize: [1, "day"] },
                grid	: { 
                    backgroundColor : "white",
                    clickable: true
                } 
            }
        );
    };

    Chart.refreshWithData = function(data) {
        this.chart.setData(prepareChartData(data)); 
        this.chart.setupGrid();       
        this.chart.draw();
    };       

    // prepares the chart data
    /* private */ function prepareChartData(data) {
        var flotFormattedData = utils.getMeasurementsInFlotFormat(data);
        var infertileBeginningIndex = cljsympto.core.detectInfertilePeriod(flotFormattedData);
        var infertileData = infertileBeginningIndex == -1 ? [] : flotFormattedData.slice(infertileBeginningIndex);
        var fertileData = infertileBeginningIndex == -1 ? flotFormattedData : flotFormattedData.slice(0, infertileBeginningIndex + 1);

        return [
            { 
                label: "Fertile",  
                data: fertileData
            },
            { 
                label: "Infertile",  
                data: infertileData
            }            
        ];
    };    
        
    // setup point click handler
    $("#chart").bind("plotclick", function (event, pos, item) {
        if (item) {
            var m = clonearray(utils.selectMeasurement(Cycle.getCycle(), item.datapoint[0].toString()));
            // selecting from cycle - we need to setup data types
            m[1].date = new Date(parseInt(m[1].date));
            m[1].temp = parseFloat(m[1].temp);
            $rootScope.$broadcast('plotClick', m);
        }                    
    });    

    return Chart;
});

