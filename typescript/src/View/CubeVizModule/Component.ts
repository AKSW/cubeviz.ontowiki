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
        
        // publish event handlers to application:
        // if one of these events get triggered, the associated handler will
        // be executed to handle it
        this.bindGlobalEvents([
            {
                name:    "onChange_selectedDS",
                handler: this.onChange_selectedDS
            },
            {
                name:    "onStart_application",
                handler: this.onStart_application
            }
        ]); 
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
            componentElements = _.toArray(component.elements),
            elementList = $(dialogDiv.find(".cubeviz-component-setupComponentElements")[0]),
            elementTpl = _.template($("#cubeviz-component-tpl-setupComponentElement").text()),
            selectedDimensions = this.app._.data.selectedComponents
                                                 .dimensions[component.hashedUrl]
                                                 .elements,
            setElementChecked = null;

        // sort elements by label, ascending
        componentElements.sort(function(a, b) {
           return a.propertyLabel.toUpperCase()
                    .localeCompare(b.propertyLabel.toUpperCase());
        });
        
        // Go through all elements of the given component ..
        _.each(componentElements, function(element){
            
            // check if current element will be checked
            setElementChecked = undefined !== _.find(selectedDimensions, function(dim){ 
                return dim.property == element.property; 
            });
            
            if(true === setElementChecked){
                element.checked = " checked=\"checked\"";
            } else {
                element.checked = "";
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
        // save given elements
        this.collection.reset("hashedUrl");
        this.collection.addList(this.app._.data.components.dimensions);
     
        this.render();
    }
    
    /**
     *
     */
    public loadComponentDimensions(callback) : void 
    {
        var self = this;
        
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
                
                callback();               
            }
        );
    }
    
    /**
     * Load new measures.
     * @param callback Function to call the load is complete
     */
    public loadComponentMeasures(callback) : void 
    {
        var self = this;
        
        /**
         * Load measures
         */
        DataCube_Component.loadAllMeasures(
        
            this.app._.backend.url,
            this.app._.backend.modelUrl,
            this.app._.data.selectedDSD.url,
            this.app._.data.selectedDS.url,
            
            function(entries) {
                
                // set components (measures)
                self.app._.data.components.measures = entries;
                self.app._.data.selectedComponents.measures = entries;
                
                // execute given callback method
                callback();
            }
        );
    }
    
    /**
     *
     */
    public onChange_selectedDS(event, data) 
    {
        var self = this;
        
        this.destroy();
        
        this.loadComponentDimensions(function(){
            // Load measures
            self.loadComponentMeasures($.proxy(self, "render"));
        });
    }
    
    /**
     *
     */
    public onClick_closeAndApply(event) : void 
    {
        // The dialog the clicked button is attached to
        var dialogDiv = $(event.target).data("dialogDiv"),
            self = this;
            
        // save changes in dialog div
        this.readAndSaveSetupComponentDialogChanges(dialogDiv,
            function(){
                // close dialog
                $(event.target)
                    .data("dialogDiv")
                    .dialog("close");
            }
        );
    }
    
    /**
     *
     */
    public onClick_closeAndUpdate(event) : void
    {
        var dialogDiv = $(event.target).data("dialogDiv"),
            self = this;
        
        // save changes in dialog div
        this.readAndSaveSetupComponentDialogChanges(dialogDiv,
            function(){
                    
                // if module + indexAction stuff was loaded
                if(true === cubeVizApp._.backend.uiParts.index.isLoaded) {
                    
                    self.triggerGlobalEvent("onReRender_visualization");

                    $(event.target)
                        .data("dialogDiv")
                        .dialog("close");
                    
                // if you are only in the module
                } else {
                    
                    $(event.target)
                        .data("dialogDiv")
                        .dialog("close");
                
                    // refresh page and show visualization for the latest linkCode
                    window.location.href = self.app._.backend.url
                        + "?m=" + encodeURIComponent (self.app._.backend.modelUrl)
                        + "&dataHash="  + self.app._.data.hash
                        + "&uiHash="    + self.app._.ui.hash
                }
            }
        );        
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
    
        // Change overlay height (jQueryUI dialog)
        // TODO find a better place for that!
        $(".ui-widget-overlay").css(
            "height", screen.height + (screen.height*0.5)
        );
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
    public readAndSaveSetupComponentDialogChanges(dialogDiv, callback) : void
    {        
        // extract and set necessary elements and data
        var elementList = dialogDiv.find(".cubeviz-component-setupComponentElements").children(),
            componentBox = dialogDiv.data("componentBox"),
            hashedUrl = dialogDiv.data("hashedUrl"),
            input = null,
            inputLabel = null,
            selectedElements = [],
            self = this;
        
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
                
        // Update selected elements counter
        $(componentBox.find(".cubeviz-component-selectedCount").get(0)).html(
            selectedElements.length
        );
        
        // update number of X dimensions
        this.app._.data.numberOfMultipleDimensions = _.size(CubeViz_Visualization_Controller.
            getMultipleDimensions (this.app._.data.selectedComponents.dimensions));
        this.app._.data.numberOfOneElementDimensions = _.size(CubeViz_Visualization_Controller.
            getOneElementDimensions (this.app._.data.selectedComponents.dimensions));
        
        // update data hash
        CubeViz_ConfigurationLink.save(
            this.app._.backend.url,
            this.app._.data,
            "data",
            function(updatedDataHash){ 
        
                self.app._.data.hash = updatedDataHash;

                // based on updatedLinkCode, load new observations
                DataCube_Observation.loadAll(updatedDataHash, self.app._.backend.url,
                    function(newEntities){
                        // save new observations
                        self.app._.data.retrievedObservations = newEntities;
                
                        callback();
                    }
                );
            }
        );
    }
    
    /**
     *
     */
    public onComplete_loadDS(event, data) 
    {
        // use another event handler for this event
        this.onChange_selectedDS(event, data);
    }
    
    /**
     *
     */
    public onComplete_loadObservations(event, updatedRetrievedObservations) 
    {
        console.log("updatedRetrievedObservations");
        console.log(updatedRetrievedObservations);
        this.app._.data.retrievedObservations = updatedRetrievedObservations;
    }
    
    /**
     *
     */
    public onStart_application() 
    {
        this.initialize();
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
        _.each(backendCollection, function(dimension){
            
            if ( undefined !== selectedComponentDimensions ) {
                selectedDimension = selectedComponentDimensions[dimension.hashedUrl];
                dimension.selectedElementCount = _.keys(selectedDimension.elements).length;
            } else {
                dimension.selectedElementCount = 1;
            }
            
            // set general element count
            dimension.elementCount = _.size(dimension.elements);
            
            // build html out of template
            componentBox = $(optionTpl(dimension));
            
            // get opener link
            $(componentBox.find(".cubeviz-component-setupComponentOpener").get(0))
                .data("hashedUrl", dimension.hashedUrl);
            
            // add option to list
            list.append(componentBox);
            
            // configure associated dialog
            self.configureSetupComponentDialog(
                dimension,
                componentBox,
                // link to open the dialog
                $(componentBox.find(".cubeviz-component-setupComponentOpener").get(0))
            );
            
            /**
             * Update selected elements counter
             */
            $(componentBox.find(".cubeviz-component-selectedCount").get(0)).html(
                dimension.selectedElementCount
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
        this.bindUserInterfaceEvents({         
            "click .cubeviz-component-closeAndApply": 
                this.onClick_closeAndApply,
                
            "click .cubeviz-component-closeAndUpdate": 
                this.onClick_closeAndUpdate,
                
            "click .cubeviz-component-setupComponentDeselectButton": 
                this.onClick_deselectedAllComponentElements,
                
            "click .cubeviz-component-setupComponentOpener": 
                this.onClick_setupComponentOpener,
            
            "click #cubeviz-component-questionMark": 
                this.onClick_questionmark
        });
        
        return this;
    }
}
