
$(document).ready(function(){
	$("#chart").bind("plotclick", function (event, pos, item) {
        if (item) {
        	var dateClicked = new Date(item.datapoint[0]);
        	$(document.getElementById("measurement:mday")).val(dateClicked.format("dd.mm.yyyy"));
        	$(document.getElementById("measurement:mday")).change();
        }
    });
	
	loadChart();	
});

function loadChart() {
	var chartHolder = $("#chart");
	chartHolder.empty();	
	
	AjaxBean.getActiveCycleMeasurements({
		callback : function(measurements) {
			var data = [];
			
			$.each(measurements, function(idx, m) {
				var date = m.date;
				data.push([date.getTime(), m.temperature]);
				
				if (measurements[idx + 1] !== undefined) {
					var nextDateDifference = measurements[idx + 1].date.getTime() - date.getTime();
					var breakSize = nextDateDifference / 86400000;
					
					for ( var i = 1; i < breakSize; i++) {
						data.push([date.getTime() + (i * 86400000), null]);
					}
				}
			});
			
			$.plot(chartHolder, [ 
			    {
			    	color	: "#004276", 
			    	data 	: data,
			    	lines	: { show: true },
			    	points	: { show: true }
			    }
			], 
			{ 	
				xaxis	: { mode: "time", timeformat: "%d.%m.", tickSize: [1, "day"] },
				grid	: { 
					backgroundColor : "white",
					clickable: true
				} 
			});
		}
	});
}