/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class Viz_Main {
    /**
     * 
     */
	static updateChartSelection ( suiteableCharts:Object[] ) {
        
        // if($("#chartSelection").html())
		//	return;
            
        var iconPath = "", name = "", item = null, icon = null;
        
        // go through all suitableCharts
        $.each(suiteableCharts, function (index, element) {            
            // set values
            iconPath = CubeViz_Config ["imagesPath"] + element ["icon"];
            name = element ["class"];
			
            // create div for chart image
            item = $("<div></div>").addClass("chartSelector-item");
			
            // create image and set its values, after that, append it to its own div
            icon = $("<img/>").attr({
				"src": iconPath,
				"name": name,
				"class": "chartSelectionItem"
			}).appendTo(item);
            
            // in the end, append div to #chartSelection div
			item.appendTo ( $("#chartSelection") );
        });
        
		$("#chartSelection").addClass("chartSelector");
        
        /**
         * Initialize chart selector and neccessary items
         */        
        // TODO
        ChartSelector.onFocus_Item = function(nr){
            console.log ( "onSelect_Item for " + nr );
        };
		
        ChartSelector.init(0);
    }
}
