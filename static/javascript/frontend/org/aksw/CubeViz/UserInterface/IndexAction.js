/**
 * 
 */
Namespacedotjs('org.aksw.CubeViz.UserInterface.IndexAction', {
    
    /**
     * 
     */
    setupChartSelectionEvent: function () {
        
        // After click on an item in chartSelection, reload the chart 
        $('.chartSelectionItem').click (function(event) {
            
            Namespacedotjs.include('org.aksw.CubeViz.Controller.Main');
            var CubeViz_Controller_Main = org.aksw.CubeViz.Controller.Main;
            
            console.log(event.target.name);
            CubeViz_Controller_Main.selectedChartClass = event.target.name;
            $(body).trigger("AjaxResultObservationsRetrieved.CubeViz");
        });
        
    },
    
    /**
     * 
     */
	updateChartSelection: function ( suiteableCharts ) {
        $("#chartSelection").html ("");
        
        var iconPath = "", name = "";
        
        $.each(suiteableCharts.charts, function (index, element) {
            
            iconPath = CubeViz_Parameters_Component.cubevizImagesPath + element.icon;
            name = element ["class"];
                        
            $("#chartSelection").append (
                "<img src=\"" + iconPath + "\" name=\"" + name + "\" class=\"chartSelectionItem\">"
            );
            
        });
        
        $(body).trigger ("UserInterface.IndexAction.ChartSelectionComplete");
    },
    
    /**
     * Builds a table which contains retrieved results.
     * @param xAxisContent
     * @param yAxisContent
     */
	fillPanelTable: function (xAxisContent, yAxisContent) {
        
        $("#panel-table").html ("");
        
        console.log ( xAxisContent );
        console.log ( yAxisContent );
        
        /**
         * Build and fill the table
         */        
        $("#panel-table").append ('<div class="row">');
        $("#panel-table").append ('<div class="row-top-left-corner">&nbsp;</div>');
        
        // Build the column heads 
        for ( var i in xAxisContent ) {
            $("#panel-table").append ('<div class="column-head">' + xAxisContent [i] + '</div>');
        }
        
        $("#panel-table").append ('</div>');
        
        var numberOfElements = 0,
            index = 0,
            row = null;
        
        // Fill in the values itself
        for ( i in yAxisContent ) {
            
            row = $('<div class="row"></div>');
            
            row.append ('<div class="row-head">' + yAxisContent [i].name.substring (0, 40) + ' ... </div>');
            
            numberOfElements = yAxisContent [i].data.length;
            
            for ( index = 0; index < numberOfElements; ++index ) {
                fullValue = yAxisContent [i].data [index] + "";
                shortenValue = "0" != fullValue ? "~ " + fullValue.substring (0,5) : "0";
                
                row.append ('<div class="column" title="' + fullValue + '">' + shortenValue + '</div>');
            }
            
            $("#panel-table").append ( row );
        }
        
        // $(body).trigger ("UserInterface.IndexAction.ChartSelectionComplete");
    }
});
