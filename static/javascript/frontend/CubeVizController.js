$(document).ready(function(){
	
    // Prevent you for getting:
    // > event.layerX and event.layerY are broken and deprecated in WebKit. 
    // > They will be removed from the engine in the near future.
    $.event.props = ['altKey', 'attrChange', 'attrName', 'bubbles', 'button', 'cancelable', 'charCode', 'clientX', 'clientY', 'ctrlKey', 'currentTarget', 'data', 'detail', 'eventPhase', 'fromElement', 'handler', 'keyCode', 'layerX', 'layerY', 'metaKey', 'newValue', 'offsetX', 'offsetY', 'pageX', 'pageY', 'prevValue', 'relatedNode', 'relatedTarget', 'screenX', 'screenY', 'shiftKey', 'srcElement', 'target', 'toElement', 'view', 'wheelDelta', 'which'];
    // remove layerX and layerY
    if ($.event.props[17] == 'layerX') {
      $.event.props.splice(17, 2);
    }
        
	/************
	 * Includes *
	 ************/
	 
	Namespacedotjs.include('org.aksw.CubeViz.Controller.Main');
    var CubeViz_Controller_Main = org.aksw.CubeViz.Controller.Main;
	 
	Namespacedotjs.include('org.aksw.CubeViz.UserInterface.IndexAction');
    var CubeViz_UserInterface_IndexAction = org.aksw.CubeViz.UserInterface.IndexAction;
    
    /******************
     * Event Handlers *
     ******************/
     
    $(body).bind("AjaxCubeVizParametersRetrieved.CubeViz", function(event, CubeViz_Link_Chosen) {
		// set parameters to global array
		var retrievedParameters = CubeViz_Controller_Main.retrievedCubeVizParameters;
        
        CubeViz_Parameters_Component.sparqlEndpoint = retrievedParameters.sparqlEndpoint;
        CubeViz_Parameters_Component.selectedGraph = retrievedParameters.selectedGraph;
        CubeViz_Parameters_Component.selectedDSD = retrievedParameters.selectedDSD;
        CubeViz_Parameters_Component.selectedDS = retrievedParameters.selectedDS;
        CubeViz_Parameters_Component.selectedMeasures = retrievedParameters.selectedMeasures;
        CubeViz_Parameters_Component.selectedDimensions = retrievedParameters.selectedDimensions;
        CubeViz_Parameters_Component.selectedDimensionComponents = retrievedParameters.selectedDimensionComponents;
        
		//get observations for the retrieved parameters
		CubeViz_Controller_Main.getResultObservations(CubeViz_Link_Chosen);
	});
	
	$(body).bind("AjaxResultObservationsRetrieved.CubeViz", function(event) {
		
		//check if there is suitable charts
		var CubeViz_multipleDimensions = CubeViz_Controller_Main.getMultipleDimensions(CubeViz_Parameters_Component);
		var CubeViz_suitableCharts = CubeViz_Controller_Main.getSuitableChartTypes(CubeViz_multipleDimensions, CubeViz_ChartConfig);
        var c = null;
        
        // UI: update chart selection field
        CubeViz_UserInterface_IndexAction.updateChartSelection ( CubeViz_suitableCharts );
        
		CubeViz_Controller_Main.retrievedResultObservations = CubeViz_Controller_Main.sortObservations(CubeViz_Controller_Main.retrievedResultObservations);
		
		if(CubeViz_suitableCharts.charts.length != 0) {
			
			//check if selected chart type is in the suitable charts array
			var isInTheList = false;
			var chart = null;
			for(i = 0; i < CubeViz_suitableCharts.charts.length; i++) {
				chart = CubeViz_suitableCharts.charts[i];
				if(chart['class'] == CubeViz_Controller_Main.selectedChartClass)
					isInTheList = true;
			}
			
			//pick the first suitable chart type if no chart was selected
            if(CubeViz_Controller_Main.selectedChartClass && isInTheList) {
				useChartClass = CubeViz_Controller_Main.selectedChartClass;
			} else {
				var chart = CubeViz_suitableCharts.charts[0];
				useChartClass = chart['class'];
			}
			
            Namespacedotjs.include(useChartClass);
            
			eval('var chart = ' + useChartClass + ';');
            
            
			// init chart instance
            chart.init (
                CubeViz_Controller_Main.retrievedResultObservations, 
                CubeViz_Parameters_Component,
                CubeViz_multipleDimensions
            );
			
			var renderedChart = chart.getRenderResult();
            
			CubeViz_Controller_Main.renderChart(renderedChart);
		} else {
			//TODO: notify user that there is no suitable charts
			return;
            
		}	
	});
	
    /**
     * After chart selection was completely built up
     */
	$(body).bind("UserInterface.IndexAction.ChartSelectionComplete", function(event) {
		CubeViz_UserInterface_IndexAction.setupChartSelectionEvent ();
	});
    
    // Setup user interface elements
    CubeViz_UserInterface_IndexAction.initUserInterfaceElements ();
        
    //init controller
    CubeViz_Controller_Main.init(CubeViz_Parameters_Component);
    //get the parameters for the link
    CubeViz_Controller_Main.getParametersFromLink(CubeViz_Link_Chosen_Component);    
});
