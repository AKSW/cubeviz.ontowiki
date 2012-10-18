var Observation = (function () {
    function Observation() { }
    Observation.loadAll = function loadAll(dsdUrl, dsUrl, callback) {
        $.ajax({
            url: CubeViz_Links_Module["cubevizPath"] + "getresultobservations/",
            data: {
                m: CubeViz_Links_Module["modelUrl"],
                lC: CubeViz_Links_Module["linkCode"],
                sparqlEndpoint: "local"
            }
        }).done(function (entries) {
            Observation.prepareLoadedResultObservations(entries, callback);
        });
    }
    Observation.prepareLoadedResultObservations = function prepareLoadedResultObservations(entries, callback) {
        callback($.parseJSON(entries));
    }
    return Observation;
})();
var System = (function () {
    function System() { }
    System.out = function out(output) {
        if(typeof console !== "undefined" && typeof console.log !== "undefined" && "development" == CubeViz_Config.context) {
            console.log(output);
        }
    }
    System.call = function call(f, param) {
        if(typeof f !== "undefined") {
            if(typeof param !== "undefined") {
                eval("f (param);");
            } else {
                f();
            }
        }
    }
    System.rand = function rand() {
        return Math.floor(Math.random() * (2147483647 + 1));
    }
    System.deepCopy = function deepCopy(elementToCopy) {
        var newElement = $.parseJSON(JSON.stringify(elementToCopy));
        return newElement;
    }
    return System;
})();
var HighCharts = (function () {
    function HighCharts() { }
    HighCharts.loadChart = function loadChart(chartName) {
        switch(chartName) {
            case 'Bar2': {
                return new HighCharts_Bar2();

            }
            default: {
                System.out("HighCharts - loadChart");
                System.out("Invalid chartName given!");
                return;

            }
        }
    }
    return HighCharts;
})();
var HighCharts_Chart = (function () {
    function HighCharts_Chart() { }
    HighCharts_Chart.prototype.init = function (entries, cubeVizConfig, chartConfig) {
    };
    HighCharts_Chart.prototype.getRenderResult = function () {
        return {
        };
    };
    return HighCharts_Chart;
})();
var __extends = this.__extends || function (d, b) {
    function __() { this.constructor = d; }
    __.prototype = b.prototype;
    d.prototype = new __();
}
var HighCharts_Bar2 = (function (_super) {
    __extends(HighCharts_Bar2, _super);
    function HighCharts_Bar2() {
        _super.apply(this, arguments);

        this.xAxis = {
            "categories": []
        };
        this.series = [];
        this.chartConfig = {
        };
    }
    HighCharts_Bar2.prototype.init = function (entries, cubeVizConfig, chartConfig) {
        console.log("");
        console.log("entries");
        console.log(entries);
        console.log("");
        console.log("cubeVizConfig");
        console.log(cubeVizConfig);
        console.log("");
        console.log("chartConfig");
        console.log(chartConfig);
        var dimensionLabels = [
            ""
        ];
        var forXAxis = null;
        var forSeries = null;
        this.chartConfig = chartConfig;
        for(var dimensionLabel in cubeVizConfig["selectedComponents"]["dimensions"]) {
            if(null == forXAxis) {
                forXAxis = cubeVizConfig["selectedComponents"]["dimensions"][dimensionLabel];
            } else {
                forSeries = cubeVizConfig["selectedComponents"]["dimensions"][dimensionLabel];
            }
        }
        this.xAxis.categories = [];
        for(var i in forXAxis["elements"]) {
            this.xAxis.categories.push(forXAxis["elements"][i]["property_label"]);
        }
        this.xAxis.categories.sort(function (a, b) {
            return a.toString().toUpperCase().localeCompare(b.toString().toUpperCase());
        });
        this.series = [];
        var seriesData = this.structureEntries(forSeries, this.extractMeasureValue(cubeVizConfig), entries);
        for(var i in forSeries["elements"]) {
            this.series.push({
                "name": forSeries["elements"][i]["property_label"],
                "data": seriesData[forSeries["elements"][i]["property"]]
            });
        }
        console.log("this.series");
        console.log(this.series);
    };
    HighCharts_Bar2.prototype.getRenderResult = function () {
        this.chartConfig["xAxis"] = this.xAxis;
        this.chartConfig["series"] = this.series;
        return this.chartConfig;
    };
    HighCharts_Bar2.prototype.extractMeasureValue = function (cubeVizConfig) {
        for(var label in cubeVizConfig.selectedComponents.measures) {
            return cubeVizConfig["selectedComponents"]["measures"][label]["type"];
        }
    };
    HighCharts_Bar2.prototype.structureEntries = function (forSeries, propertiesValueUri, entries) {
        var seriesData = {
        };
        var dimensionType = forSeries.type;
        console.log("entries");
        console.log(entries);
        console.log("");
        console.log("");
        for(var mainIndex in entries) {
            for(var propertyUri in entries[mainIndex]) {
                if(propertyUri == dimensionType) {
                    if("undefined" == typeof seriesData[entries[mainIndex][propertyUri][0]["value"]]) {
                        seriesData[entries[mainIndex][propertyUri][0]["value"]] = [];
                    }
                    seriesData[entries[mainIndex][propertyUri][0]["value"]].push(entries[mainIndex][propertiesValueUri][0]["value"]);
                }
            }
        }
        return seriesData;
    };
    return HighCharts_Bar2;
})(HighCharts_Chart);
var CubeViz_Config = CubeViz_Config || {
};
var CubeViz_Link_Chosen_Module = CubeViz_Link_Chosen_Module || {
};
var CubeViz_Links_Module = CubeViz_Links_Module || {
};
var CubeViz_Parameters_Component = CubeViz_Parameters_Component || {
};
var CubeViz_Parameters_Module = CubeViz_Parameters_Module || {
};
var CubeViz_ChartConfig = CubeViz_ChartConfig || {
};
$(document).ready(function () {
    Viz_Event.ready();
});
var Viz_Event = (function () {
    function Viz_Event() { }
    Viz_Event.ready = function ready() {
        Observation.loadAll(CubeViz_Links_Module.selectedDSD.url, CubeViz_Links_Module.selectedDS.url, Viz_Event.onComplete_LoadResultObservations);
    }
    Viz_Event.onComplete_LoadResultObservations = function onComplete_LoadResultObservations(entries) {
        var chart = HighCharts.loadChart("Bar2");
        chart.init(entries, CubeViz_Links_Module, CubeViz_ChartConfig["2"][0]["types"][0].config);
        var renderedChart = chart.getRenderResult();
        console.log("");
        console.log("renderedChart");
        console.log(renderedChart);
        new Highcharts.Chart(renderedChart);
    }
    return Viz_Event;
})();
var Viz_Main = (function () {
    function Viz_Main() { }
    return Viz_Main;
})();
