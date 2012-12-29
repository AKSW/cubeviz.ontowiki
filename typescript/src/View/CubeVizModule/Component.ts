/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_CubeVizModule_Component extends CubeViz_View_Abstract 
{
    /**
     * 
     */    
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CubeVizModule_Component", attachedTo, app);
    }
    
    /**
     *
     */
    public configureSetupComponentDialog() 
    {
        var backupCollection = this.collection._,
            dialogTpl = _.template(
                $("#cubeviz-component-tpl-setupComponentDialog").text()
            ),
            hashedUrl:string = "",
            self = this;
        
        // empty collection
        this.collection.reset();
        
        // go through all components and create a reference to dialog container
        $(backupCollection).each(function(i, component){
            
            hashedUrl = component["hashedUrl"];
            
            // set dialog reference and template
            $("#cubeviz-component-setupDialogContainer").append(
                dialogTpl({label: "Foo", hashedUrl:hashedUrl})
            );
                        
            component["dialogReference"] = $("#cubeviz-component-setupComponentDialog-" + 
                                               hashedUrl);
            
            component["dialogReference"].dialog({
                    "autoOpen": false,
                    "draggable": false,
                    "height": 485,
                    "hide": "slow",
                    "show": "slow",
                    "title": $("#cubeviz-component-tpl-setupComponentDialogTitle").text(),
                    "width": 700
                })
                .attr("hashedUrl", hashedUrl);
                
            //
            self.configureSetupComponentElements(component);
            
            self.collection.add(component);
        });
    }
    
    /**
     *
     */
    public configureSetupComponentElements(component:any) 
    {
        var dialogDiv = $("#cubeviz-component-setupComponentDialog-" + component.hashedUrl),
            elementList = $(dialogDiv.find(".cubeviz-component-setupComponentElements")[0]),
            elementTpl = _.template($("#cubeviz-component-tpl-setupComponentElement").text()),
            selectedDimensions = this.app._.data.selectedComponents
                                                 .dimensions[component.hashedUrl]
                                                 .elements,
            setElementChecked = null;

        // sort elements by label, ascending
        component.elements.sort(function(a, b) {
           return a.propertyLabel.toUpperCase()
                    .localeCompare(b.propertyLabel.toUpperCase());
        });
        
        // Go through all elements of the given component ..
        $(component.elements).each(function(i, element){
            
            // check if current element will be checked
            setElementChecked = undefined !== _.find(selectedDimensions, function(dim){ 
                return dim.property == element["property"]; 
            });
            
            if(true === setElementChecked){
                element["checked"] = " checked=\"checked\"";
            } else {
                element["checked"] = "";
            }
            // ... add new item to element list
            elementList.append(elementTpl(element));
        });
    }
    
    /**
     *
     */
    public initialize() 
    {        
        var self = this;
        
        // load all data structure definitions from server
        DataCube_Component.loadAllDimensions(
        
            this.app._.backend.url,
            this.app._.backend.modelUrl,
            this.app._.data.selectedDSD.url,
            this.app._.data.selectedDS.url,
            
            // after all elements were loaded, add them to collection
            // and render the view
            function(entries) {
                
                // set selectedDsd
                self.setComponentsStuff(entries);
                
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
    public onClick_deselectedAllComponentElements(event) 
    {
        $("#cubeviz-component-setupComponentDialog-" + $(event.target).attr("hashedUrl") + 
          " [type=\"checkbox\"]").attr("checked", false);
    }
    
    /**
     *
     */
    public onClick_setupComponentOpener(event) 
    {
        var component:any = this.collection.get($(event.target).attr("hashedUrl"));
        component.dialogReference.dialog("open");
    }
    
    /**
     *
     */
    public onClick_questionmark() 
    {
        $("#cubeviz-component-questionMarkDialog").dialog("open");
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
            selectedComponentDimensions = this.app._.data.selectedComponents.dimensions,
            selectedDimension = null,
            tmp = null;
        
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
        $("#cubeviz-component-questionMarkDialog").dialog({
            "autoOpen": false,
            "draggable": false,
            "hide": "slow",
            "show": "slow"
        });
        
        this.configureSetupComponentDialog();
        
        /**
         * Delegate events to new items of the template
         */
        this.delegateEvents({         
            "click .cubeviz-component-setupComponentDeselectButton": 
                this.onClick_deselectedAllComponentElements,
                
            "click .cubeviz-component-setupComponentOpener": 
                this.onClick_setupComponentOpener,
            
            "click #cubeviz-component-questionMark": 
                this.onClick_questionmark,
        });
        
        return this;
    }
    
    /**
     * 
     */
    public setComponentsStuff(entries) : void 
    {        
        // save pulled component dimensions
        this.app._.data.components.dimensions = entries;
        
        // set default values for selected component dimensions list
        // for each componentDimension first entry will be selected
        // e.g. Year (2003), Country (Germany)
        this.app._.data.selectedComponents.dimensions =
            DataCube_Component.getDefaultSelectedDimensions ( entries );
    }
}
