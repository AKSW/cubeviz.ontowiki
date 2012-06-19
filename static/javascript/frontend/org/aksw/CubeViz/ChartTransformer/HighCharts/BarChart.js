Namespacedotjs('org.aksw.CubeViz.ChartTransformer.HighCharts.BarChart', {
    
    /**
     * Default configuration for a BarChart (HighChart)
     */
    defaultHighChartConfig: {
        chart: {
            renderTo: 'container',
            type: 'column'
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
     * This contains an adapted version of the defaultHighChartConfig variable
     * and will be modify during getChartInput function.
     */
    activeHighChartConfig: {
    },
    
    /**
     * 
     */
    configuration: {
        'dimensions': [],
        'measures': []
    },
    
    /**
     * @param configuration Contains information about what are the dimensions and measures.
     * @param dataFilter
     * @param visualizationFilter
     */
    init: function (dimensionsAssignment, measuresAssignment, dataFilter, visualizationFilter) {
        
        // Set dimensions assignment
        this.configuration.dimensions = dimensionsAssignment || this.configuration.dimensions;
        
        // Set measure assignment
        this.configuration.measures = measuresAssignment || this.configuration.measures;
    },    
    
    /**
     * Check if everything is ok for execute getChartInput
     * @throw org.aksw.CubeViz.ChartTransformer.HighCharts.Exception
     * @return Boolean True if everything is fine
     */
    _check: function () {
        
        Namespacedotjs.include('org.aksw.CubeViz.ChartTransformer.HighCharts');
        var HighCharts = org.aksw.CubeViz.ChartTransformer.HighCharts;
        
        if (1 > this.configuration.dimensions.length) {
            throw new HighCharts.Exception ("No dimensions set in BarChart.configuration");
        }
        
        if (1 != this.configuration.measures.length) {
            throw new HighCharts.Exception ("No measures set in BarChart.configuration");
        }
        
        return true;
    },
    
    /**
     * @param rawData JSON object from server (result of an SPARQL query)
     * @throw org.aksw.CubeViz.ChartTransformer.HighCharts.Exception
     * @return
     */
    getChartInput: function (rawData) {
             
        this._check ();
             
        for (var currentObservation in rawData) {
            currentObservation = rawData [currentObservation];
            
            // iterate over dimensions and measures
            for ( var key in currentObservation ) {
                console.log ( key + ": " + currentObservation [key] );
            } 
        }   
    }
});
