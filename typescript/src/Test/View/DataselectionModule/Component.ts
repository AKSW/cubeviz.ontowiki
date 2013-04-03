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
        var self = this;
        
        // go through all component dimensions and check their associated dialog
        _.each(_.keys(cubeVizApp._.data.components.dimensions), function(dimensionHashedUrl){
            
            var setupComponentDialogId = "#cubeviz-dataSelectionModule-dialog-" + 
                                          dimensionHashedUrl,
                listDOMElement = $(setupComponentDialogId)
                                 .find(".cubeviz-component-setupComponentElements")
                                 .first(),
                listEntries = $(listDOMElement).children();
                
            // for the loop
            var checkbox:any, checkboxName:string, checkboxValue:any, 
                checkboxChecked:string, dimensionToCheck:any, label:any;
                
            /**
             * check if number of checked boxes is equal to number of dimension.elements
             */
            // number of checkboxes that are check in the certain dialog
            var numberOfCheckedItems = $($(setupComponentDialogId)
                .find(".cubeviz-component-setupComponentElements")
                .first()).find(":checked").length,
            
            // number of elements in the certain selected component dimension
                numberOfSelectedComponentDimensionElements = _.keys(
                    cubeVizApp._.data.selectedComponents.dimensions[dimensionHashedUrl]
                                .__cv_elements).length;
                
            self.assertTrue(
                numberOfCheckedItems == numberOfSelectedComponentDimensionElements,
                "Check number of checked checkboxes ("
                + numberOfCheckedItems + " <> "
                + numberOfSelectedComponentDimensionElements + ")"
            );
            
            // go through all entries and check exactly each property to match
            _.each(listEntries, function(listEntry){
                
                /**
                 * Save variables
                 */
                checkbox = $($(listEntry).children().first());
                checkboxName = checkbox.attr("name");
                checkboxValue = checkbox.val();
                dimensionToCheck = cubeVizApp._.data.components.dimensions[dimensionHashedUrl];
                label = $($($(listEntry).children().last()).children().first()).text();
                
                /**
                 * Check checkbox
                 */
                // check name (hashedProperty)
                self.assertTrue(
                    true === _.isObject( _.find(
                        dimensionToCheck.__cvelements,
                        function(ele){ return checkboxName == ele["__cv_hashedUri"]; }
                    )),
                    "Check hashedUrl(__cv_hashedUri): " + checkboxName
                );
                
                // check value (property)
                self.assertTrue(
                    true === _.isObject( _.find(
                        dimensionToCheck.__cv_elements,
                        function(ele){ return checkboxValue == ele["__cv_uri"]; }
                    )),
                    "Check uri(__cv_uri): " + checkboxValue
                );
                
                /**
                 * Check label
                 */
                self.assertTrue(
                    true === _.isObject( _.find(
                        dimensionToCheck.__cv_elements,
                        function(ele){ return label == ele["http://www.w3.org/2000/01/rdf-schema#label"]; }
                    )),
                    "Check label: " + label
                );
            });
        });
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onAfterRender_component", handler: $.proxy(t, this)
    }]).triggerEvent("onStart_application");
});

/**
 * Test if number of select component elements is equal to the items in the
 * cubeviz-component-setupComponentElements list
 */
cubeViz_tests.push(function(){
    
    // real test function
    var t = function() 
    {
        var givenComponentDimensionKeys = _.keys(cubeVizApp._.data.components.dimensions),
            firstComponentHashedUrl = givenComponentDimensionKeys[0],
            firstComponent = cubeVizApp._.data.components.dimensions[firstComponentHashedUrl],
            setupComponentDialogId = "#cubeviz-dataSelectionModule-dialog-" + 
                                      givenComponentDimensionKeys[0],
            listDOMElement = $(setupComponentDialogId).find(".cubeviz-component-setupComponentElements").first(),
            listEntries = $(listDOMElement).children();
       
        this.assertTrue(
            0 < listEntries.length 
            && listEntries.length === _.keys(firstComponent.__cv_elements).length,
            "listEntries.length === _.keys(firstComponent.__cv_elements).length"
        );
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onAfterRender_component", handler: $.proxy(t, this)
    }]).triggerEvent("onStart_application");
});
