Namespacedotjs('org.aksw.CubeViz.Charts.HighCharts.Pie', {
    
    /**
     * Standard configuration object for a chart
     */
    config: {
		chart: {
			renderTo: 'container',
			plotBackgroundColor: null,
			plotBorderWidth: null,
			plotShadow: false
		},
		title: {
			text: 'Browser market shares at a specific website, 2010'
		},
		tooltip: {
			formatter: function() {
				return '<b>'+ this.point.name +'</b>: '+ this.percentage +' %';
			}
		},
		plotOptions: {
			pie: {
				allowPointSelect: true,
				cursor: 'pointer',
				dataLabels: {
					enabled: false
				},
				showInLegend: true
			}
		},
		series: [{
			type: 'pie',
			name: 'Browser share',
			data: [
				['Firefox',   45.0],
				['IE',       26.8],
				{
					name: 'Chrome',
					y: 12.8,
					sliced: true,
					selected: true
				},
				['Safari',    8.5],
				['Opera',     6.2],
				['Others',   0.7]
			]
		}]
	},
    
    /**
     * Initialize the chart object
     * @param resultObservations
     * @param componentParameter
     */
    init: function (resultObservations, componentParameter, nDimensions) {
        
        // Include org.aksw.CubeViz.Charts.HighCharts.Chart
        Namespacedotjs.include ('org.aksw.CubeViz.Charts.HighCharts.Chart');
        var chart = org.aksw.CubeViz.Charts.HighCharts.Chart;
        return;
        // set x-axis
        this.config.xAxis.categories  = chart.getCategories ( resultObservations, componentParameter, nDimensions );
        
        // set values itself
        this.config.series = chart.getSeries ( 
            resultObservations, 
            componentParameter, 
            nDimensions, 
            this.config.xAxis.categories 
        );
        
        this.config.title.text = chart.getTitle ( resultObservations, componentParameter, nDimensions ); 
    },
	
    /**
     * Calling different function to compute an object which represents the chart
     */
    getRenderResult: function () {
        return this.config;
    }
});
