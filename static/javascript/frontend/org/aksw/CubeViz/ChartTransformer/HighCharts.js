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
        
        var availableGraphs = ["BarChart"],//, "PieChart"],
            suitableGraphs = [],
            graph = null;
        
        for ( var currentGraphName in availableGraphs ) {
            
            currentGraphName = availableGraphs [currentGraphName];
            
            // Include necessary namespace
            Namespacedotjs.include("org.aksw.CubeViz.ChartTransformer.HighCharts." + currentGraphName);
            
            // Instanciate graph instance
            graph = org.aksw.CubeViz.ChartTransformer.HighCharts[currentGraphName];
            
            graph.init (rawData, null, dimensionAssignment, measureAssignment);
            console.log (graph);
            
            if (true == graph.isSuitable ()) {
                suitableGraphs.push (currentGraphName);
            }
        }      
        
        return suitableGraphs;  
    }
});
