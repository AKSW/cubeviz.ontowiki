/// <reference path="..\..\..\DeclarationSourceFiles\libraries\jquery.d.ts" />
/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Underscore.d.ts" />
/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Backbone.d.ts" />

/**
 * Declare variables that are used in the HTML too
 */
declare var CubeViz_Links_Module: any;
declare var CubeViz_UI_ChartConfig: any;

class View_CubeVizModule_Component extends View_Abstract {
        
    constructor(attachedTo:string) 
    {
        super(attachedTo);
        
        this.id = "View_CubeVizModule_Component";
    }
    
    /**
     * 
     */
    public regenerateLinkCode() : void
    {
        // if selectedComponents.dimension was null, there must be an change event
        // for DSD or DS, so force recreation of a new linkcode
        CubeViz_Links_Module.linkCode = null;
        
        CubeViz_ConfigurationLink.saveToServerFile ( 
            CubeViz_Links_Module,
            CubeViz_UI_ChartConfig,
            function ( newLinkCode ) {
                // Save new generated linkCode
                CubeViz_Links_Module.linkCode = newLinkCode;
                // TODO handle case if it was not possible to 
                //      generate a new linkcode
            }
        );
    }
    
    /**
     * 
     */
    public render() : void
    {
        // TODO refac
        var List = Backbone.Collection.extend({});
        
        var thisView = this;
        
        /**
         * 
         */
        this.viewInstance = {
            
            // el attaches to existing element
            el: $(this.attachedTo), 
            
            // 
            events: {
            },
            
            // init
            initialize:function() {
            
                var self = this;
            
                // every function that uses 'this' as the current object should be in here
                _.bindAll(this, "render"); 
                
                /**
                 * Load all data structure definitions
                 */
                this.collection = new List();
                
                // load all data structure definitions from server
                DataCube_Component.loadAllDimensions(
                
                    CubeViz_Links_Module.selectedDSD.url,                    
                    CubeViz_Links_Module.selectedDS.url,
                    
                    // after all elements were loaded, add them to collection
                    // and render the view
                    function(entries) {
                        
                        // set selectedDsd
                        thisView.setComponentsStuff(entries);
                        
                        // load components
                        // thisView.viewManager.callView("View_CubeVizModule_Dialog");
                        
                        var keys = _.keys(entries);
                        
                        for(var i=0;i<keys.length;++i){
                            entries[keys[i]]["id"] = entries[keys[i]]["hashedUrl"];
                            self.collection.add(entries[keys[i]]);
                        };
                        
                        // render given elements
                        self.render();
                    }
                );
            },
            
            /**
             * render view
             */
            render: function(){
                
                var dimension = null,
                    list = $("#cubviz-component-listBox"),
                    optionTpl = _.template($("#cubeviz-component-tpl-listBoxItem").text()),
                    tmp = null;
                
                // output loaded data
                $(this.collection.models).each(function(i, d){
                    
                    // set current dimension instance
                    dimension = d.attributes;
                    
                    // set selected element count
                    if ( undefined != CubeViz_Links_Module.selectedComponents.dimensions ) {
                        tmp = CubeViz_Links_Module.selectedComponents.dimensions[dimension["hashedUrl"]];
                        dimension["selectedElementCount"] = 0 < _.keys (tmp["elements"]).length
                            ? _.keys (tmp["elements"]).length : 1;
                    } else {
                        dimension["selectedElementCount"] = 1;
                    }
                    
                    // set general element count
                    dimension["elementCount"] = dimension.elements.length;
                    
                    list.append(optionTpl(dimension));
                });
                
                return this;
            }            
        };
        
        var bv = Backbone.View.extend(this.viewInstance);
        this.backboneViewContainer = bv;
        this.backboneViewInstance = new bv ();
    }
    
    /**
     * 
     */
    public setComponentsStuff(entries) : void 
    {        
        // save pulled component dimensions
        CubeViz_Links_Module.components.dimensions = entries;
        
        // reset the existing component configuration
        if ( undefined == CubeViz_Links_Module.selectedComponents.dimensions || 
             0 == _.keys(CubeViz_Links_Module.selectedComponents.dimensions).length ) {
            
            // set default values for selected component dimensions list
            // for each componentDimension first entry will be selected
            // e.g. Year (2003), Country (Germany)
            CubeViz_Links_Module.selectedComponents.dimensions =
                DataCube_Component.getDefaultSelectedDimensions ( entries );
                
            this.regenerateLinkCode();
        }
    }
}
