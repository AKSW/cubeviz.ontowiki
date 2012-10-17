/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />
/// <reference path="..\DeclarationSourceFiles\Highcharts.d.ts" />

/**
 * Make variables accessible for TypeScript
 */
var CubeViz_Config = CubeViz_Config || {};
var CubeViz_Link_Chosen_Module = CubeViz_Link_Chosen_Module || {};
var CubeViz_Links_Module = CubeViz_Links_Module || {};
var CubeViz_Parameters_Component = CubeViz_Parameters_Component || {};
var CubeViz_Parameters_Module = CubeViz_Parameters_Module || {};

// REMOVE!!
var Charts = Charts || {};


/**
 * Event section
 */
$(document).ready(function(){
    Viz_Event.ready ();
});

class Viz_Event {
    /**
     * After document is ready
     */
    static ready () {
        Observation.loadAll ( 
            CubeViz_Links_Module.selectedDSD.url, 
            CubeViz_Links_Module.selectedDS.url, 
            Viz_Event.onComplete_LoadResultObservations
        );
    }
    
    /**
     * Extracts all dimensions which appears two or more times
     * @return array List of dimension names which appears two or more times
     */
    static getMultipleDimensions (selectedComponentDimensions) {
        
        var i = 0;
        var multipleDimensions = [];
        var dimensions = selectedComponentDimensions;
        var dimensions_length = dimensions.length;
        
        for(var i in selectedComponentDimensions) {
            console.log ( i );
			if( selectedComponentDimensions [i]["elements"].length >= 1) {
				multipleDimensions.push(selectedComponentDimensions [i].type);
			}
		}
        
        return multipleDimensions;
    }
    
    /**
     * 
     */
    static onComplete_LoadResultObservations (entries) {
        
        console.log ( "" );
        console.log ( "onComplete_LoadResultObservations" );
        console.log ( entries );
        
        var chart = Charts ["HighCharts"]["Bar2"];
            
        // init chart instance
        chart.init (
            entries,
            CubeViz_Links_Module,
            Viz_Event.getMultipleDimensions (CubeViz_Links_Module.selectedComponents.dimensions)
        );
        
        var renderedChart = chart.getRenderResult();
        
        console.log ( renderedChart );
        
        new Highcharts.Chart(renderedChart);
    }
}
