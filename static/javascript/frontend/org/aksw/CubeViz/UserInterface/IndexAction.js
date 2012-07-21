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
    }
});
