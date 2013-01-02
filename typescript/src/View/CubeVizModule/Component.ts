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
    public configureSetupComponentDialog(component:any, componentBox, opener) 
    {
        var dialogTpl = _.template(
                $("#cubeviz-component-tpl-setupComponentDialog").text()
            ),
            self = this;

        // set dialog reference and template
        $("#cubeviz-component-setupDialogContainer").append(
            dialogTpl({label: component.label, hashedUrl:component.hashedUrl})
        );
        
        var div = $("#cubeviz-component-setupComponentDialog-" + component.hashedUrl);
        
        div
        .data("componentBox", componentBox)
        .data("hashedUrl", component.hashedUrl)
        
        // setup dialog
        .dialog({
            autoOpen: false,
            closeOnEscape: false,
            draggable: false,
            height: 485,
            hide: "slow",
            modal: true,
            open: function(event,ui){
                $(".ui-dialog-titlebar-close", $(this).parent()).hide();
            },
            overlay: {
                "background-color": "#FFFFFF",
                opacity: 0.5
            },
            show: "slow",
            width: 700
        });
        
        // attach dialog div to deselect button
        $(div.find(".cubeviz-component-setupComponentDeselectButton").get(0))
            .data("dialogDiv", div);
        
        // attach dialog div to dialog opener link
        opener.data("dialogDiv", div);
        
        // attach dialog div to "close and apply" button
        $($(div.children().last()).children().get(0))
            .data("dialogDiv", div);
            
        // attach dialog div to "close and update" button
        $($(div.children().last()).children().get(1))
            .data("dialogDiv", div);
            
        // configure elements of the dialog
        this.configureSetupComponentElements(component);
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
    public destroy() : CubeViz_View_Abstract
    {
        // 
        $(this.collection._).each(function(i, c){
            // set dialog to initial state
            $("#cubeviz-component-setupComponentDialog-" + c["hashedUrl"]).dialog("destroy");
            $("#cubeviz-component-setupComponentDialog-" + c["hashedUrl"]).remove();
        });
        
        $("#cubeviz-component-setupDialogContainer").empty();
        
        super.destroy();
        
        // Question mark dialog
        $("#cubeviz-component-questionMarkDialog").dialog("destroy");
        
        return this;
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
                
                // save pulled component dimensions
                self.app._.data.components.dimensions = entries;
                
                // set default values for selected component dimensions list
                // for each componentDimension first entry will be selected
                // e.g. Year (2003), Country (Germany)
                self.app._.data.selectedComponents.dimensions =
                    DataCube_Component.getDefaultSelectedDimensions ( entries );
                
                // save given elements, doublings were ignored!
                self.collection
                        .reset("hashedUrl")
                        .addList(entries);
                
                DataCube_Component.loadAllMeasures(
                
                    self.app._.backend.url,
                    self.app._.backend.modelUrl,
                    self.app._.data.selectedDSD.url,
                    self.app._.data.selectedDS.url,
                    
                    function(entries) {
                        
                        // set components (measures)
                        self.app._.data.components.measures = entries;
                        self.app._.data.selectedComponents.measures = entries;
                        
                        // render given elements
                        self.render();
                    }
                );
            }
        );
    }
    
    /**
     *
     */
    public onClose_setupComponentDialog(event) : void
    {        
        // extract and set necessary elements and data
        var dialogDiv = $(event.target),
            elementList = dialogDiv.find(".cubeviz-component-setupComponentElements").children(),
            componentBox = dialogDiv.data("componentBox"),
            hashedUrl = dialogDiv.data("hashedUrl"),
            input = null,
            inputLabel = null,
            selectedElements = [];
        
        // if some items next to the close button was clicked, this event could
        // be executed, so prevent invalid hashedUrl's
        if(undefined === hashedUrl) {
            return;
        }
            
        /**
         * Go through all checkboxes and save their data if checked
         */
        $(elementList).each(function(i, element){
            
            // extract required elements
            input       = $($(element).children().get(0));
            inputLabel  = $($(element).children().get(1));
            
            // add only elements if they were checked
            if("checked" === input.attr("checked")) {
                selectedElements.push({
                    hashedProperty: input.attr("name"),
                    property: input.val(),
                    propertyLabel: inputLabel.html()
                });
            }
        });
        
        // if nothing was selected, set the first item per default
        if(0 == _.size(selectedElements)) {
            selectedElements = [];
            // add item as new instance to avoid simply copy the reference
            selectedElements.push(JSON.parse(JSON.stringify(
                this.app._.data.components.dimensions[hashedUrl].elements[0]
            )));
            
            // recheck the first checkbox of the elements list
            $($(dialogDiv.find(".cubeviz-component-setupComponentElements")
                .children().get(0))
                .children().get(0))
                .attr("checked", true);
        }        
        
        // save updated element list
        this.app._.data.selectedComponents.dimensions[hashedUrl].elements = selectedElements;
        
        /**
         * Update selected elements counter
         */
        $(componentBox.find(".cubeviz-component-selectedCount").get(0)).html(
            selectedElements.length
        );
    }
    
    /**
     *
     */
    public onClick_closeAndApply(event) : void 
    {
        $(event.target).data("dialogDiv")
            .dialog("close");
            
        // simply apply changes
    }
    
    /**
     *
     */
    public onClick_closeAndUpdate(event) : void
    {
        $(event.target).data("dialogDiv")
            .dialog("close");
            
        // update graph visualization
    }
    
    /**
     *
     */
    public onClick_deselectedAllComponentElements(event) : void
    {
        $(event.target).data("dialogDiv")
            .find("[type=\"checkbox\"]")
            .attr("checked", false);
    }
    
    /**
     *
     */
    public onClick_setupComponentOpener(event) : void
    {
        $(event.target).data("dialogDiv").dialog("open");
    }
    
    /**
     *
     */
    public onClick_questionmark() : void
    {
        $("#cubeviz-component-questionMarkDialog").dialog("open");
    }
    
    /**
     *
     */
    public render()
    {
        /**
         * List elements
         */
        var backendCollection = this.collection._,
            list = $("#cubviz-component-listBox"),
            componentBox:any = null,
            optionTpl = _.template($("#cubeviz-component-tpl-listBoxItem").text()),
            selectedComponentDimensions = this.app._.data.selectedComponents.dimensions,
            selectedDimension = null,
            self = this,
            tmp = null;
            
        // empty list
        this.collection.reset();
        
        // output loaded data
        $(backendCollection).each(function(i, dimension){
            
            if ( undefined !== selectedComponentDimensions ) {
                selectedDimension = selectedComponentDimensions[dimension["hashedUrl"]];
                dimension["selectedElementCount"] = _.keys(selectedDimension["elements"]).length;
            } else {
                dimension["selectedElementCount"] = 1;
            }
            
            // set general element count
            dimension["elementCount"] = _.size(dimension["elements"]);
            
            // build html out of template
            componentBox = $(optionTpl(dimension));
            
            // get opener link
            $(componentBox.find(".cubeviz-component-setupComponentOpener").get(0))
                .data("hashedUrl", dimension["hashedUrl"]);
            
            // add option to list
            list.append(componentBox);
            
            // configure associated dialog
            self.configureSetupComponentDialog(
                dimension,
                componentBox,
                // link to open the dialog
                $(componentBox.find(".cubeviz-component-setupComponentOpener").get(0))
            );
            
            self.collection.add(dimension);
        });
        
        /**
         * Question mark dialog
         */
        $("#cubeviz-component-questionMarkDialog").dialog({
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
        this.delegateEvents({         
            "click .cubeviz-component-closeAndApply": 
                this.onClick_closeAndApply,
                
            "click .cubeviz-component-closeAndUpdate": 
                this.onClick_closeAndUpdate,
                
            "click .cubeviz-component-setupComponentDeselectButton": 
                this.onClick_deselectedAllComponentElements,
                
            "click .cubeviz-component-setupComponentOpener": 
                this.onClick_setupComponentOpener,
            
            "click #cubeviz-component-questionMark": 
                this.onClick_questionmark,
            
            "dialogclose .cubeviz-component-setupComponentDialog": 
                this.onClose_setupComponentDialog
        });
        
        return this;
    }
}
