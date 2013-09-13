/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_DataselectionModule_Attribute extends CubeViz_View_Abstract 
{        
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CubeVizModule_Attribute", attachedTo, app);
        
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
    public destroy () : CubeViz_View_Abstract
    {
        super.destroy();
        
        $("#cubeviz-attribute-dialogOpener").off();
        
        CubeViz_View_Helper.destroyDialog($("#cubeviz-dataSelectionModule-dialog-attribute"));
        
        $("#cubeviz-dataSelectionModule-dialog-attribute").remove();
        
        return this;
    }
    
    /**
     * 
     */
    public initialize() : void 
    {
        // save given elements
        this.collection.reset("__cv_uri");
        this.collection.addList(this.app._.data.components.attributes);
        
        this.render();
    }
    
    /**
     *
     */
    public onChange_selectedDS(event) : void 
    {
        var self = this;
        
        /**
         * Load attributes
         */
        DataCube_Component.loadAllAttributes(
        
            this.app._.backend.url,
            this.app._.backend.serviceUrl,
            this.app._.backend.modelUrl,
            this.app._.data.selectedDSD.__cv_uri,
            this.app._.data.selectedDS.__cv_uri,
            
            function(entries) {
                // set attributes
                self.app._.data.components.attributes = entries;
                
                if (0 === _.keys(entries).length) {
                    // no attribute in the selectedDSD
                } else { // 0 < _.keys(entries)
                    self.app._.data.selectedComponents.attribute = entries[_.keys(entries)[0]];
                }
                
                // rebuild dialog
                self
                    .destroy()
                    .initialize();
            }
        );
    }
    
    /**
     *
     */
    public onClick_closeAndUpdate(event) : void 
    {
        var dialogDiv:any = $(event.target).data("dialogDiv"),
            attributes:CubeViz_Collection = new CubeViz_Collection("__cv_uri"),
            attributeUri = $("input[name=cubeviz-dataSelectionModule-attributeRadio]:checked").val(),
            selectedAttribute:any = null,
            self = this;
            
        // Start handling of new configuration, but before start, show a spinner 
        // to let the user know that CubeViz did something.    
        CubeViz_View_Helper.showCloseAndUpdateSpinner(dialogDiv);
        
        // show spinner
        CubeViz_View_Helper.showLeftSidebarSpinner();
        
        // no attribute was selected
        if ("noAttribute" == attributeUri) {
            
            // update selected attribute
            this.app._.data.selectedComponents.attribute = null;  
            
            // set new attribute label
            $("#cubeviz-attribute-label").html(_.str.prune(
                $("#cubeviz-dataSelectionModule-tra-attributeDialogNoAttributeSelectedLabel").html(), 
                24, ".."
            )).attr ("title", $("#cubeviz-dataSelectionModule-tra-attributeDialogNoAttributeSelectedLabel").html());
            
            // set attribute description
            $("#cubeviz-attribute-description").html(
                _.str.prune (
                    $("#cubeviz-dataSelectionModule-tra-attributeDialogNoAttributeSelectedDescription").html(),
                    55,
                    ".."
                )
            ).attr ("title", $("#cubeviz-dataSelectionModule-tra-attributeDialogNoAttributeSelectedDescription").html());
            
        
        // one attribute was selected
        } else {
            
            // get attribute with given uri
            selectedAttribute = attributes
                .addList(this.app._.data.components.attributes)
                .get(attributeUri);
                
            // update selected attribute
            this.app._.data.selectedComponents.attribute = selectedAttribute;            
            
            // output new attribute label
            $("#cubeviz-attribute-label").html(_.str.prune(
                selectedAttribute.__cv_niceLabel, 24, ".."
            ));
        }
        
        // close dialog
        CubeViz_View_Helper.hideCloseAndUpdateSpinner(dialogDiv);
        
        // if only module was loaded, move reloading stuff to footer.ts
        CubeViz_View_Helper.closeDialog(dialogDiv);
        
        this.app._.backend.dataHash = CryptoJS.MD5(JSON.stringify(this.app._.data))+"";
        
        // update link code        
        CubeViz_ConfigurationLink.saveData(
            this.app._.backend.url, this.app._.backend.serviceUrl, this.app._.backend.modelUrl, 
            this.app._.backend.dataHash, this.app._.data, function(){
                        
                // load new observations
                DataCube_Observation.loadAll(
                    self.app._.backend.url, self.app._.backend.serviceUrl, 
                    self.app._.backend.modelUrl, self.app._.backend.dataHash, "",
                    function(newEntities){
                        
                        // save new observations
                        self.app._.data.retrievedObservations = newEntities;
                                                
                        // trigger events
                        self.triggerGlobalEvent("onChange_selectedAttribute");
                        self.triggerGlobalEvent("onReRender_visualization");
                        
                        CubeViz_View_Helper.hideLeftSidebarSpinner();
                    }
                );
            }
        );
    }
    
    /**
     *
     */
    public onClick_dialogOpener(event) : void 
    {
        // select that entry which fits to selectedDS, because if you select an
        // element in the dialog but cancel it, the HTML remembers your selection
        // and after re-open it, you will see your last selection
        var elementList = $($("#cubeviz-dataSelectionModule-dialog-attribute")
                          .find(".cubeviz-dataSelectionModule-dialogElements").get(0)).children(),
            self = this;
        
        // go through all elements and select the selectedAttribute
        if ( false === _.isUndefined(this.app._.data.selectedComponents.attribute)
             && false === _.isNull(this.app._.data.selectedComponents.attribute)) {
         
            _.each(elementList, function(element){
                if(self.app._.data.selectedComponents.attribute.__cv_uri == $($(element).children().first()).val()) {
                    $($(element).children().first()).attr ("checked", true);
                }
            });
        }
        
        // open dialog
        CubeViz_View_Helper.openDialog($("#cubeviz-dataSelectionModule-dialog-attribute"));
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
                __cv_id: "attributeAndMeasure",
                __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-attributeAndMeasureHelpDialogTitle").html(), 
                __cv_description: $("#cubeviz-dataSelectionModule-tra-attributeAndMeasureHelpDialogDescription").html()
            }
        ));
        
        var dialogDiv = $("#cubeviz-dataSelectionModule-helpDialog-attributeAndMeasure");
        
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
    public onStart_application() 
    {
        this.initialize();
    }
    
    /**
     * 
     */
    public render() : CubeViz_View_Abstract
    {
        this.triggerGlobalEvent("onBeforeRender_attribute");
        var noAttribute = false;
        
        
        /**
         * check if attribute label is set
         */
        var label = "",
            description = "";
        
        // no attributes available
        if (0 === _.size(this.app._.data.components.attributes)) {
            label = "[no attribute found]";
            noAttribute = true;
            
            // hide attribute block
            $("#cubeviz-dataSelectionModule-attributeBlock").hide();
            
        // attributes available, no attribute selected (yet)
        } else if (0 < _.size(this.app._.data.components.attributes)
                   && ( true === _.isUndefined(this.app._.data.selectedComponents.attribute)
                        || true === _.isNull(this.app._.data.selectedComponents.attribute))) {
            
            label = $("#cubeviz-dataSelectionModule-tra-attributeDialogNoAttributeSelectedLabel").html();
            description = $("#cubeviz-dataSelectionModule-tra-attributeDialogNoAttributeSelectedDescription").html();
            
        // attributes available and one attribute selected
        } else {
            label = this.app._.data.selectedComponents.attribute.__cv_niceLabel;
            description = this.app._.data.selectedComponents.attribute.__cv_description; 
        }
        
        // set label directly
        $("#cubeviz-attribute-label").html(
            _.str.prune (
                label,
                24,
                ".."
            )
        ).attr ("title", label);
        
        
        // set description directly
        $("#cubeviz-attribute-description").html(
            _.str.prune (
                description,
                55,
                ".."
            )
        ).attr ("title", description);
        
        
        /**
         * Dialog
         */
        // if attributes are available ...
        if (false === noAttribute) {

            if (0 == _.size(this.app._.data.components.attributes)) {
                
                $("#cubeviz-attribute-dialogOpener").hide();
                
            // there are at least 2 attributes to choose
            } else {
            
                // set dialog reference and template
                $("#cubeviz-dataSelectionModule-dialogContainer").append(CubeViz_View_Helper.tplReplace(
                    $("#cubeviz-dataSelectionModule-tpl-dialog").html(),
                    {
                        __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-attributeDialogTitle").html(), 
                        __cv_hashedUri: "attribute",
                        __cv_description: "",
                        __cv_shortDescription: $("#cubeviz-dataSelectionModule-tra-attributeDialogDescription").html(),
                        __cv_title: ""
                    }
                ));
                
                var dialogDiv = $("#cubeviz-dataSelectionModule-dialog-attribute");
                
                // setup jquery dialog
                CubeViz_View_Helper.attachDialogTo(
                    dialogDiv,
                    {closeOnEscape: true, showCross: true, width: 650}
                );
                
                // hide description div in dialog
                $(dialogDiv.find(".cubeviz-dataSelectionModule-dialog-description").get(0))
                    .hide();
                
                // hide a couple of buttons
                $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons").get(0)).hide();
                $(dialogDiv.find(".cubeviz-dataSelectionModule-selectAllButton").get(0)).hide();
                $(dialogDiv.find(".cubeviz-dataSelectionModule-deselectButton").get(0)).hide();
                
                // attach dialog div to dialog opener link
                $("#cubeviz-attribute-dialogOpener").data("dialogDiv", dialogDiv);
                
                // attach dialog div to "cancel" button
                $($(dialogDiv.find(".cubeviz-dataSelectionModule-cancelBtn")).get(0))
                    .data("dialogDiv", dialogDiv);
                    
                // attach dialog div to "close and update" button
                $($(dialogDiv.find(".cubeviz-dataSelectionModule-closeAndUpdateBtn")).get(0))
                    .data("dialogDiv", dialogDiv)
                    .on("click", $.proxy(this.onClick_closeAndUpdate, this));
                    
                    
                /**
                 * Sort buttons
                 */
                // attach dialog div to "alphabet" button
                $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(0))
                    .data("dialogDiv", dialogDiv)
                    .data("type", "alphabet");
                    
                // attach dialog div to "check status" button
                $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(1))
                    .hide();
                    
                // attach dialog div to "observation count" button
                $($(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons")).children().get(2))
                    .hide();
                
                
                /**
                 * Fill in elements
                 */
                var attributeElements:CubeViz_Collection = new CubeViz_Collection("__cv_uri"),
                    elementContainer = null,
                    elementList = $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogElements")[0]);
                
                elementContainer = $(CubeViz_View_Helper.tplReplace(
                    $("#cubeviz-dataSelectionModule-tpl-dialogRadioElement").html(),
                    {
                        __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-attributeDialogNoAttributeSelectionElement").html(),
                        __cv_uri: "__cv_noAttribute",
                        radioCSSClass: "cubeviz-dataSelectionModule-attributeRadio",
                        radioName: "cubeviz-dataSelectionModule-attributeRadio",
                        radioValue: "noAttribute"
                    }
                ));
                
                // style first element (no attribute selection)
                $(elementContainer.children().last()).css ("font-weight", "bold");           
                
                // select first element, if no attribute was selected before
                if (true === _.isUndefined(this.app._.data.selectedComponents.attribute)
                     || true === _.isNull(this.app._.data.selectedComponents.attribute)) {
                    $(elementContainer.children().first()).attr ("checked", true);
                }
                
                elementList.append (elementContainer);
                
                attributeElements
                    
                    // add elements of current component
                    .addList(this.app._.data.components.attributes)
                    
                    // sort
                    .sortAscendingBy("__cv_niceLabel")
                    
                    // Go through all elements of the given list ..
                    .each(function(element){
                        
                        elementContainer = $(CubeViz_View_Helper.tplReplace(
                            $("#cubeviz-dataSelectionModule-tpl-dialogRadioElement").html(),
                            {
                                __cv_niceLabel: element.__cv_niceLabel,
                                __cv_uri: element.__cv_uri,
                                radioCSSClass: "cubeviz-dataSelectionModule-attributeRadio",
                                radioName: "cubeviz-dataSelectionModule-attributeRadio",
                                radioValue: element.__cv_uri
                            }
                        ));
                        
                        // ... and add list entries with radio button and label
                        elementList.append(elementContainer);
                        
                    });
                
                /**
                 * Delegate events to new items of the template
                 */
                this.bindUserInterfaceEvents({
                    "click #cubeviz-attribute-dialogOpener": this.onClick_dialogOpener
                });
                
                $("#cubeviz-attribute-dialogOpener").show();
            }
            
        // if no attribute is available ...
        } else {
            $("#cubeviz-attribute-dialogOpener").hide();
        }
        
        this.triggerGlobalEvent("onAfterRender_attribute");
        
        this.bindUserInterfaceEvents({
            "click #cubeviz-attributeAndMeasure-questionmark": this.onClick_questionmark
        });
        
        return this;
    }
}
