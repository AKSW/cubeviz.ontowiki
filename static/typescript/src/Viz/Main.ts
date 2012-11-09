/// <reference path="..\DeclarationSourceFiles\jquery.d.ts" />

class Viz_Main {
    
    /**
     * 
     */
    static closeChartSelectionMenu () : void {
        $("#chartSelectionMenu").slideUp ( 500 );
    }
    
    /**
     * 
     */
    static hideMenuDongle () : void {
        $("#chartSelectionMenuDongle").hide();
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
                    .css ( "margin-top", "15px" )
                    .attr ( "value", "Update chart" );
                    
            // fill #chartSelectionMenu; when its done, fade it in!
            $("#chartSelectionMenuContent")
                .html ( generatedHtml )
                .append ( menuButton );
                
            $("#chartSelectionMenu")
                .css ( "left", leftPosition )
                .css ( "top", topPosition )
                .slideDown ( 800 );
                
            $("#chartSelectionMenuButton").click (Viz_Event.onClick_chartSelectionMenuButton);
            
            $("#chartSelectionMenuCloseCross").click (Viz_Main.closeChartSelectionMenu);
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
    
    /**
     * 
     */
    static showLoadingNotification () : void {
        
        var img = $("<img/>");
            img.attr ( "src", CubeViz_Config ["imagesPath"] + "loader.gif" );
            
        img = $("<div id=\"loadingNotification\"></div>")
                .append ( img )
                .append ( "&nbsp; Loading ..." );
        
        $("#container")
            .html ("")
            .append (img);        
    }
    
    /**
     * 
     */
    static showMenuDongle (offset:Object) : void {
        
        // extract positions out of offset
        var containerOffset = $("#container").offset (),
            menuWidth = parseInt ( $("#chartSelectionMenu").css ("width") ),
            leftPosition = offset["left"] - containerOffset ["left"] + 4,
            topPosition = offset["top"] - 43;
                
            // build the dongle
        $("#chartSelectionMenuDongle")
            .attr ("src", CubeViz_Config ["imagesPath"] + "menuDongle.png")
            .css  ("left", leftPosition)
            .css  ("top", topPosition)
            .fadeIn (800);
    }
}
