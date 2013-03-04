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
        $("#cubeviz-component-setupDialogContainer").append(dialogTpl({
            __cv_niceLabel: component.__cv_niceLabel, 
            __cv_hashedUri: component.__cv_hashedUri
        }));
        
        var div = $("#cubeviz-component-setupComponentDialog-" + component.__cv_hashedUri);
        
        div
            .data("componentBox", componentBox)
            .data("component", component);
        
        // attach dialog to div element
        CubeViz_View_Helper.attachDialogTo(div);
        
        // attach dialog div to deselect button
        $(div.find(".cubeviz-component-selectAllButton").get(0))
            .data("dialogDiv", div);
        
        // attach dialog div to deselect button
        $(div.find(".cubeviz-component-deselectButton").get(0))
            .data("dialogDiv", div);
        
        // attach dialog div to dialog opener link
        opener.data("dialogDiv", div);
        
        // attach dialog div to "cancel" button
        $($(div.find(".cubeviz-component-cancel")).get(0))
            .data("dialogDiv", div);
            
        // attach dialog div to "close and update" button
        $($(div.find(".cubeviz-component-closeAndUpdate")).get(0))
            .data("dialogDiv", div);
            
        /**
         * Sort buttons
         */
        // attach dialog div to "alphabet" button
        $($(div.find(".cubeviz-component-sortButtons")).children().get(0))
            .data("dialogDiv", div)
            .data("type", "alphabet");
            
        // attach dialog div to "check status" button
        $($(div.find(".cubeviz-component-sortButtons")).children().get(1))
            .data("dialogDiv", div)
            .data("type", "check status");
            
        // attach dialog div to "observation count" button
        $($(div.find(".cubeviz-component-sortButtons")).children().get(2))
            .data("dialogDiv", div)
            .data("type", "observation count");
            
        // configure elements of the dialog
        this.configureSetupComponentElements(component);
    }
    
    /**
     *
     */
    public configureSetupComponentElements(component:any) 
    {
        var dialogDiv = $("#cubeviz-component-setupComponentDialog-" + component.__cv_hashedUri),
            elementInstance:any = {},
            componentElements:CubeViz_Collection = new CubeViz_Collection("__cv_niceLabel"),
            elementList = $(dialogDiv.find(".cubeviz-component-setupComponentElements")[0]),
            elementTpl:any = _.template($("#cubeviz-component-tpl-setupComponentElement").text()),
            selectedDimensions:any = this.app._.data.selectedComponents
                                                 .dimensions[component.__cv_uri]
                                                 .__cv_elements,
            setElementChecked = null,
            wasSomethingSelected:bool = false;
            
        componentElements
            
            // add elements of current component
            .addList(component.__cv_elements)
            
            // sort
            .sortAscendingBy(componentElements.idKey)
        
            // Go through all elements of the given component ..
            .each(function(element){
                
                // check if current element will be checked
                setElementChecked = undefined !== _.find(selectedDimensions, function(dim){ 
                    return false === _.isUndefined(dim) 
                        ? dim.__cv_uri == element.__cv_uri
                        : false;
                });
                
                if(true === setElementChecked) 
                    wasSomethingSelected = true;
                    
                elementInstance = $(elementTpl({
                    checked: true === setElementChecked ? " checked=\"checked\"" : "",
                    hashedUri: element.__cv_hashedUri,
                    __cv_niceLabel: element.__cv_niceLabel,
                    __cv_uri: element.__cv_uri
                }));
                
                elementInstance.data("data", element);
                
                // ... add new item to element list
                elementList.append(elementInstance);
            });
         
        // if nothing was selected in the list, autoselect first item
        if(false === wasSomethingSelected) {
            $($(elementList.find("li").first()).find("input")).attr("checked", "checked");
        }
    }
    
    /**
     *
     */
    public destroy() : CubeViz_View_Abstract
    {
        // 
        _.each(this.collection._, function(component){
            // set dialog to initial state
            $("#cubeviz-component-setupComponentDialog-" + component.__cv_hashedUri)
                .dialog("destroy");
            $("#cubeviz-component-setupComponentDialog-" + component.__cv_hashedUri)
                .remove();
        });
        
        $("#cubeviz-component-setupDialogContainer").empty();
        
        super.destroy();
        
        // Question mark dialog
        CubeViz_View_Helper.destroyDialog($("#cubeviz-component-dialog"));
        
        return this;
    }
    
    /**
     *
     */
    public initialize() 
    {
        // save given elements
        this.collection.reset("__cv_hashedUri");
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
            this.app._.data.selectedDSD.__cv_uri,
            this.app._.data.selectedDS.__cv_uri,
            
            // after all elements were loaded, add them to collection
            // and render the view
            function(entries) {
                
                // save pulled component dimensions
                // self.app._.data.components.dimensions = JSON.parse(JSON.stringify(entries));
                self.app._.data.components.dimensions = entries;
                
                // set default values for selected component dimensions list
                // for each componentDimension a couple of random selected
                // elements will be selected
                // e.g. Year (2003), Country (Germany)
                self.app._.data.selectedComponents.dimensions =
                    DataCube_Component.getDefaultSelectedDimensions ( entries );
                
                // save given elements, doublings were ignored!
                self.collection
                    .reset("__cv_hashedUri")
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
            this.app._.data.selectedDSD.__cv_uri,
            this.app._.data.selectedDS.__cv_uri,
            
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
        
        // load dimensional data
        this.loadComponentDimensions(function(newComponentDimensions){

            // load measures
            self.loadComponentMeasures(function(newComponentMeasures){
                
                // update link code        
                CubeViz_ConfigurationLink.save(
                    self.app._.backend.url, self.app._.data, "data",
                
                    // based on updatedLinkCode, load new observations
                    function(updatedDataHash){
                        
                        self.app._.backend.dataHash = updatedDataHash;
                        
                        self.render();
                    }
                );
            });
        });
    }
    
    /**
     * Close dialog without apply changes
     * @param event Event targets to clicked button
     */
    public onClick_cancel(event) : void 
    {
        // close dialog the clicked button is attached to
        CubeViz_View_Helper.closeDialog($(event.target).data("dialogDiv"));
    }
    
    /**
     * Apply changes, update data and close dialog
     * @param event Event targets to clicked button
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
                }
                
                self.triggerGlobalEvent("onUpdate_componentDimensions");
                
                // if only module was loaded, move reloading stuff to footer.ts
                CubeViz_View_Helper.closeDialog($(event.target).data("dialogDiv"));
            }
        );        
    }
    
    /**
     *
     */
    public onClick_deselectButton(event) : void
    {
        $(event.target).data("dialogDiv")
            .find("[type=\"checkbox\"]")
            .attr("checked", false);
    }
    
    /**
     *
     */
    public onClick_selectAllButton(event) : void
    {
        $(event.target).data("dialogDiv")
            .find("[type=\"checkbox\"]")
            .attr("checked", true);
    }
    
    /**
     *
     */
    public onClick_setupComponentOpener(event) : void
    {
        this.triggerGlobalEvent("onClick_setupComponentOpener");
        
        CubeViz_View_Helper.openDialog($(event.target).data("dialogDiv"));
    }
    
    /**
     *
     */
    public onClick_sortButton(event) : void
    {
        var dialogDiv = $(event.target).data("dialogDiv");
        
        // do nothingif dialog div was not given
        if(true === _.isUndefined(dialogDiv)){
            return;
        }
        
        var dimensionTypeUrl = dialogDiv.data("dimensionTypeUrl"),
            list:any = $(dialogDiv.find(".cubeviz-component-setupComponentElements").first()),
            listItems:any[] = list.children('li'),
            modifiedItemList:any[] = [];
        
        // remove .cubeviz-component-sortButtonSelected from all sortButtons
        $(event.target).data("dialogDiv").find(".cubeviz-component-sortButton")
            .removeClass("cubeviz-component-sortButtonSelected");
        
        // add selected class to current clicked button
        $(event.target)
            .addClass("cubeviz-component-sortButtonSelected");
        
        // decide by given type, what sort function to execute
        switch ($(event.target).data("type")) {
            
            case "alphabet":
                modifiedItemList = CubeViz_View_Helper.sortLiItemsByAlphabet(listItems);
                break;
                
            case "check status":
                modifiedItemList = CubeViz_View_Helper.sortLiItemsByCheckStatus(listItems);
                break;
                
            case "observation count":
                modifiedItemList = CubeViz_View_Helper.sortLiItemsByObservationCount(
                    listItems,
                    dimensionTypeUrl,
                    this.app._.backend.retrievedObservations
                );
                break;
                
            default: return; 
        }
        
        // empty list ...
        list.empty();
        
        // ... and fill it with new ordered items
        _.each(modifiedItemList, function(item){
            list.append(item);
        });
    }
    
    /**
     *
     */
    public onClick_questionmark() : void
    {
        CubeViz_View_Helper.openDialog($("#cubeviz-component-dialog"));
    }
    
    
    /**
     *
     */
    public readAndSaveSetupComponentDialogChanges(dialogDiv, callback) : void
    {        
        // extract and set necessary elements and data
        var elementList = dialogDiv.find(".cubeviz-component-setupComponentElements").children(),
            componentBox = dialogDiv.data("componentBox"),
            component = dialogDiv.data("component"),
            input = null,
            inputLabel = null,
            selectedElements = new CubeViz_Collection("__cv_uri"),
            self = this;
        
        // if some items next to the close button was clicked, this event could
        // be executed, so prevent invalid component data
        if(undefined === component) {
            return;
        }
        
        /**
         * Go through all checkboxes and save their data if checked
         */
        _.each(elementList, function(element){
            
            // extract required elements
            input       = $($(element).children().get(0));
            inputLabel  = $($(element).children().get(1));
            
            // add only elements if they were checked
            if("checked" === input.attr("checked")) {
                selectedElements.add($(element).data("data"));
            }
        });
        
        // if nothing was selected, set the first item per default
        if(0 == _.size(selectedElements)) {
            
            // add item as new instance to avoid simply copy the reference
            selectedElements.add(JSON.parse(JSON.stringify(
                this.app._.data.components.dimensions[component.__cv_uri].__cv_elements[0]
            )));
            
            // recheck the first checkbox of the elements list
            $($(dialogDiv.find(".cubeviz-component-setupComponentElements")
                .children().get(0))
                .children().get(0))
                .attr("checked", true);
        }
        
        // save updated element list
        this.app._.data.selectedComponents.dimensions[component.__cv_uri]
            .__cv_elements = selectedElements.toObject();
                
        // Update selected elements counter
        $(componentBox.find(".cubeviz-component-selectedCount").get(0)).html(
            selectedElements.size()
        );
        
        // update number of X dimensions
        this.app._.data.numberOfMultipleDimensions = _.size(CubeViz_Visualization_Controller.
            getMultipleDimensions (this.app._.data.selectedComponents.dimensions));
        this.app._.data.numberOfOneElementDimensions = _.size(CubeViz_Visualization_Controller.
            getOneElementDimensions (this.app._.data.selectedComponents.dimensions));
        
        // update link code        
        CubeViz_ConfigurationLink.save(
            this.app._.backend.url, this.app._.data, "data",
            
            // based on updatedLinkCode, load new observations
            function(updatedDataHash){
                        
                DataCube_Observation.loadAll(
                    self.app._.backend.modelUrl, updatedDataHash, self.app._.backend.url,
                    function(newEntities){
                        
                        // save new observations
                        self.app._.backend.retrievedObservations = newEntities;
                        
                        callback();
                    }
                );
                
                self.app._.backend.dataHash = updatedDataHash;
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
        this.app._.backend.retrievedObservations = updatedRetrievedObservations;
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
        this.triggerGlobalEvent("onBeforeRender_component");
        
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
            if (false === _.isUndefined(selectedComponentDimensions)) {
                selectedDimension = selectedComponentDimensions[dimension.__cv_uri];
                dimension.selectedElementCount = _.keys(selectedDimension.__cv_elements).length;
            } else {
                dimension.selectedElementCount = 1;
            }
            
            // set general element count
            dimension.elementCount = _.size(dimension.__cv_elements);
            
            // build html out of template
            componentBox = $(optionTpl(dimension));
            
            // get opener link
            $(componentBox.find(".cubeviz-component-setupComponentOpener").get(0))
                .data("dimension", dimension);
            
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
        CubeViz_View_Helper.attachDialogTo(
            $("#cubeviz-component-dialog"),
            {closeOnEscape: true, showCross: true, width: 500}
        );
        
        /**
         * Delegate events to new items of the template
         */
        this.bindUserInterfaceEvents({         
            "click .cubeviz-component-cancel": 
                this.onClick_cancel,
                
            "click .cubeviz-component-closeAndUpdate": 
                this.onClick_closeAndUpdate,
                
            "click .cubeviz-component-deselectButton": 
                this.onClick_deselectButton,
                
            "click .cubeviz-component-selectAllButton": 
                this.onClick_selectAllButton,
                
            "click .cubeviz-component-setupComponentOpener": 
                this.onClick_setupComponentOpener,
            
            "click .cubeviz-component-sortButtons": 
                this.onClick_sortButton,
            
            "click #cubeviz-component-questionMark": 
                this.onClick_questionmark
        });
        
        this.triggerGlobalEvent("onAfterRender_component");
        
        return this;
    }
}
