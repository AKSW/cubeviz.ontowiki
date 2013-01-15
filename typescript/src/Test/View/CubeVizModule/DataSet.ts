/**
 * Test if something is in the selectbox on the startup
 */
cubeViz_tests.push(function(){
    
    // real test function
    var t = function() 
    {
        var listEntries = $("#cubeviz-dataSet-list").children(),
            givenDSs = _.keys(cubeVizApp._.data.dataSets);
        
        this.assertTrue(
            listEntries.length == givenDSs.length,
            listEntries.length + " == " + givenDSs.length
        );
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onStart_application", handler: $.proxy(t, this)
    }]).triggerEvent("onStart_application");
});
