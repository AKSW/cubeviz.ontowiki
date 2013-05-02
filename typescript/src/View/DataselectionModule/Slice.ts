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
    public onClick_closeAndUpdate(event) : void 
    {
        throw "No onClick_closeAndUpdate for Slice implemented!";
    }
    
    /**
     *
     */
    public onClick_dialogOpener(event) : void 
    {        
        // open dialog
        CubeViz_View_Helper.openDialog($("#cubeviz-dataSelectionModule-dialog-slice"));
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
                __cv_id: "slice",
                __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-sliceHelpDialogTitle").html(), 
                __cv_description: $("#cubeviz-dataSelectionModule-tra-sliceHelpDialogDescription").html()
            }
        ));
        
        var dialogDiv = $("#cubeviz-dataSelectionModule-helpDialog-slice");
        
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
        this.triggerGlobalEvent("onBeforeRender_slice");
        
        /**
         * check if slice label and description are setable
         */
        var label = "",
            description = "";
        
        // no slices are available
        if (0 === _.size(this.app._.data.slices)) {
        
            $("#cubeviz-dataSelectionModule-sliceBlock").hide();
        
        // there are at least one slice key / slice available
        } else {
            
            $("#cubeviz-dataSelectionModule-sliceBlock").show();
            
            // slices are available, but no slice was selected
            if (0 === _.keys(this.app._.data.selectedSlice).length) {
                label = "[No DataSet filter was selected yet]"; // TODO: translate
                
            // slices are available and there is one selected
            } else {
                label = this.app._.data.selectedComponents.attribute.__cv_niceLabel;
                description = this.app._.data.selectedComponents.attribute.__cv_description; 
            }
            
            // set dialog reference and template
            $("#cubeviz-dataSelectionModule-dialogContainer").append(CubeViz_View_Helper.tplReplace(
                $("#cubeviz-dataSelectionModule-tpl-dialog").html(),
                {
                    __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-sliceDialogTitle").html(), 
                    __cv_hashedUri: "slice",
                    __cv_description: "",
                    shortDescription: $("#cubeviz-dataSelectionModule-tra-sliceDialogDescription").html(),
                    __cv_title: ""
                }
            ));
            
            var dialogDiv = $("#cubeviz-dataSelectionModule-dialog-slice");
            
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
            $("#cubeviz-slice-dialogOpener").data("dialogDiv", dialogDiv);
            
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
            
            
            // add element, which is not a slice but if you choose it, you tell CubeViz
            // not to use any slice for now
            var elementContainer = null,
                elementList = $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogElements")[0]);
            
            elementContainer = $(CubeViz_View_Helper.tplReplace(
                $("#cubeviz-dataSelectionModule-tpl-dialogRadioElement").html(),
                {
                    __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-sliceDialogNoSliceSelectionElement").html(),
                    __cv_uri: "__cv_noSlice",
                    radioCSSClass: "cubeviz-dataSelectionModule-sliceRadio",
                    radioName: "cubeviz-dataSelectionModule-sliceRadio",
                    radioValue: "true"
                }
            ));
            
            // style first element
            $(elementContainer.children().last())
                .css ("font-weight", "bold");
            
            elementList.append (elementContainer);
            
            
            // ... and add list entries with radio button and label
            this.collection
                
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
                "click #cubeviz-slice-dialogOpener": this.onClick_dialogOpener
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
        
        this.bindUserInterfaceEvents({
            "click #cubeviz-slice-questionmark": this.onClick_questionmark
        });
        
        return this;
    }
}
