/**
 * 
 */
Namespacedotjs('org.aksw.CubeViz.UserInterface.IndexAction', {
    
    /**
     * 
     */
    initUserInterfaceElements: function () {
        
        var open = true,
            opacity = 0,
            width = 0,
            message;
        
        $("#panel-separator").click ( function(event) {
            
            if ( true == open ) {
                opacity = 0.5;
                width = '+=800';
                message = 'Close Table';
                open = false;
            } else {
                opacity = 1;
                width = '-=800';
                message = 'Open Table';
                open = true;
            }
                            
            $("#panel-separator").animate({
                width: width
            }, 1000, function() {
                
                //
                $('#panel-table').slideToggle('slow', function() {
                
                    //
                    $("#panel-separator").animate({ opacity: opacity });
                    
                    $("#panel-separator").html ( message );
                });
            });
            
        });
    },
    
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
        
        var numberOfElements = 0,
            index = 0,
            row = null,
            rowHead = "";
        
        /**
         * Build and fill the table
         */        
         
        row = $('<div class="row"></div>');
         
        row.append ('<div class="row-top-left-corner">&nbsp;</div>');
        
        // Build the column heads 
        for ( var i in xAxisContent ) {
            row.append ('<div class="column-head">' + xAxisContent [i] + '</div>');
        }
        
        $("#panel-table").append (row);        
        
        // Fill in the values itself
        for ( i in yAxisContent ) {
            
            row = $('<div class="row"></div>');
            
            // set left value for y-Axis
            rowHead = 45 < yAxisContent [i].name.length 
                    ? yAxisContent [i].name.substring (0, 45) + " ..." 
                    : yAxisContent [i].name;
            
            row.append ('<div class="row-head" title="' + yAxisContent [i].name + '">' + 
                rowHead + '</div>');
            
            // fill the rest of the row up with values
            numberOfElements = yAxisContent [i].data.length;
            
            for ( index = 0; index < numberOfElements; ++index ) {
                fullValue = yAxisContent [i].data [index] + "";
                shortenValue = "0" != fullValue ? fullValue.substring (0,5) : "0";
                
                row.append ('<div class="column" title="' + fullValue + '">' + shortenValue + '</div>');
            }
            
            $("#panel-table").append ( row );
        }
        
        // $(body).trigger ("UserInterface.IndexAction.ChartSelectionComplete");
    }
});
