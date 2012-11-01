/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class Viz_Main {
    
    /**
     * 
     */
    static closeChartSelectionMenu () : void {
        $("#chartSelectionMenu").fadeOut ( 500 );
    }
    
    /**
     * 
     */
    static openChartSelectionMenu (options:Object[], offset:Object) : void {
        if ( 0 < options["length"] ) {
                   
            var containerOffset = $("#container").offset (),
                menuWidth = parseInt ( $("#chartSelectionMenu").css ("width") ),
                leftPosition = offset["left"] - containerOffset ["left"] - menuWidth + 18,
                topPosition = offset["top"] - 40,
                
                generatedHtml = ChartSelector.buildMenu ( options ),
            
                menuButton = $("<input/>")
                    .attr ( "id", "chartSelectionMenuButton" )
                    .attr ( "type", "button" )
                    .attr ( "class", "minibutton submit" )
                    .attr ( "type", "button" )
                    .attr ( "value", "update chart" );
                    
            // fill #chartSelectionMenu; when its done, fade it in!
            $("#chartSelectionMenu")
                .html ( generatedHtml )
                .append ( menuButton )
                .css ( "left", leftPosition ).css ( "top", topPosition )
                .fadeIn ( 500 );
                
            $("#chartSelectionMenuButton").click (Viz_Event.onClick_chartSelectionMenuButton);
        }
    }
    
    /**
     * 
     */
    static renderChart (className:string) : void {
        
        // get chart name
        var charts = CubeViz_ChartConfig [CubeViz_Data ["numberOfMultipleDimensions"]]["charts"];
        
        // get class
        var fromChartConfig = HighCharts_Chart.getFromChartConfigByClass (
            className, charts
        );
        
        var chart = HighCharts.loadChart ( className );
                    
        // init chart instance
        chart.init ( 
            CubeViz_Data ["retrievedObservations"], 
            CubeViz_Links_Module,
            fromChartConfig ["defaultConfig"]
        );
                
        // show chart
        new Highcharts.Chart(chart.getRenderResult());
    }
}
