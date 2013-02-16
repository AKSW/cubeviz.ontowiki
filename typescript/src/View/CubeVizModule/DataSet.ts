/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_CubeVizModule_DataSet extends CubeViz_View_Abstract 
{        
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CubeVizModule_DataSet", attachedTo, app);
        
        // publish event handlers to application:
        // if one of these events get triggered, the associated handler will
        // be executed to handle it
        this.bindGlobalEvents([
            {
                name:    "onAfterChange_selectedDSD",
                handler: this.onAfterChange_selectedDSD
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
    public destroy () : CubeViz_View_Abstract
    {
        super.destroy();
        
        CubeViz_View_Helper.destroyDialog($("#cubeviz-dataSet-dialog"));
        
        return this;
    }
    
    /**
     * 
     */
    public initialize() : void 
    {
        // save given elements
        this.collection.reset("hashedUrl");
        this.collection.addList(this.app._.data.dataSets);
        
        this.render();
    }
    
    /**
     * 
     */
    public onChange_list() : void 
    {
        var selectedElementId:string = $("#cubeviz-dataSet-list").val(),
            selectedElement = this["collection"].get(selectedElementId);

        // set new selected data set
        this.app._.data.selectedDS = selectedElement;

        // trigger event
        this.triggerGlobalEvent("onChange_selectedDS");
    }
    
    /**
     *
     */
    public onAfterChange_selectedDSD(event, data) 
    {        
        this.destroy();
        
        var self = this;
        
        /**
         * Load all data sets based on new selectedDSD
         */
        DataCube_DataSet.loadAll(
        
            this.app._.backend.url,
            this.app._.backend.modelUrl,
            this.app._.data.selectedDSD.url,
            
            // after all elements were loaded, add them to collection
            // and render the view
            function(entries) {
    
                // set default data set
                self.app._.data.selectedDS = entries[0];

                // save given elements
                self.collection.reset("hashedUrl");
                self.collection.addList(entries);
                
                // trigger event
                self.triggerGlobalEvent("onChange_selectedDS");
                
                // render given elements
                self.render();
            }
        );
    }
    
    /**
     *
     */
    public onClick_questionmark() 
    {
        CubeViz_View_Helper.openDialog($("#cubeviz-dataSet-dialog"));
    }
    
    /**
     *
     */
    public onComplete_loadDSD(event, data) 
    {
        this.onAfterChange_selectedDSD(event, data);
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
        this.triggerGlobalEvent("onBeforeRender_dataSet");
        
        /**
         * List of items
         */        
        var list = $(this.attachedTo),
            optionTpl = _.template($("#cubeviz-dataSet-tpl-listOption").text()),
            self = this;
        
        // output loaded data
        $(this.collection._).each(function(i, element){
            
            // set selected variable, if element url is equal to selected dsd
            element["selected"] = element["url"] == self.app._.data.selectedDSD.url
                ? " selected" : "";
                
            list.append(optionTpl(element));
        });
        
        /**
         * Question mark dialog
         */
        CubeViz_View_Helper.attachDialogTo(
            $("#cubeviz-dataSet-dialog"),
            {closeOnEscape: true, showCross: true, width: 500}
        );
        
        /**
         * Delegate events to new items of the template
         */
        this.bindUserInterfaceEvents({
            "change #cubeviz-dataSet-list" : this.onChange_list,            
            "click #cubeviz-dataSet-questionMark": this.onClick_questionmark
        });
        
        this.triggerGlobalEvent("onAfterRender_dataSet");
        
        return this;
    }
}