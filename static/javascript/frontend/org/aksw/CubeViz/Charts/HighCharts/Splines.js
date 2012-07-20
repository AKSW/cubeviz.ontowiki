Namespacedotjs('org.aksw.CubeViz.Charts.HighCharts.Splines', {
	
	/**
	 * Notes:
	 * In this class multipleDimensions ALWAYS has got only one element
	 */
	
	observations: null,
	parameters: null,
	nDimension: null,

	init: function(observations, parameters, multipleDimensions) {
		this.observations = observations;
		this.parameters = parameters;
		this.nDimension = multipleDimensions[0];
		
		this.categories = this.getCategories(observations, parameters, this.nDimension);
		this.mainTitle = this.getMainTitle(parameters);
		this.series = this.getSeries(observations, parameters, this.nDimension);
		
	},
	
	getCategories: function(observations, parameters, nDimension) {
		var categories = [];
		var observation_current = null;
		var object_current = null;
		for(observation in observations) {
			observation_current = observations[observation];
			for(property in observation_current) {
				object_current = observation_current[property];
				if(property == nDimension) {
					categories.push(object_current[0].value);
				}
			}
		}
		return categories;
	},
	
	getSeries: function(observations, parameters, nDimension) {
		var series = {name: "", data: []};
		var dimComp_length = parameters.selectedDimensionComponents.selectedDimensionComponents.length;
		var dimComp_current = null;
		var observation_current = null;
		var object_current = null;
		var i = 0;
		for(i; i < dimComp_length; i++) {
			dimComp_current = parameters.selectedDimensionComponents.selectedDimensionComponents[i];
			if(dimComp_current.property != nDimension) {
				series.name += dimComp_current.property_label + " ";
			}
		}
		
		//get measure(s)
		var meas_length = parameters.selectedMeasures.measures.length;
		var meas_current = null;
		var measures = [];
		for(i = 0; i < meas_length; i++) {
			meas_current = parameters.selectedMeasures.measures[i].type;
			
			for(observation in observations) {
				observation_current = observations[observation];
				for(property in observation_current) {
					object_current = observation_current[property];
					if(property == meas_current) {
						series.data.push(object_current[0].value);
					}
				}
			}
			
		}
		
		return [series];
	},
	
	getMainTitle: function(parameters) {
		return parameters.selectedDSD.label +', '+ parameters.selectedDS.label;
	},

    getRenderResult: function() {
		var chart;
		chart = {
			chart: {
				renderTo: 'container',
				type: 'line',
				marginRight: 130,
				marginBottom: 25
			},
			title: {
				text: this.mainTitle,
				x: -20 //center
			},
			subtitle: {
				text: '',
				x: -20
			},
			xAxis: {
				categories: this.categories
			},
			yAxis: {
				title: {
					text: 'Temperature (°C)'
				},
				plotLines: [{
					value: 0,
					width: 1,
					color: '#808080'
				}]
			},
			tooltip: {
				formatter: function() {
						return '<b>'+ this.series.name +'</b><br/>'+
						this.x +': '+ this.y +'°C';
				}
			},
			legend: {
				layout: 'vertical',
				x: -10,
				y: 20,
				borderWidth: 0
			},
			series: this.series
		};
		
		return chart;
	}

});
