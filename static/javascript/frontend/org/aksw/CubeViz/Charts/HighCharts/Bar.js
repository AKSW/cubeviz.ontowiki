Namespacedotjs('org.aksw.CubeViz.Charts.HighCharts.Bar', {
    
    /**
     * Standard configuration object for a bar chart
     */
    config: {
        chart: {
            renderTo: 'container',
            type: 'column'
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
     * Initialize the bar chart object
     * @param resultObservations
     * @param componentParameter
     */
    init: function (resultObservations, componentParameter, nDimensions) {
        
        // Include org.aksw.CubeViz.Charts.HighCharts.Chart
        Namespacedotjs.include ('org.aksw.CubeViz.Charts.HighCharts.Chart');
        var chart = org.aksw.CubeViz.Charts.HighCharts.Chart;
        
        // set x-axis
        this.config.xAxis.categories  = chart.getCategories ( resultObservations, componentParameter, nDimensions );
        console.log ( "" );
        console.log ( "Categories" );
        console.log ( this.config.xAxis.categories );
        
        // set values itself
        this.config.series = chart.getSeries ( 
            resultObservations, 
            componentParameter, 
            nDimensions, 
            this.config.xAxis.categories 
        );
        
        console.log ( "" );
        console.log ( "Series" );
        console.log ( this.config.series );
        
        console.log ( "" );
        console.log ( "getEntireLengthOfDimensionLabels" );
        
        this.config.title.text = chart.getTitle ( resultObservations, componentParameter, nDimensions ); 
    },
    
    /**
     * Calling different function to compute an object which represents a barchart
     */
    getRenderResult: function () {
        return this.config;
    }
});
