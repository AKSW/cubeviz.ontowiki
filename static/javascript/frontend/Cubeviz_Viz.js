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
var Charts = Charts || {
};
$(document).ready(function () {
    Viz_Event.ready();
});
var Viz_Event = (function () {
    function Viz_Event() { }
    Viz_Event.ready = function ready() {
        Observation.loadAll(CubeViz_Links_Module.selectedDSD.url, CubeViz_Links_Module.selectedDS.url, Viz_Event.onComplete_LoadResultObservations);
    }
    Viz_Event.getMultipleDimensions = function getMultipleDimensions(selectedComponentDimensions) {
        var i = 0;
        var multipleDimensions = [];
        var dimensions = selectedComponentDimensions;
        var dimensions_length = dimensions.length;
        for(var i in selectedComponentDimensions) {
            console.log(i);
            if(selectedComponentDimensions[i]["elements"].length >= 1) {
                multipleDimensions.push(selectedComponentDimensions[i].type);
            }
        }
        return multipleDimensions;
    }
    Viz_Event.onComplete_LoadResultObservations = function onComplete_LoadResultObservations(entries) {
        console.log("");
        console.log("onComplete_LoadResultObservations");
        console.log(entries);
        var chart = Charts["HighCharts"]["Bar2"];
        chart.init(entries, CubeViz_Links_Module, Viz_Event.getMultipleDimensions(CubeViz_Links_Module.selectedComponents.dimensions));
        var renderedChart = chart.getRenderResult();
        console.log(renderedChart);
        new Highcharts.Chart(renderedChart);
    }
    return Viz_Event;
})();
var Viz_Main = (function () {
    function Viz_Main() { }
    return Viz_Main;
})();
