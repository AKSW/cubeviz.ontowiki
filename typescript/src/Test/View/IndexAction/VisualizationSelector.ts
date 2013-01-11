/**
 * Test if number of possible charts (chartConfig) is equal to the number of
 * menu items.
 */
cubeViz_tests.push(function(){
    
    // real test function
    var t = function() 
    {
        var numberOfMultDims = cubeVizApp._.data.numberOfMultipleDimensions,
            expectItems = cubeVizApp._.backend.chartConfig[numberOfMultDims].charts,
            foundItems = $("#cubeviz-visualizationselector-selector").children();
        
        this.assertTrue(expectItems.length == foundItems.length);
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onAfterRender_visualizationSelector", handler: $.proxy(t, this)
    }]).triggerEvent("onStart_application");
});

/**
 * Test if ui.visualization.class will be updated after a click on a different
 * menu item.
 */
cubeViz_tests.push(function(){
    
    cubeVizApp.triggerEvent("onStart_application");
    
    var viszClassBeforeItemClick = cubeVizApp._.ui.visualization.class;
    
    var items = $("#cubeviz-visualizationselector-selector").children(),
        secondItem = $(items[1]),
        secondItemsClass = $(secondItem).data("class");
    
    $(secondItem).click();
        
    // real test function
    var t = function() 
    {
        this.assertTrue(secondItemsClass == viszClassBeforeItemClick);
    };
    
    // Bind real test function to a global event
    cubeVizApp.bindGlobalEvents([{ 
        name: "onAfterClick_selectorItem", handler: $.proxy(t, this)
    }]);
});

/**
 * Test adding items to menu, after 2 clicks on the same menu item
 */
cubeViz_tests.push(function(){
    cubeVizApp.triggerEvent("onStart_application");
    
    var isSecondClick = false,
        items = $("#cubeviz-visualizationselector-selector").children(),
        secondItem = $(items[1]),
        menuItems = $("#cubeviz-visualizationselector-menuItems").children();
    
    // real test function
    var t = function() 
    {
        // is that the second click? > yes!
        if(true == isSecondClick) {
            this.assertTrue(
                menuItems.length < $("#cubeviz-visualizationselector-menuItems").children().length
            );
        } 
    };
    
    // Bind real test function to a global event
    cubeVizApp.bindGlobalEvents([{ 
        name: "onAfterClick_selectorItem", handler: $.proxy(t, this)
    }]);
    
    // first click > dongle will appear
    $(secondItem).click();
    
    // second click > menu will appear
    isSecondClick = true;
    $(secondItem).click();
});

/**
 * Test after show the menu, and click to another item, let it disappear
 */
cubeViz_tests.push(function(){
    cubeVizApp.triggerEvent("onStart_application");
    
    var isThirdClick = false,
        items = $("#cubeviz-visualizationselector-selector").children(),
        firstItem = $(items[0]),
        secondItem = $(items[1]),
        menuItems = $("#cubeviz-visualizationselector-menuItems").children();
        
    var t = function () {
        // is that the thirth click? > yes!
        if(true == isThirdClick) {            
            this.assertTrue(0 == menuItems.length);
        } 
    };
    
    // Bind real test function to a global event
    cubeVizApp.bindGlobalEvents([{ 
        name: "onAfterClick_selectorItem", handler: $.proxy(t, this)
    }]);
    
    // first click > dongle will appear
    $(secondItem).click();
    
    // second click > menu will appear
    $(secondItem).click();
    
    // thirth click > menu must disappear
    isThirdClick = true;
    $(firstItem).click();
});

/**
 * Test after click to close menu button, menu has to be closed
 */
cubeViz_tests.push(function(){
    cubeVizApp.triggerEvent("onStart_application");
    
    var items = $("#cubeviz-visualizationselector-selector").children(),
        secondItem = $(items[1]),
        menuReadyToClose = false;
        
    // after menu hiding is finished
    var t_afterHideMenu = function () {
        if(true === menuReadyToClose) {
            var menuItems = $("#cubeviz-visualizationselector-menuItems").children();
            this.assertEquals(0, menuItems.length, "menuItems.length: " + menuItems.length);
        }
    };
    
    // Bind real test function to a global event
    cubeVizApp.bindGlobalEvents([{
        name: "onAfterHide_visualizationSelectorMenu", 
        handler: $.proxy(t_afterHideMenu, this)
    }]);
    
    // two clicks on the same item > menu will appear
    $(secondItem).click();
    
    menuReadyToClose = true;
    $(secondItem).click();
});
