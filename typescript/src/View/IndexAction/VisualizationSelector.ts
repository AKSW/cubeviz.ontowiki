/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_IndexAction_VisualizationSelector extends CubeViz_View_Abstract
{
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_IndexAction_VisualizationSelector", attachedTo, app);
        
        // publish event handlers to application:
        // if one of these events get triggered, the associated handler will
        // be executed to handle it
        this.bindGlobalEvents([
            {
                name:    "onReRender_visualization",
                handler: this.onReRender_visualization
            },
            {
                name:    "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    
    /**
     * 
     */
    public initialize() : void
    {
        console.log("this.app._.ui (for class " + this.app._.ui.visualization.class + ")");
        console.log(this.app._.ui);
                
        console.log("this.app._.chartConfig");
        console.log(this.app._.chartConfig[this.app._.data.numberOfMultipleDimensions].charts);
        
        this.render();
    }
    
    /**
     *
     */
    public onClick_selectorItem(event) 
    {
        var chartClass = undefined,
            selectorItemDiv = null;
        
        // check if chartConfigIndex is attached to div or div's image
        if(true === _.isUndefined($(event.target).data("class"))) {
            selectorItemDiv = $($(event.target).parent());
            chartClass = selectorItemDiv.data("class");
        } else {
            selectorItemDiv = $(event.target);
            chartClass = selectorItemDiv.data("class");
        }
        
        // update visualization class
        this.app._.ui.visualization.class = chartClass;
        
        // give all selector items the same class
        $(".cubeviz-visualizationselector-selectedSelectorItem")
            .removeClass("cubeviz-visualizationselector-selectedSelectorItem")
            .addClass("cubeviz-visualizationselector-selectorItem");
        
        // style update of clicked item
        selectorItemDiv
            .removeClass("cubeviz-visualizationselector-selectorItem")
            .addClass("cubeviz-visualizationselector-selectedSelectorItem");
        
        this.triggerGlobalEvent("onChange_visualizationClass");
    }
    
    /**
     *
     */
    public onReRender_visualization() 
    {
        this.destroy();
        this.initialize();
    }
    
    /**
     *
     */
    public onStart_application() 
    {
        this.initialize();
    }
    
    /**
     *
     */
    public render() : CubeViz_View_Abstract
    {
        var numberOfMultDims = this.app._.data.numberOfMultipleDimensions,
            viszItem,
            charts = this.app._.chartConfig[numberOfMultDims].charts,
            selectorItemTpl = _.template(
                $("#cubeviz-visualizationselector-tpl-selectorItem").text()
            ),
            self = this;
        
        // load icons
        _.each(charts, function(chartObject){
            
            // create new chart item (DOM element)
            viszItem = $(selectorItemTpl(chartObject));
            
            // attach data to chart item
            viszItem
                .data("class", chartObject.class);
                
            // If current chart object is the selected visualization ...
            if(self.app._.ui.visualization.class == chartObject.class) {
                viszItem
                    .addClass("cubeviz-visualizationselector-selectedSelectorItem")
                    .removeClass("cubeviz-visualizationselector-selectorItem");
            }
            
            // set click event
            viszItem.on("click", $.proxy(self.onClick_selectorItem, self));
            
            // append chart item to menu
            $("#cubeviz-visualizationselector-menu")
                .append(viszItem);
        });
        
        /**
         * Delegate events to new items of the template
         */
        this.bindUserInterfaceEvents({});
        
        return this;
    }
}
