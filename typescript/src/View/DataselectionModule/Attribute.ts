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
        DataCube_Attribute.loadAll(
        
            this.app._.backend.url,
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
        
        // get attribute with given uri
        selectedAttribute = attributes
            .addList(this.app._.data.components.attributes)
            .get(attributeUri);
            
        // update selected attribute
        this.app._.data.selectedComponents.attribute = selectedAttribute;

        // close dialog
        CubeViz_View_Helper.hideCloseAndUpdateSpinner(dialogDiv);
        
        // if only module was loaded, move reloading stuff to footer.ts
        CubeViz_View_Helper.closeDialog(dialogDiv);
        
        // output new attribute label
        $("#cubeviz-attribute-label").html(_.str.prune(
            selectedAttribute.__cv_niceLabel, 24, ".."
        ));

        // trigger event
        this.triggerGlobalEvent("onChange_selectedAttribute");
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

        // TODO how handle the case if there are no attributes

        // if its just one in the list, select it directly
        if (1 == elementList.length) {
            $($(elementList.first()).children().first()).attr ("checked", true);
        
        // go through all elements and select the selectedAttribute
        } else {
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
        
        if (true === _.isUndefined(this.app._.data.selectedComponents.attribute)
            || true === _.isNull(this.app._.data.selectedComponents.attribute)) {
            label = "[no attribute found]";
            noAttribute = true;
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
        // if attribute is available ...
        if (false === noAttribute) {

            if (1 == _.size(this.app._.data.components.attributes)) {
                
                $("#cubeviz-attribute-dialogOpener").hide();
                
            } else {
            
                // set dialog reference and template
                $("#cubeviz-dataSelectionModule-dialogContainer").append(CubeViz_View_Helper.tplReplace(
                    $("#cubeviz-dataSelectionModule-tpl-dialog").html(),
                    {
                        __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-attributeDialog").html(), 
                        __cv_hashedUri: "attribute",
                        __cv_description: this.app._.data.selectedComponents.attribute.__cv_description,
                        shortDescription: _.str.prune(this.app._.data.selectedComponents.attribute.__cv_description, 400, "..")
                    }
                ));
                
                var dialogDiv = $("#cubeviz-dataSelectionModule-dialog-attribute");
                
                // setup jquery dialog
                CubeViz_View_Helper.attachDialogTo(
                    dialogDiv,
                    {closeOnEscape: true, showCross: true, width: 650}
                );
                
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
        
        return this;
    }
    
    /**
     * Show a spinner to let the user know that something is working.
     * @return void
     */
    public showSpinner() : void
    {        
        $("#cubeviz-module-dataSelection").slideUp("slow", function(){
            $("#cubeviz-module-spinner").slideDown("slow");
        });
    }
}
