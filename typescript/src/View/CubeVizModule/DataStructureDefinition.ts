/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_CubeVizModule_DataStructureDefintion extends CubeViz_View_Abstract 
{
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CubeVizModule_DataStructureDefintion", attachedTo, app);
        
        // publish event handlers to application:
        // if one of these events get triggered, the associated handler will
        // be executed to handle it
        this.bindGlobalEvents([
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
        var self = this;
        
        // load all data structure definitions from server
        DataCube_DataStructureDefinition.loadAll(
        
            this.app._.backend.url,            
            this.app._.backend.modelUrl,
            
            // after all elements were loaded, add them to collection
            // and render the view
            function(entries) {
                                
                // set selected data structure definition
                self.setSelectedDSD(entries);
                
                // save given elements, doublings were ignored!
                self.collection
                        .reset("hashedUrl")
                        .addList(entries);
                
                // render given elements
                self.render();
                
                // trigger event
                self.triggerGlobalEvent("onComplete_loadDSD");
            }
        );
    }
    
    /**
     * If new option was selected
     */
    public onChange_list(event) : void 
    {
        var selectedElementId:string = $("#cubeviz-dataStructureDefinition-list").val(),
            selectedElement = this.collection.get(selectedElementId);
        
        // TODO: remember previous selection
        
        // set new selected data structure definition
        this.setSelectedDSD([selectedElement]);
    
        // trigger event
        this.triggerGlobalEvent("onChange_selectedDSD");
    }
    
    /**
     *
     */
    public onClick_questionmark() {
        $("#cubeviz-dataStructureDefinition-dialog").dialog("open");
    }
    
    /**
     *
     */
    public onStart_application(event, data) 
    {
        this.initialize();
    }
    
    /**
     * 
     */
    public render() : CubeViz_View_Abstract
    {
        /**
         * List of items
         */        
        var list = $("#cubeviz-dataStructureDefinition-list"),
            optionTpl = _.template($("#cubeviz-dataStructureDefinition-tpl-listOption").text()),
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
        $("#cubeviz-dataStructureDefinition-dialog").dialog({
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
            "change #cubeviz-dataStructureDefinition-list" : this.onChange_list,
            "click #cubeviz-dataStructureDefinition-questionMark": this.onClick_questionmark
        });
        
        return this;
    }
    
    /**
     * 
     */
    public setSelectedDSD(entries:any[]) : void 
    {
        // if nothing was given
        if(0 == entries.length || undefined === entries) {
            // todo: handle case that no data structure definition were loaded!
            this.app._.data.selectedDSD = {};
            throw new Error ("View_CubeVizModule_DataStructureDefinition: No dsd's were loaded!");
        
        // if at least one data structure definition, than load data sets for first one     
        } else {
            this.app._.data.selectedDSD = entries[0];
        }
    }
}
