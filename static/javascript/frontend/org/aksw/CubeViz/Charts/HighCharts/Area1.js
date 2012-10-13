Namespacedotjs('org.aksw.CubeViz.Charts.HighCharts.Area1', {
	
	aDimension: {},
	bDimension: {},
    
    /**
     * Standard configuration object for a chart
     */
    config: {
        chart: {
            renderTo: 'container',
            type: 'area'
        },
        title: {
            text: ''
        },
        xAxis: {
            categories: []
        },
        plotOptions: {
            series: {
                groupPadding: 0.2
            }
        },
        series: []
    },
    
    /**
     * Initialize the chart object
     * @param resultObservations
     * @param componentParameter
     */
    init: function (observations, parameters, nDimensions) {
        
        // Include org.aksw.CubeViz.Charts.HighCharts.Chart
        Namespacedotjs.include ('org.aksw.CubeViz.Charts.HighCharts.Chart2');
        var chart = org.aksw.CubeViz.Charts.HighCharts.Chart2;
        this.config.title.text = chart.getTitle ( observations, parameters, nDimensions ); 
        
        this.aDimension = chart.initDimension(observations, parameters, nDimensions[1]);
        this.bDimension = chart.initDimension(observations, parameters, nDimensions[0]);
        
        if(this.bDimension.overallLabelLength > this.aDimension.overallLabelLength) {
			this.config.xAxis.categories = this.aDimension.categories;
			this.config.series = this.bDimension.series;
            console.log ( "this.bDimension.overallLabelLength > this.aDimension.overallLabelLength" );
		} else {
			this.config.xAxis.categories = this.bDimension.categories;
			this.config.series = this.aDimension.series;
            console.log ( "this.bDimension.overallLabelLength < this.aDimension.overallLabelLength" );
		}
        console.log ( this.config );
        
    },
    
    /**
     * Calling different function to compute an object which represents a barchart
     */
    getRenderResult: function () {
        return this.config;
    }
});
