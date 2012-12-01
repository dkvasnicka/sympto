sympto.factory('Chart', function() {
    var Chart = {};
    
    Chart.chart = null;
    Chart.init = function(data) {
        // init chart
        this.chart = $.plot($("#chart"), [
            { label: "Temp",  data: utils.getMeasurementsInFlotFormat(data) },
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
    };

    Chart.refreshWithData = function(data) {
        this.chart.setData([ utils.getMeasurementsInFlotFormat(data) ]); 
        this.chart.setupGrid();       
        this.chart.draw();
    };        

    return Chart;
});
