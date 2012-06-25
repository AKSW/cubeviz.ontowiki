Namespacedotjs('org.aksw.CubeViz.ChartTransformer.HighCharts', {
    
    /**
     * Represents an Exception for HighCharts
     */
    Exception: function (message) {
        this.name = "HighCharts Exception";
        this.message = message || "";
    },
    
    /**
     * 
     */
    getSuitableGraphs: function (rawData, dimensionAssignment, measureAssignment) {
        
        var availableGraphs = ["bar", "pie"],
            suitableGraphs = [],
            graph = null;
        
        for ( var currentGraphName in availableGraphs ) {
            
            // Adapt graph name > first letter upper case and add Chart at the end
            sourceGraphName = availableGraphs [currentGraphName];
            currentGraphName = availableGraphs [currentGraphName];
            currentGraphName = currentGraphName.charAt(0).toUpperCase() + currentGraphName.slice(1) + "Chart";
            
            // Include necessary namespace
            Namespacedotjs.include("org.aksw.CubeViz.ChartTransformer.HighCharts." + currentGraphName);
            
            // Instanciate graph instance
            graph = org.aksw.CubeViz.ChartTransformer.HighCharts[currentGraphName];
            
            graph.init (rawData, null, dimensionAssignment, measureAssignment);
            
            if (true == graph.isSuitable ()) {
                suitableGraphs.push (sourceGraphName);
            }
        }      
        
        return suitableGraphs;  
    }
});
