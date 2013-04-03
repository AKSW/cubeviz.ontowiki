/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_DataselectionModule_DataSet extends CubeViz_View_Abstract 
{        
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CubeVizModule_DataSet", attachedTo, app);
        
        // publish event handlers to application:
        // if one of these events get triggered, the associated handler will
        // be executed to handle it
        this.bindGlobalEvents([
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
        
        CubeViz_View_Helper.destroyDialog($("#cubeviz-dataSet-dialog"));
        
        return this;
    }
    
    /**
     * 
     */
    public initialize() : void 
    {
        // save given elements
        this.collection.reset("__cv_uri");
        this.collection.addList(this.app._.data.dataSets);
        
        this.render();
    }
    
    /**
     * 
     */
    public onChange_list() : void
    {
        this.showSpinner();
        
        var selectedElementId:string = $("#cubeviz-dataSet-list").val(),
            selectedElement = this["collection"].get(selectedElementId),
            self = this;

        // set new selected data set
        this.app._.data.selectedDS = selectedElement;
        
        // nulling retrievedObservations
        this.app._.backend.retrievedObservations = {};
        
        // update selectedDSD
        _.each(this.app._.data.dataStructureDefinitions, function(dsd){
            if (dsd.__cv_uri == selectedElement["http://purl.org/linked-data/cube#structure"]) {
                self.app._.data.selectedDSD = dsd;
            }
        });

        // trigger event
        this.triggerGlobalEvent("onChange_selectedDS");
    }
    
    /**
     *
     */
    public onClick_closeAndUpdate(event) : void 
    {
        var dialogDiv:any = $(event.target).data("dialogDiv"),
            dataSets:CubeViz_Collection = new CubeViz_Collection("__cv_uri"),
            dataSetUri = $("input[name=cubeviz-dataSelectionModule-dataSetRadio]:checked").val(),
            selectedDataSet:any = null;
            
        // Start handling of new configuration, but before start, show a spinner 
        // to let the user know that CubeViz did something.    
        CubeViz_View_Helper.showCloseAndUpdateSpinner(dialogDiv);
        
        // get dataset with given uri
        selectedDataSet = dataSets
            .addList(this.app._.data.dataSets)
            .get(dataSetUri);
            
        // update selected dataset
        this.app._.data.selectedDS = selectedDataSet;
        
        // close dialog
        CubeViz_View_Helper.hideCloseAndUpdateSpinner(dialogDiv);
        
        // if only module was loaded, move reloading stuff to footer.ts
        CubeViz_View_Helper.closeDialog(dialogDiv);
        
        // output new dataset label
        $("#cubeviz-dataSet-label").html(_.str.prune(
            selectedDataSet.__cv_niceLabel, 28, " ..."
        ));
    }
    
    /**
     *
     */
    public onClick_dialogOpener(event) : void 
    {
        CubeViz_View_Helper.openDialog($("#cubeviz-dataSelectionModule-dialog-dataSet"));
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
        this.triggerGlobalEvent("onBeforeRender_dataSet");
        
        // set label directly
        $("#cubeviz-dataSet-label").html(
            _.str.prune (
                this.app._.data.selectedDS.__cv_niceLabel,
                28,
                " ..."
            )
        ).attr ("title", this.app._.data.selectedDS.__cv_niceLabel);
        
        /**
         * Dialog
         */
        // set dialog reference and template
        $("#cubeviz-dataSelectionModule-dialogContainer").append(CubeViz_View_Helper.tplReplace(
            $("#cubeviz-dataSelectionModule-tpl-dialog").html(),
            {
                __cv_niceLabel: $("#cubeviz-dataSelectionModule-tra-dataSetDialog").html(), 
                __cv_hashedUri: "dataSet"
            }
        ));
        
        var dialogDiv = $("#cubeviz-dataSelectionModule-dialog-dataSet");
        
        // setup jqeruy dialog
        CubeViz_View_Helper.attachDialogTo(
            dialogDiv,
            {closeOnEscape: true, showCross: true, width: 650}
        );
        
        // hide a couple of buttons
        $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogSortButtons").get(0)).hide();
        $(dialogDiv.find(".cubeviz-component-selectAllButton").get(0)).hide();
        $(dialogDiv.find(".cubeviz-component-deselectButton").get(0)).hide();
        
        // attach dialog div to dialog opener link
        $("#cubeviz-dataSet-dialogOpener").data("dialogDiv", dialogDiv);
        
        // attach dialog div to "cancel" button
        $($(dialogDiv.find(".cubeviz-component-cancel")).get(0))
            .data("dialogDiv", dialogDiv);
            
        // attach dialog div to "close and update" button
        $($(dialogDiv.find(".cubeviz-component-closeAndUpdate")).get(0))
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
        var componentElements:CubeViz_Collection = new CubeViz_Collection("__cv_uri"),
            elementContainer = null,
            elementList = $(dialogDiv.find(".cubeviz-dataSelectionModule-dialogElements")[0]);
        
        componentElements
            
            // add elements of current component
            .addList(this.app._.data.dataSets)
            
            // sort
            .sortAscendingBy("__cv_niceLabel")
            
            // Go through all elements of the given list ..
            .each(function(element){
                
                elementContainer = $(CubeViz_View_Helper.tplReplace(
                    $("#cubeviz-dataSelectionModule-tpl-dialogRadioElement").html(),
                    {
                        __cv_niceLabel: element.__cv_niceLabel,
                        __cv_uri: element.__cv_uri,
                        radioId: "cubeviz-dataSelectionModule-dataSetRadio",
                        radioName: "cubeviz-dataSelectionModule-dataSetRadio",
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
            "click #cubeviz-dataSet-dialogOpener": this.onClick_dialogOpener
        });
        
        this.triggerGlobalEvent("onAfterRender_dataSet");
        
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
