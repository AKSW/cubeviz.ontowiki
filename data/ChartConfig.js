var CubeViz_ChartConfig = 
	{
		"1": {
			"charts": [
				{
					"label": "splines",
					"class": "org.aksw.CubeViz.Charts.HighCharts.Splines",
					"libraryLabel": "HighCharts",
					"enabled": true,
					"icon": "/static/images/splines.png"
				},
				{
					"label": "bar",
					"class": "org.aksw.CubeViz.Charts.HighCharts.Bar",
					"libraryLabel": "HighCharts",
					"enabled": true,
					"icon": "/static/images/bar.png"
				}
			]	
		},
		"2": {
			"charts": [
				{
					"label": "scatterplot",
					"class": "org.aksw.CubeViz.Charts.HighCharts.Scatterplot",
					"libraryLabel": "HighCharts",
					"enabled": false,
					"icon": "/static/images/scatterplot.png"
				}
			]
		}
	};

CubeViz_ChartConfig = CubeViz_ChartConfig_filterOutDisabled(CubeViz_ChartConfig);

function CubeViz_ChartConfig_filterOutDisabled(CubeViz_ChartConfig) {
	CubeViz_ChartConfig_enabledOnly = {};
	var element_current = null;
	for(element in CubeViz_ChartConfig) {
		element_current = CubeViz_ChartConfig[element]['charts'];
		var i = 0;
		var element_length = element_current.length;
		for(i; i < element_length; i++) {
			if(!element_current[i]['enabled']) {
				delete CubeViz_ChartConfig[element]['charts'][i]; 
				CubeViz_ChartConfig[element]['charts'] = CubeViz_ChartConfig_cleanUpArray(CubeViz_ChartConfig[element]['charts']);
			}
		}
	}
	return CubeViz_ChartConfig;
}

function CubeViz_ChartConfig_cleanUpArray(arr) {
	var newArr = new Array();for (var k in arr) if(arr[k]) newArr.push(arr[k]);
	return newArr;
}
