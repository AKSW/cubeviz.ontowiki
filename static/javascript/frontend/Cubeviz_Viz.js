$(document).ready(function () {
    Viz_Event.ready();
});
var Viz_Event = (function () {
    function Viz_Event() { }
    Viz_Event.ready = function ready() {
        console.log("VIZZZZ");
    }
    return Viz_Event;
})();
var Viz_Main = (function () {
    function Viz_Main() { }
    return Viz_Main;
})();
