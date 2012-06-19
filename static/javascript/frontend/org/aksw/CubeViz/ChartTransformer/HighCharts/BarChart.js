Namespacedotjs('org.aksw.CubeViz.ChartTransformer.HighCharts.BarChart', {
    
    /**
     * 
     */
    highChartConfig: {
        chart: {
            renderTo: 'container',
            type: 'column'
        },
        xAxis: {
            categories: ['Jan', 'Feb']
        },
        
        plotOptions: {
            series: {
                groupPadding: 0.2
            }
        },
        
        series: [{
            data: [29.9, 71.5]
        }, {
            data: [194.1, 95.6]        
        }]
    },
    
    getChartInput: function (rawData) {
        return this.highChartConfig;
    }
});
