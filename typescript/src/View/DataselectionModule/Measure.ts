/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_DataselectionModule_Measure extends CubeViz_View_Abstract 
{        
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CubeVizModule_Measure", attachedTo, app);
        
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
        
        CubeViz_View_Helper.destroyDialog($("#cubeviz-measure-dialog"));
        
        return this;
    }
    
    /**
     * 
     */
    public initialize() : void 
    {
        // save given elements
        this.collection.reset("__cv_uri");
        this.collection.addList(this.app._.data.components.measures);
        
        this.render();
    }
    
    /**
     *
     */
    public onChange_selectedDS(event) : void 
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
                
                if (0 === _.keys(entries).length) {
                    throw new Error ("Error: There are no measures in the selected data set!");
                } else { // 0 < _.keys(entries)
                    self.app._.data.selectedComponents.measure = entries[_.keys(entries)[0]];
                }
            }
        );
    }
    
    /**
     *
     */
    public onClick_closeAndUpdate(event) : void 
    {
        var dialogDiv:any = $(event.target).data("dialogDiv"),
            measures:CubeViz_Collection = new CubeViz_Collection("__cv_uri"),
            measureUri = $("input[name=cubeviz-dataSelectionModule-measureRadio]:checked").val(),
            selectedMeasure:any = null,
            self = this;
            
        // Start handling of new configuration, but before start, show a spinner 
        // to let the user know that CubeViz did something.    
        CubeViz_View_Helper.showCloseAndUpdateSpinner(dialogDiv);
        
        // show spinner
        CubeViz_View_Helper.showLeftSidebarSpinner();
        
        // get measure with given uri
        selectedMeasure = measures
            .addList(this.app._.data.components.measures)
            .get(measureUri);
            
        // update selected measure
        this.app._.data.selectedComponents.measure = selectedMeasure;

        // close dialog
        CubeViz_View_Helper.hideCloseAndUpdateSpinner(dialogDiv);
        
        // if only module was loaded, move reloading stuff to footer.ts
        CubeViz_View_Helper.closeDialog(dialogDiv);
        
        // output new measure label
        $("#cubeviz-measure-label").html(_.str.prune(
            selectedMeasure.__cv_niceLabel, 24, ".."
        ));

        // trigger event
        this.triggerGlobalEvent("onChange_selectedMeasure");
        
        // hide spinner
        CubeViz_View_Helper.hideLeftSidebarSpinner();
    }
    
    /**
     *
     */
    public onClick_dialogOpener(event) : void 
    {
        // select that entry which fits to selectedDS, because if you select an
        // element in the dialog but cancel it, the HTML remembers your selection
        // and after re-open it, you will see your last selection
        var elementList = $($("#cubeviz-dataSelectionModule-dialog-measure")
                        .find(".cubeviz-dataSelectionModule-dialogElements").get(0)).children(),
            self = this;

        // TODO how handle the case if there are no measures

        // if its just one in the list, select it directly
        if (1 == elementList.length) {
            $($(elementList.first()).children().first()).attr ("checked", true);
        
        // go through all elements and select the selectedMeasure
        } else {
            _.each(elementList, function(element){
                if(self.app._.data.selectedComponents.measure.__cv_uri == $($(element).children().first()).val()) {
                    $($(element).children().first()).attr ("checked", true);
                }
            });
        }
        
        // open dialog
        CubeViz_View_Helper.openDialog($("#cubeviz-dataSelectionModule-dialog-measure"));
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
        this.triggerGlobalEvent("onBeforeRender_measure");
        
        // set label directly
        $("#cubeviz-measure-label").html(
            _.str.prune (
                this.app._.data.selectedComponents.measure.__cv_niceLabel,
                24,
                ".."
            )
        ).attr ("title", this.app._.data.selectedComponents.measure.__cv_niceLabel);
        
        // set description directly
        $("#cubeviz-measure-description").html(
            _.str.prune (
                this.app._.data.selectedComponents.measure.__cv_description,
                55,
                ".."
            )
        ).attr ("title", this.app._.data.selectedComponents.measure.__cv_description);
        
        
        // only ONE measure is there
        if (1 == _.keys(this.app._.data.components.measures).length) {
            
            $("#cubeviz-measure-dialogOpener").hide();
            
        // if there are MORE THAN ONE measures
        } else {
        
            /**
             * Dialog
             */         
            // set dialog reference and template
            $("#cubeviz-dataSelectionModule-dialogContainer").append(CubeViz_View_Helper.tplReplace(
                $("#cubeviz-dataSelectionModule-tpl-dialog").html(),
                {
                    __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-measureDialogTitle").html(), 
                    __cv_hashedUri: "measure",
                    __cv_description: "",
                    shortDescription: $("#cubeviz-dataSelectionModule-tra-measureDialogDescription").html(),
                    __cv_title: ""
                }
            ));
            
            var dialogDiv = $("#cubeviz-dataSelectionModule-dialog-measure");
            
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
            $("#cubeviz-measure-dialogOpener").data("dialogDiv", dialogDiv);
            
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
            var measureElements:CubeViz_Collection = new CubeViz_Collection("__cv_uri"),
                elementContainer = null,
                elementList = $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogElements")[0]);
            
            measureElements
                
                // add elements of current component
                .addList(this.app._.data.components.measures)
                
                // sort
                .sortAscendingBy("__cv_niceLabel")
                
                // Go through all elements of the given list ..
                .each(function(element){
                    
                    elementContainer = $(CubeViz_View_Helper.tplReplace(
                        $("#cubeviz-dataSelectionModule-tpl-dialogRadioElement").html(),
                        {
                            __cv_niceLabel: element.__cv_niceLabel,
                            __cv_uri: element.__cv_uri,
                            radioCSSClass: "cubeviz-dataSelectionModule-measureRadio",
                            radioName: "cubeviz-dataSelectionModule-measureRadio",
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
                "click #cubeviz-measure-dialogOpener": this.onClick_dialogOpener
            });
        }
        
        this.triggerGlobalEvent("onAfterRender_measure");
        
        return this;
    }
}
