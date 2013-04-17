/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_DataselectionModule_Slice extends CubeViz_View_Abstract 
{        
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CubeVizModule_Slice", attachedTo, app);
        
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
        
        return this;
    }
    
    /**
     * 
     */
    public initialize() : void 
    {
        // save given elements
        this.collection.reset("__cv_uri");
        this.collection.addList(this.app._.data.slices);
        
        this.render();
    }
    
    /**
     *
     */
    public onChange_selectedDS() 
    {
        throw "No onChange_selectedDS for Slice implemented!";
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
        console.log("");
        console.log("slices");
        console.log(this.app._.data.slices);
        console.log(this.app._.data.selectedSlices);
        
        this.triggerGlobalEvent("onBeforeRender_slice");
        
        
        /**
         * check if slice label and description are setable
         */
        var label = "",
            description = "";
        
        // no slices are available
        if (0 === _.size(this.app._.data.slices)) {
            label = "[no slices found]";
        
        // there are at least one slice key / slice available
        } else {
            
            // slices are available, but no slice was selected
            if (0 === _.keys(this.app._.data.selectedSlice).length) {
                label = "[No DataSet filter was selected yet]";
                
            // slices are available and there is one selected
            } else {
                label = this.app._.data.selectedComponents.attribute.__cv_niceLabel;
                description = this.app._.data.selectedComponents.attribute.__cv_description; 
            }
            
            // set dialog reference and template
            $("#cubeviz-dataSelectionModule-dialogContainer").append(CubeViz_View_Helper.tplReplace(
                $("#cubeviz-dataSelectionModule-tpl-dialog").html(),
                {
                    __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-attributeDialog").html(), 
                    __cv_hashedUri: "attribute"
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
                .addList(this.app._.data.components.slices)
                
                // sort
                .sortAscendingBy("__cv_niceLabel")
                
                // Go through all elements of the given list ..
                .each(function(element){
                    
                    elementContainer = $(CubeViz_View_Helper.tplReplace(
                        $("#cubeviz-dataSelectionModule-tpl-dialogRadioElement").html(),
                        {
                            __cv_niceLabel: element.__cv_niceLabel,
                            __cv_uri: element.__cv_uri,
                            radioCSSClass: "cubeviz-dataSelectionModule-sliceRadio",
                            radioName: "cubeviz-dataSelectionModule-sliceRadio",
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
        }
        
        // set label directly
        $("#cubeviz-slice-label").html(
            _.str.prune (
                label,
                24,
                ".."
            )
        ).attr ("title", label);
        
        // set description directly
        $("#cubeviz-slice-description").html(
            _.str.prune (
                description,
                55,
                ".."
            )
        ).attr ("title", description);
        
        this.triggerGlobalEvent("onAfterRender_slice");
        
        return this;
    }
}
