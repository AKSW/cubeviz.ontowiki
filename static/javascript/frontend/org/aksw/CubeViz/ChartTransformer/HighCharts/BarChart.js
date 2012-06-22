Namespacedotjs('org.aksw.CubeViz.ChartTransformer.HighCharts.BarChart', {
    
    rawData: {},
    
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
    activeHighChartConfig: {},
    
    /**
     * It contains general configuration for BarChart itself
     */
    configuration: {
        dimensions: [],
        measures: [],
        xAxisAssignment: "measure",
        yAxisAssignment: "multipleDimension",
        captionEntrySeparator: ", "
    },
    
    /**
     * 
     */
    restrictions: {
        maximumMultipleDimensions: 1
    },
    
    /**
     * @param 
     */
    init: function (rawData, renderToContainer, dimensionsAssignment, measuresAssignment, 
                    xAxisAssignment, yAxisAssignment, captionEntrySeparator) {
        
        // Reset activeHighChartConfig to defaultHighChartConfig
        this.activeHighChartConfig = this.defaultHighChartConfig;
        
        this.activeHighChartConfig.chart.renderTo = renderToContainer || "container";
        
        
        this.rawData = rawData;
        
        // Set dimensions assignment
        this.configuration.dimensions = dimensionsAssignment || this.configuration.dimensions;
        
        // Set measure assignment
        this.configuration.measures = measuresAssignment || this.configuration.measures;
        
        // Set x axis assignment
        xAxisAssignment = xAxisAssignment || "multipleDimension";
        this.setXAxisAssignment ( xAxisAssignment );
        
        // Set y axis assignment
        yAxisAssignment = xAxisAssignment || "measure";
        this.setYAxisAssignment ( yAxisAssignment );
        
        // Set separator for the chart caption
        this.configuration.captionEntrySeparator = captionEntrySeparator || this.configuration.captionEntrySeparator;
    },    
    
    /**
     * 
     */
    setXAxisAssignment: function (assignment) {
        if ( "measure" == assignment || "multipleDimension" == assignment ) {
            
            this.configuration.xAxisAssignment = assignment;
            this.configuration.yAxisAssignment = "measure" == assignment 
                ? "multipleDimension" : "measure";
                
            this.activeHighChartConfig.chart.inverted = "measure" == assignment
                ? true : false;
            
            return true;
        } 
        
        Namespacedotjs.include('org.aksw.CubeViz.ChartTransformer.HighCharts');
        var HighCharts = org.aksw.CubeViz.ChartTransformer.HighCharts;
        throw new HighCharts.Exception (
            "Invalid x axis assignment, valid are measure and multipleDimension! " +
            "But i got " + assignment 
        );
    },
    
    /**
     * 
     */
    setYAxisAssignment: function (assignment) {
        if ( "measure" == assignment || "multipleDimension" == assignment ) {
            
            this.configuration.yAxisAssignment = assignment;
            this.configuration.xAxisAssignment = "measure" == assignment 
                ? "multipleDimension" : "measure";
                
            this.activeHighChartConfig.chart.inverted = "measure" == assignment
                ? false : true;
                
            return true;
        } 
        
        Namespacedotjs.include('org.aksw.CubeViz.ChartTransformer.HighCharts');
        var HighCharts = org.aksw.CubeViz.ChartTransformer.HighCharts;
        throw new HighCharts.Exception (
            "Invalid y axis assignment, valid are measure and multipleDimension! " +
            "But i got " + assignment 
        );
    },
    
    /**
     * Checks if this graph type is suitable visualize the given data.
     * @param rawData
     * @return Boolean True if suitable, otherwise false.
     */
    isSuitable: function () {        
        
        console.log ( this.getMultipleDimensions (this.rawData).length );
        console.log ( this.restrictions.maximumMultipleDimensions );
        
        // Compares number of multiple dimensions in rawdata with class restriction
        if (this.getMultipleDimensions (this.rawData).length == this.restrictions.maximumMultipleDimensions) {
            return true;
        }
        
        return false;
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
     * Extracts all dimensions which appears two or more times
     * @return array List of dimension names which appears two or more times
     */
    getMultipleDimensions: function () {
        
        var i = 0;
        var checkObservation = null;
        var multipleDimensions = [];
        
        for (var currentObservation in this.rawData) {
            if (null == checkObservation) {
                checkObservation = this.rawData [currentObservation];
            } else {
                
                currentObservation = this.rawData [currentObservation];              
                
                // now we are in second iteration
                for (var key in checkObservation) {
                    // check all properties of both observation objects
                    // add to multipleDimensions list all of them 
                    // which differs for the same key
                    if(currentObservation[key] != checkObservation [key] && 
                       -1 == $.inArray(key, this.configuration.measures) ) {
                        multipleDimensions.push (key);
                    }                
                }                
            }
            if ( 2 == ++i ) break;
        }
        
        return multipleDimensions;
    },
    
    /**
     * 
     */
    setAxes: function () {
        
        // Reset particular properties of highchart config
        // xAxis.categories:    captions for the multiple dimensions
        // series:              values for the measure
        this.activeHighChartConfig.xAxis.categories = [];
        this.activeHighChartConfig.series = [{data:[]}];
        
        // Get and save all dimensions which appears two or more times
        var multipleDimensions = this.getMultipleDimensions ();
        
        for (var currentObservation in this.rawData) {
            
            // shortcut 
            currentObservation = this.rawData [currentObservation];
            
            // iterate over dimensions and measures
            for ( var key in currentObservation ) {
                
                // set y-Axis value, if key is a measure
                if(-1 != $.inArray(key, this.configuration.measures)){
                    this.activeHighChartConfig.series[0].data.push (
                        currentObservation [key]
                    );
                }
                
                // set x-Axis value, if key is one of the multipleDimensions
                else if(-1 != $.inArray(key, multipleDimensions)) {
                    this.activeHighChartConfig.xAxis.categories.push ( 
                        currentObservation [key]
                    );
                }
            } 
        } 
    },
    
    /**
     *
     */
    setCaption: function () {
        
        // Reset caption
        this.activeHighChartConfig.title = {text:""};
        
        // Get and save all dimensions which appears two or more times
        var multipleDimensions = this.getMultipleDimensions ();
        
        var firstEntry = true;
        
        for (var currentObservation in this.rawData) {
            // shortcut 
            currentObservation = this.rawData [currentObservation];
            
            // iterate over dimensions and measures
            for ( var key in currentObservation ) {
                // set x-Axis value, if key is one of the multipleDimensions
                if(-1 == $.inArray(key, multipleDimensions) && 
                   -1 == $.inArray(key, this.configuration.measures)) {
                    
                    if (false == firstEntry) {
                        this.activeHighChartConfig.title.text += this.configuration.captionEntrySeparator;
                    }
                    
                    this.activeHighChartConfig.title.text += currentObservation [key];
                        
                    firstEntry = false;
                }
            }
            
            // We can break now, because we only use dimension with fixed values
            // and in next iteration there are no more new valus
            break;
        }
    },
    
    /**
     * @param rawData JSON object from server (result of an SPARQL query)
     * @throw org.aksw.CubeViz.ChartTransformer.HighCharts.Exception
     * @return
     */
    getChartInput: function () {
             
        // Check if everything is fine and we can start to build the chart input
        this._check ();
             
        this.setAxes ();
        
        this.setCaption ();
        
        return this.activeHighChartConfig;
    }
});
