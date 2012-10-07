/**
 * Chart configuration
 * 
 * Each key represents the "maximum" number of multiple dimensions which can
 * be represents by one of the items in charts-array. That means, a bar chart
 * which has maximum number of two is also able to display only one dimension.
 */
var CubeViz_ChartConfig = {
    "0": {
        "charts": [
            {
                "label": "area",
                "class": "org.aksw.CubeViz.Charts.HighCharts.Area0",
                "libraryLabel": "HighCharts",
                "enabled": true,
                "icon": "area.png"
            },
            {
                "label": "bar",
                "class": "org.aksw.CubeViz.Charts.HighCharts.Bar0",
                "libraryLabel": "HighCharts",
                "enabled": true,
                "icon": "bar.png"
            },
            {
                "label": "lines",
                "class": "org.aksw.CubeViz.Charts.HighCharts.Line0",
                "libraryLabel": "HighCharts",
                "enabled": true,
                "icon": "line.png"
            },
            {
                "label": "pie",
                "class": "org.aksw.CubeViz.Charts.HighCharts.Pie0",
                "libraryLabel": "HighCharts",
                "enabled": true,
                "icon": "pie.png"
            }
        ]	
    },
    "1": {
        "charts": [
            {
                "label": "pie",
                "class": "org.aksw.CubeViz.Charts.HighCharts.Pie1",
                "libraryLabel": "HighCharts",
                "enabled": true,
                "icon": "pie.png"
            },
            {
                "label": "line",
                "class": "org.aksw.CubeViz.Charts.HighCharts.Line1",
                "libraryLabel": "HighCharts",
                "enabled": true,
                "icon": "line.png"
            }
        ]	
    },
    "2": {
        "charts": [
            {
                "label": "bar",
                "class": "org.aksw.CubeViz.Charts.HighCharts.Bar2",
                "libraryLabel": "HighCharts",
                "enabled": true,
                "icon": "bar.png"
            },
            {
                "label": "lines",
                "class": "org.aksw.CubeViz.Charts.HighCharts.Line2",
                "libraryLabel": "HighCharts",
                "enabled": true,
                "icon": "line.png"
            },
            {
                "label": "area",
                "class": "org.aksw.CubeViz.Charts.HighCharts.Area2",
                "libraryLabel": "HighCharts",
                "enabled": true,
                "icon": "area.png"
            },
            {
                "label": "spline",
                "class": "org.aksw.CubeViz.Charts.HighCharts.Spline2",
                "libraryLabel": "HighCharts",
                "enabled": true,
                "icon": "spline.png"
            }
        ]
    },
    "3": {
        "charts": [
            {
                "label": "bar",
                "class": "org.aksw.CubeViz.Charts.HighCharts.Bar3",
                "libraryLabel": "HighCharts",
                "enabled": false,
                "icon": "bar.png"
            }
        ]	
    }
};

CubeViz_ChartConfig = CubeViz_ChartConfig_filterOutDisabled(CubeViz_ChartConfig);

function CubeViz_ChartConfig_filterOutDisabled(CubeViz_ChartConfig) {
	CubeViz_ChartConfig_enabledOnly = {};
	var element_current = null;
    var i = 0;
    var element_length = null;
    var enabled;
	for(element in CubeViz_ChartConfig) {
		element_current = CubeViz_ChartConfig[element]['charts'];
		i = 0;
		element_length = element_current.length;
		for(i; i < element_length; ++i) {			
			if(typeof element_current[i] != 'undefined') {
                enabled = element_current[i]['enabled'];                
                if(typeof enabled != 'undefined' && enabled == false ) {
                    delete CubeViz_ChartConfig[element]['charts'][i]; 
                    CubeViz_ChartConfig[element]['charts'] = CubeViz_ChartConfig_cleanUpArray(CubeViz_ChartConfig[element]['charts']);
                }
			}
		}
	}
	return CubeViz_ChartConfig;
}

function CubeViz_ChartConfig_cleanUpArray(arr) {
	var newArr = new Array();
    for (var k in arr) if(arr[k]) newArr.push(arr[k]);
	return newArr;
}
