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
                   
            var containerOffset = $("#container").offset(),
                menuWidth = parseInt ( $("#chartSelectionMenu").css ("width") ),
                leftPosition = offset["left"] - containerOffset ["left"] - menuWidth + 18,
                topPosition = offset["top"] - containerOffset ["top"] + 67,
                
                generatedHtml = ChartSelector.buildMenu ( options ),
            
                menuButton = $("<input type=\"button\"/>")
                    .attr ( "id", "chartSelectionMenuButton" )
                    .attr ( "class", "minibutton submit" )
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
        var fromChartConfig = Visualization_Controller.getFromChartConfigByClass (
            className, charts
        );
        
        switch ( Visualization_Controller.getVisualizationType ( className ) ) {
            
            case "CubeViz":
            
                var visz = Visualization_CubeViz.load ( className );
                
                visz.init (
                    CubeViz_Data ["retrievedObservations"], 
                    CubeViz_Links_Module,
                    fromChartConfig ["defaultConfig"]
                );
                
                visz.render ();
            
                break;
                
            default: // HighCharts
                
                var chart = Visualization_HighCharts.load ( className );
                    
                // init chart instance
                chart.init ( 
                    CubeViz_Data ["retrievedObservations"], 
                    CubeViz_Links_Module,
                    fromChartConfig ["defaultConfig"]
                );
                        
                // show chart
                new Highcharts.Chart(chart.getRenderResult());
            
                break;
        }
    }
    
    /**
     * Go through the given menu items and set the values by given key (specific or intern)
     */
    static setMenuOptions (menuItems:Object[], newDefaultConfig:Object) : void {
        
        var key = null, 
            length = menuItems["length"],
            value = null;
        
        // start from the second item, because the first one is the template entry
        for ( var i=1; i < length; ++i ) {
            key = $(menuItems [i]).attr ( "key" );
            value = $(menuItems [i]).attr ( "value" );
            
            // Check if the option is visualization specific or an intern (starts with _)
            if ( "_" == key [0] ) {
                switch ( key ) {
                    case "_highchart_switchAxes": 
                        CubeViz_Data ["_highchart_switchAxes"] = "true" == value ? true : false;
                        break;
                }
            } 
            
            else {
                System.setObjectProperty ( 
                    newDefaultConfig, key, ".", value 
                );
            }
        }
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
        var containerOffset = $("#container").offset(),
            menuWidth = parseInt ( $("#chartSelectionMenu").css ("width") ),
            leftPosition = offset["left"] - containerOffset ["left"] + 4,
            topPosition = offset["top"] - containerOffset ["top"] + 65;
            
        // build the dongle
        $("#chartSelectionMenuDongle")
            .attr ("src", CubeViz_Config ["imagesPath"] + "menuDongle.png")
            .css  ("left", leftPosition)
            .css  ("top", topPosition)
            .fadeIn (800);
    }
}
