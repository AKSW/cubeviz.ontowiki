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
		//console.log(observations);
		//console.log(parameters);
		//console.log(parameters.selectedDimensionComponents.selectedDimensionComponents);
		var dimComp_length = parameters.selectedDimensionComponents.selectedDimensionComponents.length;
		var dimComp_current = null;
		var i = 0;
		for(i; i < dimComp_length; i++) {
			dimComp_current = parameters.selectedDimensionComponents.selectedDimensionComponents[i];
			console.log(dimComp_current);
		}		
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
				categories: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
					'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
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
				align: 'right',
				verticalAlign: 'top',
				x: -10,
				y: 100,
				borderWidth: 0
			},
			series: [{
				name: 'Tokyo',
				data: [7.0, 6.9, 9.5, 14.5, 18.2, 21.5, 25.2, 26.5, 23.3, 18.3, 13.9, 9.6]
			}, {
				name: 'New York',
				data: [-0.2, 0.8, 5.7, 11.3, 17.0, 22.0, 24.8, 24.1, 20.1, 14.1, 8.6, 2.5]
			}, {
				name: 'Berlin',
				data: [-0.9, 0.6, 3.5, 8.4, 13.5, 17.0, 18.6, 17.9, 14.3, 9.0, 3.9, 1.0]
			}, {
				name: 'London',
				data: [3.9, 4.2, 5.7, 8.5, 11.9, 15.2, 17.0, 16.6, 14.2, 10.3, 6.6, 4.8]
			}]
		};
		
		return chart;
	}

});
