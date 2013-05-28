/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_DataselectionModule_Component extends CubeViz_View_Abstract 
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
                name:    "onStart_application",
                handler: this.onStart_application
            },
            {
                name:    "onChange_selectedDS",
                handler: this.onChange_selectedDS
            },
            {
                name:    "onChange_selectedSlice",
                handler: this.onChange_selectedSlice
            }
        ]); 
    }
    
    /**
     *
     */
    public configureSetupComponentDialog(component:any, componentBox, opener) 
    {
        var self = this;

        // set dialog reference and template
        $("#cubeviz-dataSelectionModule-dialogContainer").append(CubeViz_View_Helper.tplReplace(
            $("#cubeviz-dataSelectionModule-tpl-dialog").html(),
            {
                __cv_niceLabel: component.__cv_niceLabel, 
                __cv_hashedUri: component.__cv_hashedUri,
                __cv_description: component.__cv_description,
                __cv_shortDescription: $("#cubeviz-dataSelectionModule-tra-componentDialogDescription").html(),
                __cv_title: $("#cubeviz-dataSelectionModule-tra-componentDialogMainTitle").html()
            }
        ));
        
        var dialogDiv = $("#cubeviz-dataSelectionModule-dialog-" + component.__cv_hashedUri);
        
        // if no description for the component dimension was given, hide related area
        if (true == _.str.isBlank(component.__cv_description)) {
            // hide description div in dialog
            $(dialogDiv.find(".cubeviz-dataSelectionModule-dialog-description").get(0))
                .hide();
        }
        
        dialogDiv
            .data("componentBox", componentBox)
            .data("component", component);
        
        // attach dialog to dialogDiv element
        CubeViz_View_Helper.attachDialogTo(dialogDiv);
        
        // attach dialog dialogDiv to deselect button
        $(dialogDiv.find(".cubeviz-dataSelectionModule-selectAllButton").get(0))
            .data("dialogDiv", dialogDiv);
        
        // attach dialog dialogDiv to deselect button
        $(dialogDiv.find(".cubeviz-dataSelectionModule-deselectButton").get(0))
            .data("dialogDiv", dialogDiv);
        
        // attach dialog dialogDiv to dialog opener link
        opener.data("dialogDiv", dialogDiv);
        
        // attach dialog dialogDiv to "cancel" button
        $($(dialogDiv.find(".cubeviz-dataSelectionModule-cancelBtn")).get(0))
            .data("dialogDiv", dialogDiv);
            
        // attach dialog dialogDiv to "close and update" button
        $($(dialogDiv.find(".cubeviz-dataSelectionModule-closeAndUpdateBtn")).get(0))
            .data("dialogDiv", dialogDiv)
            .on("click", $.proxy(this.onClick_closeAndUpdate, this));
            
        /**
         * Sort buttons
         */
        // attach dialog dialogDiv to "alphabet" button
        $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(0))
            .data("dialogDiv", dialogDiv)
            .data("type", "alphabet");
            
        // attach dialog dialogDiv to "check status" button
        $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(1))
            .data("dialogDiv", dialogDiv)
            .data("type", "check status");
            
        // attach dialog dialogDiv to "observation count" button
        $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(2))
            .data("dialogDiv", dialogDiv)
            .data("type", "observation count");
            
        // configure elements of the dialog
        this.configureSetupComponentElements(component);
    }
    
    /**
     *
     */
    public configureSetupComponentElements(component:any) 
    {
        var checkbox:any = null,
            dialogDiv = $("#cubeviz-dataSelectionModule-dialog-" + component.__cv_hashedUri),
            elementInstance:any = {},
            componentElements:CubeViz_Collection = new CubeViz_Collection("__cv_uri"),
            elementList = $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogElements")[0]),
            selectedDimensions:any = this.app._.data.selectedComponents
                                                 .dimensions[component.__cv_uri]
                                                 .__cv_elements,
            self = this,
            setElementChecked = null,
            wasSomethingSelected:bool = false;
            
        componentElements
            
            // add elements of current component
            .addList(component.__cv_elements)
            
            // sort
            .sortAscendingBy("__cv_niceLabel")
        
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
                    
                // fill template with life
                elementInstance = $(CubeViz_View_Helper.tplReplace(
                    $("#cubeviz-dataSelectionModule-tpl-dialogCheckboxElement").html(),
                    {
                        __cv_niceLabel: element.__cv_niceLabel,
                        __cv_uri: element.__cv_uri,
                        __cv_uri2: element.__cv_uri
                    }
                ));
                
                checkbox = elementInstance.children().first();
                
                if(true == setElementChecked) {
                    checkbox.attr("checked", true);
                }
                
                // set click event                
                $(checkbox ).on("click", $.proxy(
                    self.onClick_dimensionElementCheckbox, 
                    self
                ));
                
                // save element instance
                elementInstance
                    .data("data", element)
                    .data("dialogDiv", dialogDiv);
                
                // ... add new item to element list
                elementList.append(elementInstance);
            });
    }
    
    /**
     *
     */
    public destroy() : CubeViz_View_Abstract
    { 
        _.each(this.collection._, function(component){
            // set dialog to initial state
            $("#cubeviz-dataSelectionModule-dialog-" + component.__cv_hashedUri)
                .dialog("destroy");
            $("#cubeviz-dataSelectionModule-dialog-" + component.__cv_hashedUri)
                .remove();
        });
        
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
     *
     */
    public onChange_selectedDS(event, data) 
    {        
        var self = this;
        
        this.destroy();
        
        // load dimensional data
        this.loadComponentDimensions(function(){
            
            // update link code        
            CubeViz_ConfigurationLink.save(
                self.app._.backend.url, self.app._.data, "data",
            
                // based on updatedLinkCode, load new observations
                function(updatedDataHash){
                    
                    self.app._.backend.dataHash = updatedDataHash;
                    
                    self.render();
                    
                    CubeViz_View_Helper.hideLeftSidebarSpinner();
                }
            );
        });
    }
    
    /**
     * If a slice was selected, all component elements has to be adapted according
     * to the fixed dimension elements of the slice.
     */
    public onChange_selectedSlice(event) : void 
    {
        // no slice was selected
        if (0 === _.size(this.app._.data.selectedSlice)) {
            
        // slice selected
        } else {
            var componentBox = null,
                dialogDiv = null,
                dimensionRelation = "",
                fixedDimensionElement = "",
                self = this;
            
            // go through all component dimensions
            _.each(this.app._.data.components.dimensions, function(dimension){
                
                /**
                 * Check if current dimension has a relation to a dimension
                 * which is part of the selected slice
                 */
                // e.g.: http://example.cubeviz.org/cubeWithMaterializedSlices/properties/geo
                dimensionRelation = dimension ["http://purl.org/linked-data/cube#dimension"];
                
                fixedDimensionElement = self.app._.data.selectedSlice [dimensionRelation];
                 
                // if slice has that relation
                if (false === _.str.isBlank(fixedDimensionElement)) {
                    
                    _.each(dimension.__cv_elements, function(element){
                        
                        if (element.__cv_uri == fixedDimensionElement) {
                            // set fixed element as the only element of the selected dimension
                            self.app._.data.selectedComponents.dimensions[dimension.__cv_uri].__cv_elements = { 0: element };
                        }
                    });
                }
            });
                
            // update number of X dimensions
            this.app._.data.numberOfMultipleDimensions = _.size(CubeViz_Visualization_Controller.
                getMultipleDimensions (this.app._.data.selectedComponents.dimensions));
            this.app._.data.numberOfOneElementDimensions = _.size(CubeViz_Visualization_Controller.
                getOneElementDimensions (this.app._.data.selectedComponents.dimensions));
            
            // rebuild all dialogs based on the fixed set of dimension elements
            this
                .destroy()
                .initialize();
        }
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
     *
     */
    public onClick_dimensionElementCheckbox(event) : void 
    {
        var clickedCheckbox = $(event.target),
            parentContainer = $($(event.target).parent()),
            dialogCheckboxList = parentContainer.data("dialogDiv").find("[type=\"checkbox\"]"),
            anythingChecked = false,
            numberOfSelectedElements = $(parentContainer.data("dialogDiv"))
                .data("component")
                .__cv_selectedElementCount;
            
        if (1 < numberOfSelectedElements
            || 1 == this.app._.data.numberOfMultipleDimensions) {
            return;
        }
            
        // check if anything was checked before
        _.each(dialogCheckboxList, function(checkbox){
            if($(checkbox).attr("checked")) {
                anythingChecked = true;
            }
        });        
        
        // enable all checkboxes, if no checkbox is checked
        if (false == anythingChecked) {
            _.each(dialogCheckboxList, function(checkbox){
                $(checkbox).attr("disabled", false);
            });
            
            // activate both select buttons
            $(parentContainer.data("dialogDiv").find(".cubeviz-dataSelectionModule-selectAllButton").get(0))
                .attr("disabled", false).removeClass("ui-state-disabled");
            $(parentContainer.data("dialogDiv").find(".cubeviz-dataSelectionModule-deselectButton").get(0))
                .attr("disabled", false).removeClass("ui-state-disabled");
        }
        
        // disable all checkboxes, if there are already two multiple dimensions
        // and this dialog is not one of these
        else {
            _.each(dialogCheckboxList, function(checkbox){
                if(!$(checkbox).attr("checked")) {
                    $(checkbox).attr("disabled", true);
                }
            });
            
            // deactivate both select buttons
            $(parentContainer.data("dialogDiv").find(".cubeviz-dataSelectionModule-selectAllButton").get(0))
                .attr("disabled", true).addClass("ui-state-disabled");
            $(parentContainer.data("dialogDiv").find(".cubeviz-dataSelectionModule-deselectButton").get(0))
                .attr("disabled", true).addClass("ui-state-disabled");
        }
    }
    
    /**
     * Apply changes, update data and close dialog
     * @param event Event targets to clicked button
     */
    public onClick_closeAndUpdate(event) : void
    {
        var dialogDiv = $(event.target).data("dialogDiv"),
            self = this;
        
        // Start handling of new configuration, but before start, show a spinner 
        // to let the user know that CubeViz did something.    
        CubeViz_View_Helper.showCloseAndUpdateSpinner(dialogDiv);

        // save changes in dialog div
        this.readAndSaveSetupComponentDialogChanges(dialogDiv,
            function(){
                    
                // if module + indexAction stuff was loaded
                if(true === cubeVizApp._.backend.uiParts.index.isLoaded) {                    
                    self.triggerGlobalEvent("onReRender_visualization");
                }
                
                self.triggerGlobalEvent("onUpdate_componentDimensions");
                
                CubeViz_View_Helper.hideCloseAndUpdateSpinner(dialogDiv);
                
                // if only module was loaded, move reloading stuff to footer.ts
                CubeViz_View_Helper.closeDialog(dialogDiv);            
            }
        );        
    }
    
    /**
     *
     */
    public onClick_deselectButton(event) : void
    {
        if ("false" == $(event.target).attr("disabled")
            || true === _.isUndefined($(event.target).attr("disabled"))) {
            $(event.target).data("dialogDiv")
                .find("[type=\"checkbox\"]")
                .attr("checked", false);
        }
    }
    
    /**
     *
     */
    public onClick_selectAllButton(event) : void
    {
        if ("false" == $(event.target).attr("disabled")
            || true === _.isUndefined($(event.target).attr("disabled"))) {
            $(event.target).data("dialogDiv")
                .find("[type=\"checkbox\"]")
                .attr("checked", true);
        }
    }
    
    /**
     *
     */
    public onClick_setupComponentOpener(event) : void
    {
        this.triggerGlobalEvent("onClick_setupComponentOpener");
        
        // get number of selected elements in the associated dialog div
        var numberOfSelectedElements = $($(event.target).data("dialogDiv"))
            .data("component")
            .__cv_selectedElementCount;
        
        var checkboxes = $(event.target).data("dialogDiv").find("[type=\"checkbox\"]");
        
        // if there are already two multiple dimensions and if the dialog is not
        // associated to one of the multiple dimensions, deactivate all unchecked 
        // checkboxes in the dialog
        if ( 1 == numberOfSelectedElements 
             && 2 == this.app._.data.numberOfMultipleDimensions
             && 2 < _.size(this.app._.data.components.dimensions)) {
            
            // deactivate all unchecked checkboxes
            _.each(checkboxes, function(checkbox){
                if(!$(checkbox).attr("checked")) {
                    $(checkbox).attr("disabled", true);
                }
            });
            
            // deactivate both select buttons
            $($(event.target).data("dialogDiv").find(".cubeviz-dataSelectionModule-selectAllButton").get(0))
                .attr("disabled", true).addClass("ui-state-disabled");
            $($(event.target).data("dialogDiv").find(".cubeviz-dataSelectionModule-deselectButton").get(0))
                .attr("disabled", true).addClass("ui-state-disabled");
        
        // just in case that all checkboxes were deactivated before, reactivate them!
        } else {
            // reactivate all checkboxes checkboxes
            _.each(checkboxes, function(checkbox){
                $(checkbox).attr("disabled", false);
            });
            
            // reactivate both select buttons
            $($(event.target).data("dialogDiv").find(".cubeviz-dataSelectionModule-selectAllButton").get(0))
                .attr("disabled", false).removeClass("ui-state-disabled");
            $($(event.target).data("dialogDiv").find(".cubeviz-dataSelectionModule-deselectButton").get(0))
                .attr("disabled", false).removeClass("ui-state-disabled");
        }
        
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
            list:any = $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogElements").first()),
            listItems:any[] = list.children('li'),
            modifiedItemList:any[] = [];
        
        // remove cubeviz-dataSelectionModule-dialogSortButtons from all sortButtons
        $(event.target).data("dialogDiv").find(".cubeviz-component-sortButton")
            .removeClass("cubeviz-dataSelectionModule-dialogSortButtonSelected");
        
        // add selected class to current clicked button
        $(event.target)
            .addClass("cubeviz-dataSelectionModule-dialogSortButtonSelected");
    
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
    public onClick_questionmark(event) : void 
    {
        // set dialog reference and template
        $("#cubeviz-dataSelectionModule-dialogContainer").append(CubeViz_View_Helper.tplReplace(
            $("#cubeviz-dataSelectionModule-tpl-helpDialog").html(),
            {
                __cv_id: "component",
                __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-componentHelpDialogTitle").html(), 
                __cv_description: $("#cubeviz-dataSelectionModule-tra-componentHelpDialogDescription").html()
            }
        ));
        
        var dialogDiv = $("#cubeviz-dataSelectionModule-helpDialog-component");
        
        // setup jquery dialog
        CubeViz_View_Helper.attachDialogTo(
            dialogDiv,
            {closeOnEscape: true, showCross: true, width: 500}
        );
        
        // open dialog
        CubeViz_View_Helper.openDialog(dialogDiv);
    }
    
    /**
     *
     */
    public readAndSaveSetupComponentDialogChanges(dialogDiv, callback) : void
    {        
        // extract and set necessary elements and data
        var elementList = dialogDiv.find(".cubeviz-dataSelectionModule-dialogElements").children(),
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
        
        // save updated element list
        this.app._.data.selectedComponents.dimensions[component.__cv_uri]
            .__cv_elements = selectedElements.toObject();
                
        // Update selected elements counter
        $(componentBox.find(".cubeviz-component-selectedCount").get(0)).html(
            selectedElements.size()
        );
        
        // save new number of selected elements
        dialogDiv.data("component").__cv_selectedElementCount = selectedElements.size();
        
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
                dimension.__cv_selectedElementCount = _.keys(selectedDimension.__cv_elements).length;
            } else {
                dimension.__cv_selectedElementCount = 1;
            }
            
            // set general element count
            dimension.__cv_elementCount = _.size(dimension.__cv_elements);
            
            // short label to prevent use two instead of one lines
            dimension.__cv_shortLabel = _.str.prune(dimension.__cv_niceLabel, 23, "..");
            
            // short description
            dimension.__cv_shortDescription = _.str.prune(dimension.__cv_description, 38, "..");
            
            // build html out of template
            componentBox = $(CubeViz_View_Helper.tplReplace(
                $("#cubeviz-component-tpl-listBoxItem").html(),
                dimension
            ));
            
            // hide if component dimension contains only one element
            if (1 === dimension.__cv_elementCount) {
                // hide dialog opener
                $(componentBox.find(".cubeviz-component-setupComponentOpener").get(0))
                    .hide();
                // hide X selected of Y
                $(componentBox.find(".cubeviz-component-selectedElementsBlock").get(0))
                    .hide();    
            }
            
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
                dimension.__cv_selectedElementCount
            );
            
            self.collection.add(dimension);
        });
        
        /**
         * Delegate events to new items of the template
         */
        this.bindUserInterfaceEvents({       
            
            "click .cubeviz-component-setupComponentOpener": 
                this.onClick_setupComponentOpener,
                
            "click #cubeviz-component-questionmark": 
                this.onClick_questionmark,
              
            "click .cubeviz-dataSelectionModule-cancelBtn": 
                this.onClick_cancel,
                
            "click .cubeviz-dataSelectionModule-deselectButton": 
                this.onClick_deselectButton,
                
            "click .cubeviz-dataSelectionModule-selectAllButton": 
                this.onClick_selectAllButton,
            
            "click .cubeviz-dataSelectionModule-dialogSortButtons": 
                this.onClick_sortButton
        });
        
        this.triggerGlobalEvent("onAfterRender_component");
        
        return this;
    }
}
