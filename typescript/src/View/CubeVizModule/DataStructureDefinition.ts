/// <reference path="..\..\..\DeclarationSourceFiles\libraries\jquery.d.ts" />
/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Underscore.d.ts" />
/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Backbone.d.ts" />

declare var CubeViz_Links_Module: any;

class View_CubeVizModule_DataStructureDefintion extends View_Abstract {
        
    constructor(attachedTo:string) 
    {
        super(attachedTo);
        
        this.id = "View_CubeVizModule_DataStructureDefintion";
    }
    
    /**
     * If new option was selected
     */
    public onChange_list(event) : void 
    {        
        var selectedElementId:string = $("#cubeviz-dataStructureDefinition-list").val(),
            selectedElement = this["collection"].get(selectedElementId),
            thisView = this["thisView"];
        
        // TODO: remember previous selection
        
        // set new selected data structure definition
        CubeViz_Links_Module.selectedDSD = {};
        thisView.setSelectedDSD([selectedElement.attributes]);
        
        // load data set view
        thisView.viewManager.callView("View_CubeVizModule_DataSet");
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
                "change #cubeviz-dataStructureDefinition-list": "onChange_list"
            },
            
            onChange_list: this.onChange_list,
            
            // init
            initialize:function() {
            
                var self = this;
                self.thisView = thisView;
            
                // every function that uses 'this' as the current object should be in here
                _.bindAll(this, "render", "onChange_list"); 
                
                /**
                 * Load all data structure definitions
                 */
                this.collection = new List();
                
                // load all data structure definitions from server
                DataCube_DataStructureDefinition.loadAll(
                    
                    // after all elements were loaded, add them to collection
                    // and render the view
                    function(entries) {
                        
                        // set selectedDsd
                        thisView.setSelectedDSD(entries);
                        
                        // load data set view
                        thisView.viewManager.callView("View_CubeVizModule_DataSet");
                        
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
                
                var listTpl = $("#cubeviz-dataStructureDefinition-tpl-list").text();
                $(this.el).append(listTpl);
                
                var list = $("#cubeviz-dataStructureDefinition-list"),
                    optionTpl = _.template($("#cubeviz-dataStructureDefinition-tpl-listOption").text());
                
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
    
    /**
     * 
     */
    public setSelectedDSD(entries) : void 
    {
        // if at least one data structure definition, than load data sets for first one
        if(0 == entries.length) {
            // todo: handle case that no data structure definition were loaded!
            CubeViz_Links_Module.selectedDSD = {};
            console.log("onComplete_LoadDataStructureDefinitions");
            console.log("no data structure definitions were loaded");
            
        } else if(1 <= entries.length) {
            
            // if selected data structure defintion url is not set, than use the first element of the 
            // previously loaded entries instead
            if(undefined == CubeViz_Links_Module.selectedDSD.url) {
                CubeViz_Links_Module.selectedDSD = entries[0];
            }
        }
    }
}
