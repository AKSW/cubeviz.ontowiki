/// <reference path="..\..\..\DeclarationSourceFiles\libraries\jquery.d.ts" />
/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Underscore.d.ts" />

declare var CubeViz_Links_Module: any;

class View_CubeVizModule_DataSet extends View_Abstract {
        
    constructor(attachedTo:string, viewManager:View_Manager) 
    {
        super("View_CubeVizModule_DataSet", attachedTo, viewManager);        
    }
    
    public initialize() : void 
    {
        var self = this;
        
        /**
         * Load all data sets
         */
        DataCube_DataSet.loadAll(
        
            CubeViz_Links_Module.selectedDSD.url,
            
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
                
                // load components
                self.viewManager.renderView("View_CubeVizModule_Component");
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

        // TODO: remember previous selection

        // set new selected data set
        this.setSelectedDS([selectedElement]);

        // reset component view
        this.viewManager.renderView("View_CubeVizModule_Component");
    }
    
    /**
     * 
     */
    public render() : View_Abstract
    {
        $("#cubeviz-dataSet-list").remove();
                
        var listTpl = $("#cubeviz-dataSet-tpl-list").text();
        this.el.append(listTpl);
        
        var list = $("#cubeviz-dataSet-list"),
            optionTpl = _.template($("#cubeviz-dataSet-tpl-listOption").text());
        
        // output loaded data
        $(this.collection._).each(function(i, element){
            
            // set selected variable, if element url is equal to selected dsd
            element["selected"] = element["url"] == CubeViz_Links_Module.selectedDSD.url
                ? " selected" : "";
                
            list.append(optionTpl(element));
        });
        
        // Delegate events to new items of the template
        this.delegateEvents({
            "change #cubeviz-dataSet-list" : this.onChange_list
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
            CubeViz_Links_Module.selectedDS = {};
            throw new Error ("View_CubeVizModule_DataSet: No data sets were loaded!");
        
        // if at least one data structure definition, than load data sets for first one
        } else {
            CubeViz_Links_Module.selectedDS = entries[0];
        }
    }
}
