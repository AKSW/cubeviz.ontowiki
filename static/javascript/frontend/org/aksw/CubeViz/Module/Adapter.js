//https://github.com/smith/namespacedotjs

/*************************************************
 * Static namespace for adapter (transformation) *
 * functions in index.js                         *
 *************************************************/

// creates or use a namespace and fill it with the specified properties
Namespacedotjs('org.aksw.cubeViz.Index.Adapter', {
	
	// All functions in this namespace take some variable(s) and transform it
	// in the different format
	
	/**
	 * Packs selected dimension components into the format compatible
	 * with the Dialog template
	 */
	packDimensionComponentsForTemplate: function(selectedDimensionComponents, selectedDimensions) {
		packedDimensionComponents = [];
		i = 0;
		for(dimensionComponent in selectedDimensionComponents) {
			for(dimension in selectedDimensions.dimensions) {
				dimensionComponent_label = selectedDimensionComponents[dimensionComponent].label;
				dimension_label = selectedDimensions.dimensions[dimension].label;
				if(dimensionComponent_label == dimension_label) {
					
					if(packedDimensionComponents[dimensionComponent_label] == undefined) {
						packedDimensionComponents[dimensionComponent_label] = [];
						packedDimensionComponents[dimensionComponent_label]["list"] = [];
						//if label changed, reset i!
						i = 0;
					}
					packedDimensionComponents[dimensionComponent_label]["list"][i] = [];
									
					if(packedDimensionComponents[dimensionComponent_label]["label"] == undefined) {
						packedDimensionComponents[dimensionComponent_label]["label"] = dimensionComponent_label;
					}
					
					packedDimensionComponents[dimensionComponent_label]["list"][i]["value"] = selectedDimensionComponents[dimensionComponent].property;
					
					// TODO: request labels before (probably the best case: on config load)
					packedDimensionComponents[dimensionComponent_label]["list"][i]["label"] = "Dialog is loading, please wait!";
					
					i++;
				}			
			}	
		}
		
		return packedDimensionComponents;
	},
	
	/**
	 * Extract chart axis, label and order direction from selectedDimensions
	 * object
	 */
	extractOptionsFromSelectedDimensions: function(selectedDimensions) {
		var options = [];
		for(dimension in selectedDimensions.dimensions) {
			current_label = selectedDimensions.dimensions[dimension].label;
			current_dimension = selectedDimensions.dimensions[dimension];
			options[current_label] = [];
			options[current_label]["chartAxis"] = current_dimension.chartAxis;
			options[current_label]["label"] = current_label;
			options[current_label]["orderDirection"] = current_dimension.orderDirection;
		}
		return options;
	},
	
	/**
	 * 
	 */
	extractOptionsFromSelectedMeasures: function(selectedMeasures) {
		var options = [];
		for(measure in selectedMeasures.measures) {
			current_measure = selectedMeasures.measures[measure];
			current_label = current_measure.label;
						
			options[current_label] = [];
			options[current_label]["roundValues"] = current_measure.roundValues;
			options[current_label]["label"] = current_label;
			options[current_label]["orderDirection"] = current_measure.orderDirection;
			options[current_label]["aggregationMethod"] = current_measure.aggregationMethod;
		}
		return options;
	}
	
});
