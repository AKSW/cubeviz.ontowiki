/// <reference path="..\..\..\DeclarationSourceFiles\libraries\jquery.d.ts" />
/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Underscore.d.ts" />
/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Backbone.d.ts" />

declare var CubeViz_Links_Module: any;

class View_CubeVizModule_DataSet extends View_Abstract {
        
    constructor(attachedTo:string) 
    {
        super(attachedTo);
        
        this.id = "View_CubeVizModule_DataSet";
    }
    
    /**
     * 
     */
    public onChange_list() : void 
    {
        var selectedElementId:string = $("#cubeviz-dataSet-list").val(),
            selectedElement = this["collection"].get(selectedElementId),
            thisView = this["thisView"];

        // TODO: remember previous selection
        
        console.log(this);
        console.log(this["collection"]);
        console.log(thisView);

        // set new selected data set
        thisView.setSelectedDS([selectedElement.attributes]);

        // reset component view
        thisView.viewManager.callView("View_CubeVizModule_Component");
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
                
                console.log("");
                console.log("INIT DATA SET >>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>");
                console.log("");
            
                var self = this;                
                self.thisView = thisView;
            
                // every function that uses 'this' as the current object should be in here
                _.bindAll(this, "render", "onChange_list"); 
                
                /**
                 * Load all data sets
                 */
                DataCube_DataSet.loadAll(
                
                    CubeViz_Links_Module.selectedDSD.url,
                    
                    // after all elements were loaded, add them to collection
                    // and render the view
                    function(entries) {
                        
                        self.collection = new List();
                        
                        // set selectedDsd
                        thisView.setSelectedDS(entries);
                        
                        // save given elements
                        $(entries).each(function(i, element){
                            element["id"] = element["hashedUrl"];
                            self.collection.add(element);
                        });
                        
                        // render given elements
                        self.render();
                        
                        // load components
                        thisView.viewManager.callView("View_CubeVizModule_Component");
                    }
                );
            },
            
            /**
             * render view
             */
            render: function(){
                
                $("#cubeviz-dataSet-list").remove();
                
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
        if(0 == entries.length) {
            // todo: handle case that no data sets were loaded
            CubeViz_Links_Module.selectedDS = {};
            console.log ( "onComplete_LoadDataSets" );
            console.log ( "no data sets were loaded" );
            
        } else {
            CubeViz_Links_Module.selectedDS = entries[0];
        }
    }
}
