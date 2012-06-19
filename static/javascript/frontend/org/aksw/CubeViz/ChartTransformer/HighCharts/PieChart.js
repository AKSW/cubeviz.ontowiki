Namespacedotjs('org.aksw.CubeViz.ChartTransformer.HighCharts.PieChart', {
    
    rawData: {},
    
    /**
     * Default configuration for a BarChart (HighChart)
     */
    defaultHighChartConfig: {
        chart: {
            renderTo: 'container',
            plotBackgroundColor: null,
            plotBorderWidth: null,
            plotShadow: false
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
                    enabled: true,
                    color: '#000000',
                    connectorColor: '#000000',
                    formatter: function() {
                        return '<b>'+ this.point.name +'</b>: '+ this.percentage +' %';
                    }
                }
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
        "dimensions": [],
        "measures": [],
        "captionEntrySeparator": ", "
    },
    
    /**
     * @param 
     */
    init: function (rawData, renderToContainer, dimensionsAssignment, measuresAssignment, 
                     captionEntrySeparator) {
        
        // Reset activeHighChartConfig to defaultHighChartConfig
        this.activeHighChartConfig = this.defaultHighChartConfig;
        
        this.activeHighChartConfig.chart.renderTo = renderToContainer || "container";
        
        
        this.rawData = rawData;
        
        // Set dimensions assignment
        this.configuration.dimensions = dimensionsAssignment || this.configuration.dimensions;
        
        // Set measure assignment
        this.configuration.measures = measuresAssignment || this.configuration.measures;
        
        // Set separator for the chart caption
        this.configuration.captionEntrySeparator = captionEntrySeparator || this.configuration.captionEntrySeparator;
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
    setData: function () {
        
        // series.data contains an array of ['label', value]
        this.activeHighChartConfig.series = [{data:[]}];
        
        // Get and save all dimensions which appears two or more times
        var multipleDimensions = this.getMultipleDimensions ();
        
        for (var currentObservation in this.rawData) {
            
            // shortcut 
            currentObservation = this.rawData [currentObservation];
            
            entry = {label:"", value:-1};
            
            // iterate over dimensions and measures
            for ( var key in currentObservation ) {
                
                // set y-Axis value, if key is a measure
                if(-1 != $.inArray(key, this.configuration.measures)){
                    entry.value = currentObservation [key];
                }
                
                // set x-Axis value, if key is one of the multipleDimensions
                else if(-1 != $.inArray(key, multipleDimensions)) {
                    entry.label = currentObservation [key];
                }
                
                if ("" != entry.label && -1 != entry.value) {
                    this.activeHighChartConfig.series [0].data.push (
                        [entry.label, entry.value]
                    );
                    break;
                }
            } 
        }
        
        this.activeHighChartConfig.series [0].type = "pie";
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
             
        this.setData ();
        
        this.setCaption ();
        
        return this.activeHighChartConfig;
    }
});
