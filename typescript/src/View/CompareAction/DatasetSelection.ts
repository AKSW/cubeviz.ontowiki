/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_CompareAction_DatasetSelection extends CubeViz_View_Abstract 
{     
    /**
     * Saves information about selected model and dataset
     */
    public selected = {
        model1: null, model2: null,
        dataset1: null, dataset2: null
    };
       
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
        // no dataset selected
        if ("" == $("#cubeviz-compare-datasetSelector" + datasetNr).val()) {
            
            this.selected ["dataset" + datasetNr] = null;
            
            this.triggerGlobalEvent ("onSelect_noDataset" + datasetNr);
          
        // dataset selected
        } else {
        
            // save information
            this.selected ["dataset" + datasetNr] = {
                datasetNr: datasetNr,
                datasetUri: $("#cubeviz-compare-datasetSelector" + datasetNr).val(),
                datasetSelf: element
            };
        
            //
            this.triggerGlobalEvent (
                "onSelect_dataset" + datasetNr, 
                this.selected["dataset" + datasetNr]
            );
        }
        
        // there are two datasets selected
        if (false === _.isNull(this.selected ["dataset1"])
            && false === _.isNull(this.selected ["dataset2"])) {
            this.triggerGlobalEvent (
                "onSelect_dataset1AndDataset2",
                { 
                    dataset1Self: this.selected ["dataset1"],
                    dataset2Self: this.selected ["dataset2"]
                }
            );
        }
    }
    
    /**
     * Handles changes in both model selectors
     * @param modelNr string Number of the model as string
     * @param modelUri string URI of the model
     * @return
     * @throw
     */
    public handleModelSelectorChanges(modelNr:string, modelUri:string) 
    {
        var self = this;
        
        // save model information
        this.selected ["model" + modelNr] = {
            modelUri: modelUri
        };
        
        // show dataset selection
        $("#cubeviz-compare-datasetSelection").show();
        $("#cubeviz-compare-datasetSelectionDiv" + modelNr).show();
        
        // show wait message
        $("#cubeviz-compare-datasetSelector" + modelNr)
            .html ("<option value=\"\">please wait ... </option>");
        
        // load datasets according to given model uri
        DataCube_DataSet.loadAll (
            this.app._.backend.url, "", modelUri, "", function(result) {
                
                if (0 < _.size(result)) {                    
                    // fill select box with received items
                    self.fillSelectBox (
                        "#cubeviz-compare-datasetSelector" + modelNr,
                        result
                    );
                    
                    self.triggerGlobalEvent ("onReceive_datasets", {
                        dataSets: result,
                        modelNr: modelNr,
                        modelUri: modelUri
                    });
                    
                // no elements received, show warning box
                } else {                    
                    $("#cubeviz-compare-datasetSelector" + modelNr)
                        .html ("<option value=\"\">Choose another model ... </option>");
                    
                    self.triggerGlobalEvent ("onReceive_noDatasets", {
                        modelNr: modelNr,
                        modelUri: modelUri
                    });
                }
            }
        );
    }
    
    /**
     *
     */
    public onReceive_datasets(event, data) 
    {
        $("#cubeviz-compare-datasetSelectorWarningBox" + data.modelNr).hide();
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
        this.handleDatasetSelectorChanges ("1", $(event.target).find("option:selected").data("self"));
    }
    
    /**
     *
     */
    public onSelect_dataset2(event) 
    {
        this.handleDatasetSelectorChanges ("2", $(event.target).find("option:selected").data("self"));
    }
    
    /**
     * @param event Event thrown jQuery event
     * @param data object Data attached to the event
     */
    public onSelect_model1(event, data) 
    {
        this.handleModelSelectorChanges("1", data.modelUri);
    }
    
    /**
     * @param event Event thrown jQuery event
     * @param data object Data attached to the event
     */
    public onSelect_model2(event, data) 
    {
        this.handleModelSelectorChanges("2", data.modelUri);
    }
    
    /**
     *
     */
    public onSelect_noModel1() 
    {
        $("#cubeviz-compare-datasetSelectionDiv1").hide();
        
        // nullify model information
        this.selected ["model1"] = null;
    }
    
    /**
     *
     */
    public onSelect_noModel2() 
    {
        $("#cubeviz-compare-datasetSelectionDiv2").hide();
        
        // nullify model information
        this.selected ["model2"] = null;
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
