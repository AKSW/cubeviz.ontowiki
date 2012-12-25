/// <reference path="..\..\..\DeclarationSourceFiles\libraries\jquery.d.ts" />
/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Underscore.d.ts" />

/**
 * Declare variables that are used in the HTML too
 */
declare var CubeViz_Links_Module: any;
declare var CubeViz_UI_ChartConfig: any;

class View_CubeVizModule_Component extends View_Abstract {
        
    constructor(attachedTo:string, viewManager:View_Manager) 
    {
        super("View_CubeVizModule_Component", attachedTo, viewManager);
    }
    
    /**
     *
     */
    public initialize() 
    {
        
        var self = this;
        
        // load all data structure definitions from server
        DataCube_Component.loadAllDimensions(
        
            CubeViz_Links_Module.selectedDSD.url,                    
            CubeViz_Links_Module.selectedDS.url,
            
            // after all elements were loaded, add them to collection
            // and render the view
            function(entries) {
                
                // set selectedDsd
                self.setComponentsStuff(entries);
                
                // load components
                // thisView.viewManager.callView("View_CubeVizModule_Dialog");
                
                // save given elements, doublings were ignored!
                self.collection
                        .reset("hashedUrl")
                        .addList(entries);
                
                // render given elements
                self.render();
            }
        );
    }
    
    /**
     *
     */
    public onClick_questionmark() {
        $("#cubeviz-component-dialog").dialog("open");
    }
    
    /**
     *
     */
    public render() 
    {
        /**
         * List
         */
        var list = $("#cubviz-component-listBox"),
            optionTpl = _.template($("#cubeviz-component-tpl-listBoxItem").text()),
            selectedComponentDimensions = CubeViz_Links_Module.selectedComponents.dimensions,
            selectedDimension = null,
            tmp = null;
            
        // empty list(DOM) to avoid listing outdated items
        list.empty();
        
        // output loaded data
        $(this.collection._).each(function(i, dimension){
            
            if ( undefined !== selectedComponentDimensions ) {
                selectedDimension = selectedComponentDimensions[dimension["hashedUrl"]];
                dimension["selectedElementCount"] = _.keys(selectedDimension["elements"]).length;
            } else {
                dimension["selectedElementCount"] = 1;
            }
            
            // set general element count
            dimension["elementCount"] = _.size(dimension["elements"]);
            
            list.append(optionTpl(dimension));
        });
        
        /**
         * Question mark dialog
         */
        $("#cubeviz-component-dialog").dialog({
            "autoOpen": false,
            "draggable": false,
            "hide": "slow",
            "show": "slow"
        });
        
        /**
         * Delegate events to new items of the template
         */
        this.delegateEvents({         
            "click #cubeviz-component-questionMark": this.onClick_questionmark
        });
        
        return this;
    }
    
    /**
     * 
     */
    public setComponentsStuff(entries) : void 
    {        
        // save pulled component dimensions
        CubeViz_Links_Module.components.dimensions = entries;
        
        // set default values for selected component dimensions list
        // for each componentDimension first entry will be selected
        // e.g. Year (2003), Country (Germany)
        CubeViz_Links_Module.selectedComponents.dimensions =
            DataCube_Component.getDefaultSelectedDimensions ( entries );
    }
}
