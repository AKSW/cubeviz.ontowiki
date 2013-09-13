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
                name:    "onClick_setupComponentOpener",
                handler: this.onClick_setupComponentOpener
            },
            {
                name:    "onReceived_noData",
                handler: this.onReceived_noData
            },
            {
                name:    "onReRender_visualization",
                handler: this.onReRender_visualization
            },
            {
                name:    "onStart_application",
                handler: this.onStart_application
            },
            {
                name:    "onVisualize_noElements",
                handler: this.onVisualize_noElements
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
    public onClick_setupComponentOpener() : void
    {
        this.hideMenu();
    }
    
    /**
     *
     */
    public onClick_closeMenu() : void
    {
        this.hideMenu();
    }
    
    /**
     *
     */
    public onClick_selectorItem(event) : void
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
            this.app._.ui.visualization.className = selectorItemDiv.data("class");
        } else {
            selectorItemDiv = $(event.target);
            this.app._.ui.visualization.className = selectorItemDiv.data("class");
        }
        
        /**
         * If the same item was clicked twice, show menu (if it exists)
         */
        prevClass = $($(".cubeviz-visualizationselector-selectedSelectorItem").get(0)).data("class");
        
        this.hideDongle();
        
        if(prevClass == this.app._.ui.visualization.className) {
            
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
            
            // show dongle under selected item
            this.showMenuDongle(selectorItemDiv);
        
            /**
             * Trigger global event
             */
            this.triggerGlobalEvent("onChange_visualizationClass");
            
            // save ui object
            this.app._.backend.uiHash = CryptoJS.MD5(JSON.stringify(this.app._.ui))+"";
            
            CubeViz_ConfigurationLink.saveUI(
                this.app._.backend.url, this.app._.backend.serviceUrl, 
                this.app._.backend.modelUrl, this.app._.backend.uiHash, 
                this.app._.ui, function(){ 
                    self.triggerGlobalEvent("onAfterClick_selectorItem");
                }
            );
        }
    }
    
    /**
     *
     */
    public onClick_updateVisz() : void
    {        
        // get chart config
        var fromChartConfig:any = CubeViz_Visualization_Controller.getFromChartConfigByClass (
                this.app._.ui.visualization.className,
                this.app._.backend.chartConfig[this.app._.data.numberOfMultipleDimensions].charts
            ),
            self = this;
            
        // update visualization setting class entry, based on what the user selected
        // before in the menu
        // hint: the function will generate a new object (using JSON transformation)
        //       to avoid changing the orginally ChartConfig.js entry given from 
        //       the server
        this.app._.ui.visualizationSettings[this.app._.ui.visualization.className] = 
            CubeViz_Visualization_Controller.updateVisualizationSettings(
                $(".cubeviz-visualizationselector-menuItemValue"),
                this.app._.ui.visualizationSettings[this.app._.ui.visualization.className],
                fromChartConfig.defaultConfig
        );
        
        // save ui object
        this.app._.backend.uiHash = CryptoJS.MD5(JSON.stringify(this.app._.ui)) + "";
        
        CubeViz_ConfigurationLink.saveUI(
            this.app._.backend.url, this.app._.backend.serviceUrl, 
            this.app._.backend.modelUrl, this.app._.backend.uiHash, 
            this.app._.ui, function(){
                self.triggerGlobalEvent("onReRender_visualization");
            }
        );
    }
    
    /**
     *
     */
    public onReceived_noData() : void
    {
        this.hideDongle();
    }
    
    /**
     *
     */
    public onReRender_visualization() : void 
    {
        this.destroy();
        
        if(0 < _.size(this.app._.data.retrievedObservations)){
            this.initialize();
        }
    }
    
    /**
     *
     */
    public onStart_application() : void
    {
        if(0 < _.size(this.app._.data.retrievedObservations)){
            this.initialize();
        }
    }
    
    /**
     *
     */
    public onVisualize_noElements() : void 
    {
        this
            .hideDongle()
            .hideMenu();
    }
    
    /**
     *
     */
    public render() : CubeViz_View_Abstract
    {
        this.triggerGlobalEvent("onBeforeRender_visualizationSelector");
        
        var numberOfMultDims = this.app._.data.numberOfMultipleDimensions,
            charts = this.app._.backend.chartConfig[numberOfMultDims].charts,
            firstViszItem:any,
            self = this,
            viszItem:any;
            
        this.hideDongle();
        
        // load icons
        _.each(charts, function(chartObject){
            
            // create new chart item (DOM element)
            viszItem = $(CubeViz_View_Helper.tplReplace(
                $("#cubeviz-visualizationselector-tpl-selectorItem").html()
            ));
            
            // add image to new selector button
            $(viszItem.find(".cubeviz-icon-small").first())
                .attr ("src", self.app._.backend.imagesPath + chartObject.icon);
                
            // attach data to chart item
            viszItem
                .data("class", chartObject.className);
            
            // set click event
            viszItem.off("click");
            viszItem.on("click", $.proxy(self.onClick_selectorItem, self));
            
            // If current chart object is the selected visualization ...
            if(self.app._.ui.visualization.className == chartObject.className) {
                viszItem
                    .addClass("cubeviz-visualizationselector-selectedSelectorItem")
                    .removeClass("cubeviz-visualizationselector-selectorItem");
            }
            
            // append chart item to selector
            $("#cubeviz-visualizationselector-selector")
                .append(viszItem);
        });
        
        // show menu dongle under the selected item
        this.showMenuDongle(
            $($("#cubeviz-visualizationselector-selector")
                .find(".cubeviz-visualizationselector-selectedSelectorItem")
                .first())
        );
        
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
                this.app._.ui.visualization.className,
                this.app._.backend.chartConfig[this.app._.data.numberOfMultipleDimensions].charts
            ),
            
            menuItem:any,
            menuItemsHtml = $("#cubeviz-visualizationselector-menuItems").html(),
            position:any = selectorItemDiv.position(),
            selectBox:any,
            shortCutViszSettings:any = this.app._.ui.visualizationSettings
                [this.app._.ui.visualization.className],
            valueOption:any;
        
        if(false === _.isUndefined(fromChartConfig.options)
           && 0 < _.size(fromChartConfig.options)
           && ( "" == menuItemsHtml || null == menuItemsHtml ))
        {            
            // go through all the options for this visz item
            _.each(fromChartConfig.options, function(option){
                
                alreadySetSelected = false;
                
                // template > DOM element
                menuItem = $(CubeViz_View_Helper.tplReplace(
                    $("#cubeviz-visualizationselector-tpl-menuItem").html(),
                    option
                ));
                
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
            
            // positioning and show menu
            $("#cubeviz-visualizationselector-menu")
                .css ("top", position.top + 37)
                .css ("left", position.left - 192 )
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
                this.app._.ui.visualization.className, charts
            );
            
        // show dongle if menu options are available
        if(false === _.isUndefined(fromChartConfig.options)
           && 0 < _.size(fromChartConfig.options)) {
            
            var position:any = selectorItemDiv.position();
            
            // positioning and show dongle
            $("#cubeviz-visualizationselector-menuDongleDiv")
                .css("top", position.top + 25)
                .css("left", position.left + 14)
                .fadeIn("slow");
        }
    }
}
