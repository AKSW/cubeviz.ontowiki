Namespacedotjs('org.aksw.CubeViz.Charts.HighCharts.Lines', {
	
	/**
	 * Notes:
	 * In this class multipleDimensions ALWAYS has got only one element
	 */
	
	observations: null,
	parameters: null,
	nDimension: null,
	config: {
		chart: {
			renderTo: 'container',
			type: 'line'
		},
		title: {
			text: ''
		},
		xAxis: {
			categories: ''
		}
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
     * Calling different function to compute an object which represents a barchart
     */
    getRenderResult: function () {
        return this.config;
    }

});
