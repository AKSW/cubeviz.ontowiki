/**
 * Test if hasDialog was correct set
 */
cubeViz_tests.push(function(){
    
    // real test function
    var t = function() 
    {
        var div = $("<div></div>"),
            hasDialog = div.data("hasDialog");
        
        this.assertTrue( true !== hasDialog, "true !== " + hasDialog );
        
        /**
         * check after attaching dialog
         */
        CubeViz_View_Helper.attachDialogTo(div);
        
        hasDialog = div.data("hasDialog");
        
        this.assertTrue( true === hasDialog, "true === " + hasDialog );
        
        /**
         * check again after open dialog
         */        
        CubeViz_View_Helper.openDialog(div);       
        hasDialog = div.data("hasDialog");
        this.assertTrue( true === hasDialog, "true === " + hasDialog );
        
        /**
         * check again after closing dialog
         */
        CubeViz_View_Helper.closeDialog(div);        
        hasDialog = div.data("hasDialog");
        this.assertTrue( true === hasDialog, "true === " + hasDialog );
        
        /**
         * check again after closing dialog
         */
        CubeViz_View_Helper.destroyDialog(div);
        hasDialog = div.data("hasDialog");
        this.assertTrue( true === hasDialog, "true === " + hasDialog );
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onStart_application", handler: $.proxy(t, this)
    }]).triggerEvent("onStart_application");
});

/**
 * Test if isDialogOpen was correct set
 */
cubeViz_tests.push(function(){
    
    // real test function
    var t = function() 
    {
        var div = $("<div></div>");
        
        /**
         * check after attaching dialog
         */
        CubeViz_View_Helper.attachDialogTo(div);
        
        var isDialogOpen = div.data("isDialogOpen");        
        
        this.assertTrue( true !== isDialogOpen, "false === " + isDialogOpen );
        
        /**
         * check again after opening dialog
         */
        CubeViz_View_Helper.openDialog(div);
        var isDialogOpen = div.data("isDialogOpen");        
        this.assertTrue( true === isDialogOpen, "true === " + isDialogOpen );
        
        /**
         * check again after closing dialog
         */
        CubeViz_View_Helper.closeDialog(div);        
        isDialogOpen = div.data("isDialogOpen");
        this.assertTrue( false === isDialogOpen, "false === " + isDialogOpen );
        
        /**
         * check again after closing dialog
         */
        CubeViz_View_Helper.destroyDialog(div);
        isDialogOpen = div.data("isDialogOpen");
        this.assertTrue( false === isDialogOpen, "false === " + isDialogOpen );
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onStart_application", handler: $.proxy(t, this)
    }]).triggerEvent("onStart_application");
});

/**
 * Test fixed overlay
 */
cubeViz_tests.push(function(){
    
    // real test function
    var t = function() 
    {
        var div = $("<div></div>");
        
        CubeViz_View_Helper.attachDialogTo(div);
        CubeViz_View_Helper.openDialog(div);
        
        var currentOverlayHeight = $(".ui-widget-overlay").css("height"),
            doubleScreenHeight = (2 * screen.height) + "px";
        
        this.assertTrue( 
            currentOverlayHeight === doubleScreenHeight,
            currentOverlayHeight + " === " + doubleScreenHeight
        );
        
        CubeViz_View_Helper.closeDialog(div);
        CubeViz_View_Helper.destroyDialog(div);
    };
    
    // Bind real test function to a global event and trigger application start
    cubeVizApp.bindGlobalEvents([{ 
        name: "onStart_application", handler: $.proxy(t, this)
    }]).triggerEvent("onStart_application");
});
