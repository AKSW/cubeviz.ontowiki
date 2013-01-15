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


/**
 * Test questionMark dialog is open on click of the icon
 */
cubeViz_tests.push(function(){

    // test if dialog is closed
    var t_dialogIsClosed = function() 
    {
        var hasDialog = $("#cubeviz-dataSet-dialog").data("hasDialog"),
            isDialogOpen = $("#cubeviz-dataSet-dialog").data("isDialogOpen");

        this.assertTrue( hasDialog === true, "DS: hasDialog: " + hasDialog);
        this.assertTrue( isDialogOpen !== true, "DS: isDialogOpen: " + isDialogOpen);
        
        // set click handler for test function and simulate click afterwards
        $("#cubeviz-dataSet-questionMark").click(
            $.proxy(t_dialogIsOpen, this)
        );
        
        $("#cubeviz-dataSet-questionMark").click();
    };

    // test if dialog was opened after click to questionmark
    var t_dialogIsOpen = function() 
    {
        var isDialogOpen = $("#cubeviz-dataSet-dialog").data("isDialogOpen");
        this.assertTrue( isDialogOpen === true, "DS: isDialogOpen: " + isDialogOpen);
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onAfterRender_dataSet", handler: $.proxy(t_dialogIsClosed, this)
    }]).triggerEvent("onStart_application");
});
