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
                name:    "onChange_selectedDSD",
                handler: this.onChange_selectedDSD
            },
            {
                name:    "onComplete_loadDSD",
                handler: this.onComplete_loadDSD
            }
        ]);        
    }
    
    /**
     * 
     */
    public initialize() : void 
    {
        var self = this;
        
        /**
         * Load all data sets
         */
        DataCube_DataSet.loadAll(
        
            this.app._.backend.url,
            this.app._.backend.modelUrl,
            this.app._.data.selectedDSD.url,
            
            // after all elements were loaded, add them to collection
            // and render the view
            function(entries) {                
                // set selectedDsd
                self.setSelectedDS(entries);
                
                // save given elements
                self.collection.reset("hashedUrl");
                self.collection.addList(entries);
                
                // render given elements
                self.render();
                
                // trigger event
                self.triggerGlobalEvent("onComplete_loadDS");
            }
        );
    }
    
    /**
     * 
     */
    public onChange_list() : void 
    {
        var selectedElementId:string = $("#cubeviz-dataSet-list").val(),
            selectedElement = this["collection"].get(selectedElementId);

        // set new selected data set
        this.setSelectedDS([selectedElement]);

        // trigger event
        this.triggerGlobalEvent("onChange_selectedDS");
    }
    
    /**
     *
     */
    public onChange_selectedDSD(event, data) 
    {
        this
            .destroy()
            .initialize();
    }
    
    /**
     *
     */
    public onClick_questionmark() 
    {
        $("#cubeviz-dataSet-dialog").dialog("open");
    }
    
    /**
     *
     */
    public onComplete_loadDSD(event, data) 
    {
        this.onChange_selectedDSD(event, data);
    }
    
    /**
     * 
     */
    public render() : CubeViz_View_Abstract
    {        
        /**
         * List of items
         */        
        var list = $("#cubeviz-dataSet-list"),
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
        $("#cubeviz-dataSet-dialog").dialog({
            autoOpen: false,
            draggable: false,
            hide: "slow",
            modal: true,
            overlay: {
                "background-color": "#FFFFFF",
                opacity: 0.5
            },
            show: "slow"
        });
        
        /**
         * Delegate events to new items of the template
         */
        this.bindUserInterfaceEvents({
            "change #cubeviz-dataSet-list" : this.onChange_list,            
            "click #cubeviz-dataSet-questionMark": this.onClick_questionmark
        });
        
        return this;
    }
    
    /**
     * 
     */
    public setSelectedDS(entries) : void 
    {
        // if nothing was given
        if(0 === entries.length || undefined === entries) {
            // todo: handle case that no data sets were loaded
            this.app._.data.selectedDS = {};
            throw new Error ("View_CubeVizModule_DataSet: No data sets were loaded!");
        
        // if at least one data structure definition, than load data sets for first one
        } else {
            this.app._.data.selectedDS = entries[0];
        }
    }
}
