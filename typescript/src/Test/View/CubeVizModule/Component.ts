/**
 * Test if something is in the list container
 */
cubeViz_tests.push(function(){
    
    // real test function
    var t = function() 
    {
        var listEntries = $("#cubviz-component-listBox").children(),
            givenComponentDimensions = _.keys(cubeVizApp._.data.components.dimensions);
        
        this.assertTrue(
            listEntries.length == givenComponentDimensions.length,
            listEntries.length + " == " + givenComponentDimensions.length
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
        var hasDialog = $("#cubeviz-component-dialog").data("hasDialog"),
            isDialogOpen = $("#cubeviz-component-dialog").data("isDialogOpen");

        this.assertTrue( hasDialog === true, "Component: hasDialog: " + hasDialog);
        this.assertTrue( isDialogOpen !== true, "Component: isDialogOpen: " + isDialogOpen);
        
        // set click handler for test function and simulate click afterwards
        $("#cubeviz-component-questionMark").click(
            $.proxy(t_dialogIsOpen, this)
        );
        
        $("#cubeviz-component-questionMark").click();
    };

    // test if dialog was opened after click to questionmark
    var t_dialogIsOpen = function() 
    {
        var isDialogOpen = $("#cubeviz-component-dialog").data("isDialogOpen");
        this.assertTrue( isDialogOpen === true, "Component: isDialogOpen: " + isDialogOpen);
    };
    
    // Bind real test function to a global event
    cubeVizApp.bindGlobalEvents([{ 
        name: "onAfterRender_component", handler: $.proxy(t_dialogIsClosed, this)
    }]).triggerEvent("onStart_application");
});

/**
 * Test if select component elements dialog was created as expected
 */
cubeViz_tests.push(function(){
    
    // real test function
    var t = function() 
    {
        var givenComponentDimensionKeys = _.keys(cubeVizApp._.data.components.dimensions),
            firstComponentHashedUrl = givenComponentDimensionKeys[0],
            setupComponentDialogId = "#cubeviz-component-setupComponentDialog-" + 
                                      givenComponentDimensionKeys[0],
            listDOMElement = $(setupComponentDialogId).find(".cubeviz-component-setupComponentElements").first(),
            listEntries = $(listDOMElement).children();
            
        // for the loop
        var checkbox:any, checkboxName:string, checkboxValue:any, 
            checkboxChecked:string, dimensionToCheck:any, label:any, self = this;
        
        // go through all entries and check exactly each property to match
        _.each(listEntries, function(listEntry){
            /**
             * Save variables
             */
            checkbox = $($(listEntry).children().first());
            checkboxName = checkbox.attr("name");
            checkboxValue = checkbox.val();
            checkboxChecked = true == checkbox.is(":checked") 
                              ? " checked=\"checked\"" : "";
            label = $($(listEntry).children().last()).html();
            dimensionToCheck = cubeVizApp._.data.components.dimensions[firstComponentHashedUrl];
            
            /**
             * Check checkbox
             */
            // check name (hashedProperty)
            self.assertTrue(
                true === _.isObject( _.find(
                    dimensionToCheck.elements,
                    function(ele){ return checkboxName == ele.hashedProperty; }
                ))
            );
            
            // check value (property)
            self.assertTrue(
                true === _.isObject( _.find(
                    dimensionToCheck.elements,
                    function(ele){ return checkboxValue == ele.property; }
                ))
            );
            
            // check if checked
            self.assertTrue(
                true === _.isObject( _.find(
                    dimensionToCheck.elements,
                    function(ele){ return checkboxChecked == ele.checked; }
                ))
            );
            
            /**
             * Check label
             */
            self.assertTrue(
                true === _.isObject( _.find(
                    dimensionToCheck.elements,
                    function(ele){ return label == ele.propertyLabel; }
                ))
            );
        });
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onAfterRender_component", handler: $.proxy(t, this)
    }]).triggerEvent("onStart_application");
});
