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
                name:    "onClick_setupComponentOpener",
                handler: this.onClick_setupComponentOpener
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
        this.hideDongle()
        this.hideMenu();
        return this;
    }
    
    /**
     *
     */
    public hideDongle() : View_IndexAction_VisualizationSelector
    {
        $("#cubeviz-visualizationselector-menuDongleDiv")
            .fadeOut("slow");
        return this;
    }
    
    /**
     *
     */
    public hideMenu() : View_IndexAction_VisualizationSelector
    {
        this.triggerGlobalEvent("onBeforeHide_visualizationSelectorMenu");
        
        $("#cubeviz-visualizationselector-menu").fadeOut("slow");
        $("#cubeviz-visualizationselector-menuItems").html("");
        
        this.triggerGlobalEvent("onAfterHide_visualizationSelectorMenu");
        
        return this;
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
    public onClick_setupComponentOpener() 
    {
        this.hideMenu();
    }
    
    /**
     *
     */
    public onClick_closeMenu() 
    {
        this.hideMenu();
    }
    
    /**
     *
     */
    public onClick_selectorItem(event) 
    {
        this.triggerGlobalEvent("onBeforeClick_selectorItem");
        
        var prevClass:string = "",
            selectorItemDiv:any = null,
            self = this;
        
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
            
            // update link code
            CubeViz_ConfigurationLink.save(
                this.app._.backend.url,
                this.app._.ui,
                "ui",
                function(updatedUiHash){ self.app._.backend.uiHash = updatedUiHash; }
            );
        }
        
        this.triggerGlobalEvent("onAfterClick_selectorItem");
    }
    
    /**
     *
     */
    public onClick_updateVisz() 
    {        
        // get chart config
        var fromChartConfig:any = CubeViz_Visualization_Controller.getFromChartConfigByClass (
                this.app._.ui.visualization.class,
                this.app._.backend.chartConfig[this.app._.data.numberOfMultipleDimensions].charts
            ),
            self = this;
            
        // update visualization setting class entry, based on what the user selected
        // before in the menu
        // hint: the function will generate a new object (using JSON transformation)
        //       to avoid changing the orginally ChartConfig.js entry given from 
        //       the server
        this.app._.ui.visualizationSettings[this.app._.ui.visualization.class] = 
            CubeViz_Visualization_Controller.updateVisualizationSettings(
                $(".cubeviz-visualizationselector-menuItemValue"),
                this.app._.ui.visualizationSettings[this.app._.ui.visualization.class],
                fromChartConfig.defaultConfig
        );
        
        // update link code
        CubeViz_ConfigurationLink.save(
            this.app._.backend.url,
            this.app._.ui,
            "ui",
            function(updatedUiHash){ self.app._.backend.uiHash = updatedUiHash; }
        );
        
        this.triggerGlobalEvent("onReRender_visualization");
    }
    
    /**
     *
     */
    public onReRender_visualization() 
    {
        this.destroy();
        
        if(0 < _.size(this.app._.backend.retrievedObservations)){
            this.initialize();
        }
    }
    
    /**
     *
     */
    public onStart_application() 
    {
        if(0 < _.size(this.app._.backend.retrievedObservations)){
            this.initialize();
        }
    }
    
    /**
     *
     */
    public render() : CubeViz_View_Abstract
    {
        this.triggerGlobalEvent("onBeforeRender_visualizationSelector");
        
        var numberOfMultDims = this.app._.data.numberOfMultipleDimensions,
            viszItem,
            charts = this.app._.backend.chartConfig[numberOfMultDims].charts,
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
            viszItem.off("click");
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
        this.triggerGlobalEvent("onBeforeShow_visualizationSelectorMenu");
        
        var alreadySetSelected:bool = false,
            defaultValue:string = "",
        
            // get chart config
            fromChartConfig:any = CubeViz_Visualization_Controller.getFromChartConfigByClass (
                this.app._.ui.visualization.class,
                this.app._.backend.chartConfig[this.app._.data.numberOfMultipleDimensions].charts
            ),
            
            menuItem:any,
            menuItemTpl:any = _.template(
                $("#cubeviz-visualizationselector-tpl-menuItem").text()
            ),
            menuItemsHtml = $("#cubeviz-visualizationselector-menuItems").html(),
            offset:any = selectorItemDiv.offset(),
            selectBox:any,
            shortCutViszSettings:any = this.app._.ui.visualizationSettings
                [this.app._.ui.visualization.class],
            valueOption:any;
        
        if(false === _.isUndefined(fromChartConfig.options)
           && 0 < _.size(fromChartConfig.options)
           && ( "" == menuItemsHtml || null == menuItemsHtml ))
        {            
            // go through all the options for this visz item
            _.each(fromChartConfig.options, function(option){
                
                alreadySetSelected = false;
                
                // template > DOM element
                menuItem = $(menuItemTpl(option));
                
                // get selectbox
                selectBox = $(menuItem.find(".cubeviz-visualizationselector-menuSelectbox").get(0));
                                
                // find default value, if it exists or use given default one
                defaultValue = CubeViz_Visualization_Controller.getObjectValueByKeyString (
                    option.key, 
                    shortCutViszSettings
                );
                
                valueOption = $("<option/>");
                
                selectBox.data("key", option.key);
                
                // try to restore previously set default value for this option
                if(false == _.isUndefined(defaultValue)){
                    _.each(option.values, function(value){
                        
                        value.value = value.value.toString();
                        
                        // if something was set before, use that as default!
                        if(defaultValue.toString() == value.value
                            && false == alreadySetSelected){
                            valueOption = $("<option/>");
                            valueOption
                                .text(value.label)
                                .val(value.value)
                                .attr("selected", "selected");
                            
                            selectBox.append(valueOption);
                            
                            alreadySetSelected = true;
                        }
                    });
                }
                
                // add all values
                _.each(option.values, function(value){
                    
                    value.value = value.value.toString();
                    
                    if(false == _.isUndefined(defaultValue)
                        && defaultValue.toString() == value.value) {
                        return;
                    }
                    
                    valueOption = $("<option/>");
                    valueOption
                        .text(value.label)
                        .val(value.value);
                    
                    // if nothing was set before, use default value from chartConfig
                    if(false === alreadySetSelected 
                        && false === _.isUndefined(value.isDefault)
                        && true === value.isDefault) {
                        valueOption.attr("selected", "selected");
                        alreadySetSelected = true;
                    }
                    
                    selectBox.append(valueOption);
                });
                
                // append generated menu item
                $("#cubeviz-visualizationselector-menuItems").append(menuItem);
            });
            
            // close button events
            $("#cubeviz-visualizationselector-closeMenu").off("click");
            $("#cubeviz-visualizationselector-closeMenu").on("click", $.proxy(
                this.onClick_closeMenu
            , this));
            
            // update button events
            $("#cubeviz-visualizationselector-updateVisz").off("click");
            $("#cubeviz-visualizationselector-updateVisz").on("click", $.proxy(
                this.onClick_updateVisz
            , this));
            
            // show menu
            $("#cubeviz-visualizationselector-menu")
                .css ("top", offset.top - 37)
                .css ("left", offset.left - 495)
                .fadeIn ("slow");
        }
        
        this.triggerGlobalEvent("onAfterShow_visualizationSelectorMenu");
    }
    
    /**
     *
     */
    public showMenuDongle(selectorItemDiv:any) 
    {
        var charts = this.app._.backend.chartConfig[this.app._.data.numberOfMultipleDimensions].charts,
        
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
                .css("top", offset.top - 52)
                .css("left", offset.left - 284)
                .fadeIn("slow");
        }
    }
}
