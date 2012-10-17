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
$(document).ready(function () {
    Viz_Event.ready();
});
var Viz_Event = (function () {
    function Viz_Event() { }
    Viz_Event.ready = function ready() {
        Observation.loadAll(CubeViz_Links_Module.selectedDSD.url, CubeViz_Links_Module.selectedDS.url, Viz_Event.onComplete_LoadResultObservations);
    }
    Viz_Event.onComplete_LoadResultObservations = function onComplete_LoadResultObservations(entries) {
        console.log("");
        console.log("onComplete_LoadResultObservations");
        console.log(entries);
    }
    return Viz_Event;
})();
var Viz_Main = (function () {
    function Viz_Main() { }
    return Viz_Main;
})();
