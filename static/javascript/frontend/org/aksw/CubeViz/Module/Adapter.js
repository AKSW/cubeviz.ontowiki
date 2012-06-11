//https://github.com/smith/namespacedotjs

/*************************************************
 * Static namespace for adapter (transformation) *
 * functions in index.js                         *
 *************************************************/

// creates or use a namespace and fill it with the specified properties
Namespacedotjs('org.aksw.CubeViz.Module.Adapter', {
	
	// All functions in this namespace take some variable(s) and transform it
	// in the different format
	
	/**
	 * Packs selected dimension components into the format compatible
	 * with the Dialog template
	 */
	packDimensionComponentsForTemplate: function(selectedDimensionComponents, selectedDimensions) {
		console.log(selectedDimensionComponents);
		console.log(selectedDimensions);
		var packedDimensionComponents = [];
		var i = 0;
		for(dimensionComponent in selectedDimensionComponents.selectedDimensionComponents) {
			var dimcomp_current = selectedDimensionComponents.selectedDimensionComponents[dimensionComponent];
			
			for(dimension in selectedDimensions.dimensions) {
				dim_current = selectedDimensions.dimensions[dimension];
				
				if(dimcomp_current.label == dim_current.label) {
					
					if(packedDimensionComponents[dimcomp_current.label] == undefined) {
						packedDimensionComponents[dimcomp_current.label] = [];
						packedDimensionComponents[dimcomp_current.label]["list"] = [];
						//if label changed, reset i!
						i = 0;
					}
					packedDimensionComponents[dimcomp_current.label]["list"][i] = [];
									
					if(packedDimensionComponents[dimcomp_current.label]["label"] == undefined) {
						packedDimensionComponents[dimcomp_current.label]["label"] = dimcomp_current.label;
					}
					
					packedDimensionComponents[dimcomp_current.label]["list"][i]["value"] = dimcomp_current.property;
					
					packedDimensionComponents[dimcomp_current.label]["list"][i]["label"] = dimcomp_current.property_label;
					
					packedDimensionComponents[dimcomp_current.label]["list"][i]["dimension"] = dimcomp_current.label;
					
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
