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
    public destroy() : CubeViz_View_Abstract
    {
        super.destroy();
        $("#cubeviz-visualizationselector-selector").empty();
        this
            .hideDongle()
            .hideMenu();
        return this;
    }
    
    /**
     *
     */
    public hideDongle() 
    {
        $("#cubeviz-visualizationselector-menuDongleDiv")
            .fadeOut("slow");
    }
    
    /**
     *
     */
    public hideMenu() 
    {
        $("#cubeviz-visualizationselector-menu").fadeOut("slow", function(){
            $("#cubeviz-visualizationselector-menuItems").html("");
        });
    }
    
    /**
     * 
     */
    public initialize() : void
    {
        this.render();
    }
    
    /**
     *
     */
    public onClick_selectorItem(event) 
    {
        this.triggerGlobalEvent("onBeforeClick_selectorItem");
        
        var prevClass:string = "",
            selectorItemDiv:any = null;
        
        /**
         * Extract associated class
         */
        // check if chartConfigIndex is attached to div or div's image
        // and than extract associated visualization class
        if(true === _.isUndefined($(event.target).data("class"))) {
            selectorItemDiv = $($(event.target).parent());
            this.app._.ui.visualization.class = selectorItemDiv.data("class");
        } else {
            selectorItemDiv = $(event.target);
            this.app._.ui.visualization.class = selectorItemDiv.data("class");
        }
        
        /**
         * If the same item was clicked twice, show menu (if it exists)
         */
        prevClass = $($(".cubeviz-visualizationselector-selectedSelectorItem").get(0)).data("class");
        
        this.hideDongle();
        
        if(prevClass == this.app._.ui.visualization.class) {
            
            this.showMenu(selectorItemDiv);
            
        // if another item was the previously was clicked    
        } else {
        
            this.hideMenu();
        
            /**
             * Change layout of the items
             */
            // give all selector items the same class
            $(".cubeviz-visualizationselector-selectedSelectorItem")
                .removeClass("cubeviz-visualizationselector-selectedSelectorItem")
                .addClass("cubeviz-visualizationselector-selectorItem");
            
            // style update of clicked item
            selectorItemDiv
                .removeClass("cubeviz-visualizationselector-selectorItem")
                .addClass("cubeviz-visualizationselector-selectedSelectorItem");
                
            /**
             * Dongle
             */
            // show dongle under selected item
            this.showMenuDongle(selectorItemDiv);
        
            /**
             * Trigger global event
             */
            this.triggerGlobalEvent("onChange_visualizationClass");
        }
        
        this.triggerGlobalEvent("onAfterClick_selectorItem");
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
        this.triggerGlobalEvent("onBeforeRender_visualizationSelector");
        
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
                
                self.showMenuDongle(viszItem);
            }
            
            // set click event
            viszItem.on("click", $.proxy(self.onClick_selectorItem, self));
            
            // append chart item to selector
            $("#cubeviz-visualizationselector-selector")
                .append(viszItem);
        });
        
        /**
         * Delegate events to new items of the template
         */
        this.bindUserInterfaceEvents({});
        
        this.triggerGlobalEvent("onAfterRender_visualizationSelector");
        
        return this;
    }
    
    /**
     *
     */
    public showMenu(selectorItemDiv:any) 
    {
        var charts = this.app._.chartConfig[this.app._.data.numberOfMultipleDimensions].charts,
        
            // get chart config
            fromChartConfig:any = CubeViz_Visualization_Controller.getFromChartConfigByClass (
                this.app._.ui.visualization.class, charts
            ),
            
            menuItem:any,
            menuItemTpl:any = _.template($("#cubeviz-visualizationselector-tpl-menuItem").text()),
            menuItemsHtml = $("#cubeviz-visualizationselector-menuItems").html(),
            offset:any = selectorItemDiv.offset(),
            selectBox:any,
            valueOption:any;
        
        if(false === _.isUndefined(fromChartConfig.options)
           && 0 < _.size(fromChartConfig.options)
           && ( "" == menuItemsHtml || null == menuItemsHtml ))
        {
            // go through all the options for this visz item
            _.each(fromChartConfig.options, function(option){
                
                // template > DOM element
                menuItem = $(menuItemTpl(option));
                
                // get selectbox
                selectBox = $(menuItem.find(".cubeviz-visualizationselector-menuSelectbox").get(0));
                
                // set default value
                valueOption = $("<option/>");
                valueOption
                    .text(option.defaultValue.label)
                    .val(option.defaultValue.value);
                
                selectBox.append(valueOption);
                
                // go through the rest of the values for this particular option
                _.each(option.values, function(value){
                    
                    valueOption = $("<option/>");
                    valueOption
                        .text(value.label)
                        .val(value.value);
                    
                    selectBox.append(valueOption);
                });
                
                // append generated menu item
                $("#cubeviz-visualizationselector-menuItems").append(menuItem);
            });
            
            // show menu
            $("#cubeviz-visualizationselector-menu")
                .css ("top", offset.top - 37)
                .css ("left", offset.left - 495)
                .fadeIn ("slow");
        }
    }
    
    /**
     *
     */
    public showMenuDongle(selectorItemDiv:any) 
    {
        var charts = this.app._.chartConfig[this.app._.data.numberOfMultipleDimensions].charts,
        
            // get chart config
            fromChartConfig:any = CubeViz_Visualization_Controller.getFromChartConfigByClass (
                this.app._.ui.visualization.class, charts
            );
            
        // show dongle if menu options are available
        if(false === _.isUndefined(fromChartConfig.options)
           && 0 < _.size(fromChartConfig.options)) {
            
            var offset:any = selectorItemDiv.offset(),
                position:any = selectorItemDiv.position(),
                dongleDiv:any = $("#cubeviz-visualizationselector-menuDongleDiv");
            
            // positioning and show dongle
            dongleDiv
                .css("top", offset.top - 48)
                .css("left", offset.left - 285)
                .fadeIn("slow");
        }
    }
}
