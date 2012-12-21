/// <reference path="..\..\..\DeclarationSourceFiles\views\CubeVizModule.d.ts" />

/// <reference path="..\..\..\DeclarationSourceFiles\libraries\jquery.d.ts" />
/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Underscore.d.ts" />
/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Backbone.d.ts" />

declare var CubeViz_Links_Module: any;

class View_CubeVizModule_DataSet extends View_Abstract {
        
    constructor() 
    {
        super();
        
        this.id = "View_CubeVizModule_DataSet";
        this.attachedTo = "#cubviz-dataSet-container";
    }
    
    /**
     * 
     */
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
        
        var thisView = this;
        
        /**
         * 
         */
        this.viewInstance = {
            
            // el attaches to existing element
            el: $(this.attachedTo), 
            
            // 
            events: {
                "change #cubeviz-dataSet-list": "onChange_list"
            },
            
            onChange_list: this.onChange_list,
            
            // init
            initialize:function() {
            
                var self = this;
            
                // every function that uses 'this' as the current object should be in here
                _.bindAll(this, "render", "onChange_list"); 
                
                /**
                 * Load all data structure definitions
                 */
                this.collection = new List();
                
                // load all data structure definitions from server
                DataCube_DataSet.loadAll(
                
                    CubeViz_Links_Module.selectedDSD.url,
                    
                    // after all elements were loaded, add them to collection
                    // and render the view
                    function(entries) {
                        
                        // set selectedDsd
                        thisView.setSelectedDS(entries);
                        
                        // load components
                        // thisView.viewManager.callView("View_CubeVizModule_Components");
                        
                        // save given elements
                        $(entries).each(function(i, element){
                            element["id"] = element["hashedUrl"];
                            self.collection.add(element);
                        });
                        
                        // render given elements
                        self.render();
                    }
                );
            },
            
            /**
             * render view
             */
            render: function(){
                
                var listTpl = $("#cubeviz-dataSet-tpl-list").text();
                $(this.el).append(listTpl);
                
                var list = $("#cubeviz-dataSet-list"),
                    optionTpl = _.template($("#cubeviz-dataSet-tpl-listOption").text());
                
                // output loaded data
                $(this.collection.models).each(function(i, element){
                    
                    // set selected variable, if element url is equal to selected dsd
                    element.attributes["selected"] = element.attributes["url"] == CubeViz_Links_Module.selectedDSD.url
                        ? " selected" : "";
                        
                    list.append(optionTpl(element.attributes));
                });
                
                return this;
            }            
        };
        
        var bv = Backbone.View.extend(this.viewInstance);
        this.backboneViewContainer = bv;
        this.backboneViewInstance = new bv ();
    }
    
    public setSelectedDS(entries) : void 
    {
        // if at least one data structure definition, than load data sets for first one
        if ( 0 == entries.length ) {
            // todo: handle case that no data sets were loaded
            CubeViz_Links_Module.selectedDS = {};
            console.log ( "onComplete_LoadDataSets" );
            console.log ( "no data sets were loaded" );
            
        } else if ( 1 <= entries["length"] ) {
            
            // if selected data set url is not set, than use the first element of the previously loaded 
            // entries instead
            if ( undefined == CubeViz_Links_Module.selectedDS || 
                 undefined == CubeViz_Links_Module.selectedDS.url ) {
                CubeViz_Links_Module.selectedDS = entries[0];
            }
        }
    }
}
