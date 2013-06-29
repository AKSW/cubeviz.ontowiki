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
        
        $(selectId).html("");
        
        _.each(elements, function(element){
            newOption = $('<option/>');
            
            newOption
                .attr("value", element.__cv_uri)
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
     * Handles changes in both model selectors
     * @param modelNr string Number of the model as string
     * @param modelUri string URI of the model
     * @return
     * @throw
     */
    public handleModelSelectorChanges(modelNr:string, modelUri:string) 
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
            this.app._.backend.url, "", modelUri, "", function(result) {
                
                if (0 < _.size(result)) {
                    
                    $("#cubeviz-compare-datasetSelectorWarningBox" + modelNr).hide();
                    
                    // fill select box with received items
                    self.fillSelectBox (
                        "#cubeviz-compare-datasetSelector" + modelNr,
                        result
                    );
                    
                // no elements received, show warning box
                } else {                
                    $("#cubeviz-compare-datasetSelectorWarningBox" + modelNr).show();
                    
                    $("#cubeviz-compare-datasetSelector" + modelNr)
                        .html ("<option value=\"\">Choose another model ... </option>");
                }
            }
        );
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
        });
        
        return this;
    }
}
