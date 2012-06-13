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
	},
	
	processRetrievedDimensions: function(retrievedDimensions, selectedDimensions) {
		var processedDimensions = [];
		
		//set defaults
		var retrievedDimensions_length = retrievedDimensions.length;
		while(retrievedDimensions_length--) {
			var dimension_current = retrievedDimensions[retrievedDimensions_length];
			//dimension_current.label;
			//dimension_current.url_md5;
			//dimension_current.url;
			//dimension_current.type;
			//dimension_current.order;
			dimension_current.chartAxis = "x";
			dimension_current.orderDirection = "None";
			dimension_current.elementCount = 0;
			dimension_current.selectedElementCount = 0;
			processedDimensions.push(dimension_current);
		}
		
		//look if there any dimensions exists in selectedDimensions
		var processedDimensions_length = processedDimensions.length;
		while(processedDimensions_length--) {
			var dimension_current = processedDimensions[processedDimensions_length];
			var selectedDimension_length = selectedDimensions.dimensions.length;
			while(selectedDimension_length--) {
				var seldimension_current = selectedDimensions.dimensions[selectedDimension_length];
							
				if(seldimension_current.url == dimension_current.url) {
					processedDimensions[processedDimensions_length] = seldimension_current;
				}
			}
		}
		
		//pack everything inside a "dimensions" key
		return {"dimensions":processedDimensions};
	},
	
	processRetrievedMeasures: function(retrievedMeasures, selectedMeasures) {
		var processedMeasures = [];
		
		//set defaults
		var retrievedMeasures_length = retrievedMeasures.length;
		while(retrievedMeasures_length--) {
			var measure_current = retrievedMeasures[retrievedMeasures_length];
			//measure_current.label;
			//measure_current.url_md5;
			//measure_current.url;
			//measure_current.type;
			//measure_current.order;
			measure_current.aggregationMethod = "sum";
			measure_current.orderDirection = "None";
			measure_current.roundValues = "no";
			processedMeasures.push(measure_current);
		}
		
		//look if there any measures exists in selectedMeasures
		var processedMeasures_length = processedMeasures.length;
		while(processedMeasures_length--) {
			var measure_current = processedMeasures[processedMeasures_length];
			var selectedMeasure_length = selectedMeasures.measures.length;
			while(selectedMeasure_length--) {
				var selmeasure_current = selectedMeasures.measures[selectedMeasure_length];
							
				if(selmeasure_current.url == measure_current.url) {
					processedMeasures[processedMeasures_length] = selmeasure_current;
				}
			}
		}
		
		//pack everything inside a "measures" key
		return {"measures":processedMeasures};
	}	
});
