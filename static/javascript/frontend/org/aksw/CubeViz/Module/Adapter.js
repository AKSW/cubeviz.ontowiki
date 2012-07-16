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
	packDimensionComponentsForTemplate: function(selectedDimensionComponents) {
		var packedDimensionComponents = [];
		var i = 0;
		var dimcomp_current = null;
		for(dimensionComponent in selectedDimensionComponents.selectedDimensionComponents) {
			dimcomp_current = selectedDimensionComponents.selectedDimensionComponents[dimensionComponent];
			
			if(packedDimensionComponents[dimcomp_current.dimension_label] == undefined) {
				packedDimensionComponents[dimcomp_current.dimension_label] = [];
				packedDimensionComponents[dimcomp_current.dimension_label]["list"] = [];
				//if label changed, reset i!
				i = 0;
			}
			packedDimensionComponents[dimcomp_current.dimension_label]["list"][i] = [];
							
			if(packedDimensionComponents[dimcomp_current.dimension_label]["label"] == undefined) {
				packedDimensionComponents[dimcomp_current.dimension_label]["label"] = dimcomp_current.dimension_label;
			}
			
			packedDimensionComponents[dimcomp_current.dimension_label]["list"][i]["value"] = dimcomp_current.property;
			
			packedDimensionComponents[dimcomp_current.dimension_label]["list"][i]["label"] = dimcomp_current.property_label;
			
			packedDimensionComponents[dimcomp_current.dimension_label]["list"][i]["dimension"] = dimcomp_current.dimension_label;
			
			i++;	
		}
		
		return packedDimensionComponents;
	},
	
	/**
	 * Extract chart axis, label and order direction from selectedDimensions
	 * object
	 */
	extractOptionsFromSelectedDimensions: function(selectedDimensions) {
		var options = [];
		var label_current = null;
		var dimension_current = null;
		for(dimension in selectedDimensions.dimensions) {
			dimension_current = selectedDimensions.dimensions[dimension];
			
			options[label_current] = [];
			options[label_current]["chartAxis"] = dimension_current.chartAxis;
			options[label_current]["label"] = dimension_current.label;
			options[label_current]["orderDirection"] = dimension_current.orderDirection;
		}
		return options;
	},
	
	/**
	 * 
	 */
	extractOptionsFromSelectedMeasures: function(selectedMeasures) {
		var options = [];
		var label_current = null;
		var measure_current = null;
		for(measure in selectedMeasures.measures) {
			measure_current = selectedMeasures.measures[measure];
						
			options[label_current] = [];
			options[label_current]["roundValues"] = measure_current.roundValues;
			options[label_current]["label"] = measure_current.label;
			options[label_current]["orderDirection"] = measure_current.orderDirection;
			options[label_current]["aggregationMethod"] = measure_current.aggregationMethod;
		}
		return options;
	},
	
	processRetrievedDimensions: function(retrievedDimensions, selectedDimensions) {
		var processedDimensions = [];
				
		//set defaults
		var retrievedDimensions_length = retrievedDimensions.length;
		var dimension_current = null;
		while(retrievedDimensions_length--) {
			dimension_current = retrievedDimensions[retrievedDimensions_length];
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
		if(!jQuery.isEmptyObject(selectedDimensions)) {
			var processedDimensions_length = processedDimensions.length;
			var dimension_current = null;
			var seldimension_current = null;
			var selectedDimension_length = null;
			while(processedDimensions_length--) {
				dimension_current = processedDimensions[processedDimensions_length];
				selectedDimension_length = selectedDimensions.dimensions.length;
				while(selectedDimension_length--) {
					seldimension_current = selectedDimensions.dimensions[selectedDimension_length];
								
					if(seldimension_current.url == dimension_current.url) {
						processedDimensions[processedDimensions_length] = seldimension_current;
					}
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
		var measure_current = null;
		while(retrievedMeasures_length--) {
			measure_current = retrievedMeasures[retrievedMeasures_length];
			//measure_current.label;
			//measure_current.url_md5;
			//measure_current.url;
			//measure_current.type;
			//measure_current.order;
			processedMeasures.push(measure_current);
		}
		
		//look if there any measures exists in selectedMeasures
		if(!jQuery.isEmptyObject(selectedMeasures)) {
			
			var processedMeasures_length = processedMeasures.length;
			var measure_current = null;
			var selectedMeasure_length = null;
			var selmeasure_current = null;		
			while(processedMeasures_length--) {
				measure_current = processedMeasures[processedMeasures_length];
				selectedMeasure_length = selectedMeasures.measures.length;
						
				while(selectedMeasure_length--) {
					selmeasure_current = selectedMeasures.measures[selectedMeasure_length];
								
					if(selmeasure_current.url == measure_current.url) {
						processedMeasures[processedMeasures_length] = selmeasure_current;
					}
				}
			}
		}
		
		//pack everything inside a "measures" key
		return {"measures":processedMeasures};
	},
	
	processRetrievedDimensionComponents: function(retrievedDimComps, selectedDimComps, dimensions) {
		var result = [];
		
		var label_current = null;
		var dimension_current = null;
		var dimension_reference = null;
		for(dimCompLabel in retrievedDimComps) {
			label_current = dimCompLabel;
			dimension_current = retrievedDimComps[label_current];
			for(dim in dimensions.dimensions) {
				if(dimensions.dimensions[dim]['label'] == label_current) {
					dimension_reference = dimensions.dimensions[dim];
				}
			}
						
			for(component in dimension_current) {
				result.push( { "property_label": dimension_current[component].property_label,
							   "property":dimension_current[component].property,
							   "dimension_label":label_current,
							   "dimension_url":dimension_reference.url,
							   "dimension_type": dimension_reference.type } );
			}
			
		}
		
		function compare(a,b) {
			if (a.dimension_label < b.dimension_label)
				return -1;
			if (a.dimension_label > b.dimension_label)
				return 1;
			return 0;
		}
		
		result.sort(compare);
		
		return {"selectedDimensionComponents":result};
	}	
});
