/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_CompareAction_DatasetSelection extends CubeViz_View_Abstract 
{            
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CompareAction_DatasetSelection", attachedTo, app);
        
        // publish event handlers to application:
        // if one of these events get triggered, the associated handler will
        // be executed to handle it
        this.bindGlobalEvents([
            {
                name:    "onReceive_datasets",
                handler: this.onReceive_datasets
            },
            {
                name:    "onReceive_noDatasets",
                handler: this.onReceive_noDatasets
            },
            {
                name:    "onSelect_model1",
                handler: this.onSelect_model1
            },
            {
                name:    "onSelect_model2",
                handler: this.onSelect_model2
            },
            {
                name:    "onSelect_noModel1",
                handler: this.onSelect_noModel1
            },
            {
                name:    "onSelect_noModel2",
                handler: this.onSelect_noModel2
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
     * @param selectId string ID of the select box
     * @param elements List of objects to add
     * @return void
     */
    public fillSelectBox(selectId:string, elements:any[]) : void
    {
        var newOption:any = {};
        
        $(selectId).html("<option value=\"\">- please select -</option>");
        
        _.each(elements, function(element){
            newOption = $('<option/>');
            
            newOption
                .attr("value", element.__cv_uri)
                .data("self", element)
                .text(element.__cv_niceLabel);
            
            $(selectId).append (newOption);
        });
    }
    
    /**
     * 
     */
    public initialize() : void 
    {
        this.collection.reset("__cv_uri");        
        this.render();
    }
    
    /**
     *
     */
    public handleDatasetSelectorChanges(datasetNr:string, element:any) 
    {
        var selectedDatasetUri = $("#cubeviz-compare-datasetSelector" + datasetNr).val();
        
        // no dataset selected
        if (true === _.str.isBlank(selectedDatasetUri)) {
            
            // nullify saved dataset information
            this.app._.compareAction.datasets [datasetNr] = null
            
            this.triggerGlobalEvent("onSelected_noDataset" + datasetNr);
          
        // dataset selected
        } else {        
                           
            // save information
            element.__cv_compareNr = datasetNr;                
            this.app._.compareAction.datasets [datasetNr] = element;
        
            //
            this.triggerGlobalEvent ("onSelected_dataset" + datasetNr);
        }
    }
    
    /**
     * Handles changes in both model selectors
     * @param modelNr string Number of the model as string
     * @return
     * @throw
     */
    public handleModelSelectorChanges(modelNr:string) 
    {
        var self = this;
        
        // show dataset selection
        $("#cubeviz-compare-datasetSelection").show();
        $("#cubeviz-compare-datasetSelectionDiv" + modelNr).show();
        
        // show wait message
        $("#cubeviz-compare-datasetSelector" + modelNr)
            .html ("<option value=\"\">please wait ... </option>");
        
        // load datasets according to given model uri
        DataCube_DataSet.loadAll (
            this.app._.backend.url, "", this.app._.compareAction.models[modelNr].__cv_uri, "", 
            function(result) { // callback
                self.onReceive_datasets (result, modelNr);
            }
        );
    }
    
    /**
     *
     */
    public onReceive_datasets(result:any, modelNr:string) 
    {
        var self = this;
        
        $("#cubeviz-compare-datasetSelectorWarningBox" + modelNr).hide();
        
        if (0 < _.size(result)) {                    
            // fill select box with received items
            self.fillSelectBox (
                "#cubeviz-compare-datasetSelector" + modelNr,
                result
            );
            
        // no elements received, show warning box
        } else {                    
            $("#cubeviz-compare-datasetSelector" + modelNr)
                .html ("<option value=\"\">Choose another model ... </option>");
            
            self.triggerGlobalEvent ("onReceive_noDatasets", {
                modelNr: modelNr,
                modelUri: self.app._.compareAction.model[modelNr].__cv_uri
            });
        }
    }
    
    /**
     *
     */
    public onReceive_noDatasets(event, data) 
    {
        $("#cubeviz-compare-datasetSelectorWarningBox" + data.modelNr).show();
    }
    
    /**
     *
     */
    public onSelect_dataset1(event) 
    {
        this.handleDatasetSelectorChanges (
            "1", 
            $(event.target).find("option:selected").data("self")
        );
    }
    
    /**
     *
     */
    public onSelect_dataset2(event) 
    {
        this.handleDatasetSelectorChanges (
            "2", 
            $(event.target).find("option:selected").data("self")
        );
    }
    
    /**
     * @param event Event thrown jQuery event
     * @param data object Data attached to the event
     */
    public onSelect_model1(event, data) 
    {
        this.handleModelSelectorChanges("1");
    }
    
    /**
     * @param event Event thrown jQuery event
     * @param data object Data attached to the event
     */
    public onSelect_model2(event, data) 
    {
        this.handleModelSelectorChanges("2");
    }
    
    /**
     *
     */
    public onSelect_noModel1() 
    {
        $("#cubeviz-compare-datasetSelectionDiv1").hide();
    }
    
    /**
     *
     */
    public onSelect_noModel2() 
    {
        $("#cubeviz-compare-datasetSelectionDiv2").hide();
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
        this.bindUserInterfaceEvents({
            "change #cubeviz-compare-datasetSelector1": this.onSelect_dataset1,
            "change #cubeviz-compare-datasetSelector2": this.onSelect_dataset2
        });
        
        return this;
    }
}
