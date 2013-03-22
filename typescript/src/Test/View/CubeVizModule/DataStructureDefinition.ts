/**
 * Test if something is in the selectbox on the startup
 */
cubeViz_tests.push(function(){
    
    // real test function
    var t = function() 
    {
        var listEntries = $("#cubeviz-dataStructureDefinition-list").children(),
            givenDSDs = _.keys(cubeVizApp._.data.dataStructureDefinitions);
        
        this.assertTrue(
            listEntries.length == givenDSDs.length,
            listEntries.length + " == " + givenDSDs.length
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
        var hasDialog = $("#cubeviz-dataStructureDefinition-dialog").data("hasDialog"),
            isDialogOpen = $("#cubeviz-dataStructureDefinition-dialog").data("isDialogOpen");

        this.assertTrue( hasDialog === true, "DSD: hasDialog: " + hasDialog);
        this.assertTrue( isDialogOpen !== true, "DSD: isDialogOpen: " + isDialogOpen);
        
        // set click handler for test function and simulate click afterwards
        $("#cubeviz-dataStructureDefinition-questionMark").click(
            $.proxy(t_dialogIsOpen, this)
        );
        
        $("#cubeviz-dataStructureDefinition-questionMark").click();
    };

    // test if dialog was opened after click to questionmark
    var t_dialogIsOpen = function() 
    {
        var isDialogOpen = $("#cubeviz-dataStructureDefinition-dialog").data("isDialogOpen");
        this.assertTrue( isDialogOpen === true, "DSD: isDialogOpen: " + isDialogOpen);
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onAfterRender_dataStructureDefinition", handler: $.proxy(t_dialogIsClosed, this)
    }]).triggerEvent("onStart_application");
});
