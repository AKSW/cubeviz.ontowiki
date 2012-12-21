/// <reference path="..\..\..\DeclarationSourceFiles\views\CubeVizModule.d.ts" />

/// <reference path="..\..\..\DeclarationSourceFiles\libraries\jquery.d.ts" />
/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Underscore.d.ts" />
/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Backbone.d.ts" />

declare var CubeViz_Links_Module: any;

class DataStructureDefintionView extends View_Abstract {
        
    constructor() 
    {
        super();
        
        this.id = "DataStructureDefintionView";
        this.attachedTo = "#cubviz-dataStructureDefinition-container";
    }
    
    public onChange_list() : void 
    {
        
    }
    
    /**
     * 
     */
    public render() : void
    {
        // TODO refac
        var List = Backbone.Collection.extend({});
        
        /**
         * 
         */
        this.viewInstance = {
            
            // el attaches to existing element
            el: $(this.attachedTo), 
            
            // 
            events: {
                "change #cubeviz-dataStructureDefinition-list": "onChange_list"
            },
            
            onChange_list: this.onChange_list,
            
            // init
            initialize:function() {
            
                var self = this;
            
                // every function that uses 'this' as the current object should be in here
                _.bindAll(this, "render", "onChange_list"); 
                
                //
                this.dataStructureDefinitions = new List();
                // this.dataStructureDefinitions.bind('add', this.appendItem); // collection event binder
                
                // load all data structure definitions from server
                DataCube_DataStructureDefinition.loadAll(
                    
                    // after all elements were loaded, add them to collection
                    // and render the view
                    function(entries) {
                        $(entries).each(function(i, element){
                            element["id"] = element["hashedUrl"];
                            self.dataStructureDefinitions.add(element);
                        });
                        self.render();
                    }
                );
            },
            
            // render view
            render: function(){
                
                // if at least one data structure definition, than load data sets for first one
                if(0 == this.dataStructureDefinitions.models.length) {
                    // todo: handle case that no data structure definition were loaded
                    CubeViz_Links_Module.selectedDSD = {};
                    console.log("onComplete_LoadDataStructureDefinitions");
                    console.log("no data structure definitions were loaded");
                    
                } else if(1 <= this.dataStructureDefinitions.models.length) {
                    
                    // if selected data structure defintion url is not set, than use the first element of the 
                    // previously loaded entries instead
                    if(undefined == CubeViz_Links_Module.selectedDSD.url) {
                        CubeViz_Links_Module.selectedDSD = this.dataStructureDefinitions.models[0].attributes;
                    }
                    
                    /**
                     * Remove this event entry from sidebar left queue
                     */
                    // Module_Main.removeEntryFromSidebarLeftQueue ( "onComplete_LoadDataStructureDefinitions" );
                    
                    // if more than one data structure definition, load for the first one its data sets
                    /*DataSet.loadAll (
                        CubeViz_Links_Module ["selectedDSD"]["url"], 
                        Module_Event.onComplete_LoadDataSets
                    );*/
                }
                
                $(this.el).append(
                    $("#cubeviz-dataStructureDefinition-listTpl").text()
                );
                
                var list = $("#cubeviz-dataStructureDefinition-list"),
                    optionTpl = _.template($("#cubeviz-dataStructureDefinition-listOptionTpl").text());
                
                // output loaded data
                $(this.dataStructureDefinitions.models).each(function(i, element){
                    element.attributes["selected"] = element.attributes["url"] == CubeViz_Links_Module.selectedDSD.url
                        ? " selected" : "";
                    console.log(element.attributes);
                    list.append(optionTpl(element.attributes));
                });
                
                return this;
            }            
        };
        
        var bv = Backbone.View.extend(this.viewInstance);
        this.backboneViewContainer = bv;
        this.backboneViewInstance = new bv ();
    }
}
