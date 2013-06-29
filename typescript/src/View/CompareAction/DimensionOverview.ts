/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_CompareAction_DimensionOverview extends CubeViz_View_Abstract 
{     
    /**
     * Saves information about selected model and dataset
     */
    public selected = {
        model1: null, model2: null,
        dataset1: null, dataset2: null
    };
    
    /**
     * Remembers received dimensions
     * dimensions [1] according to dataset1 
     *            [2] according to dataset2
     */
    public dimensions = {};
       
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CompareAction_DimensionOverview", attachedTo, app);
        
        // publish event handlers to application:
        // if one of these events get triggered, the associated handler will
        // be executed to handle it
        this.bindGlobalEvents([
            {
                name:    "onSelect_dataset1",
                handler: this.onSelect_dataset1
            },
            {
                name:    "onSelect_dataset2",
                handler: this.onSelect_dataset2
            },
            {
                name:    "onSelect_dataset1AndDataset2",
                handler: this.onSelect_dataset1AndDataset2
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
                name:    "onSelect_noDataset1",
                handler: this.onSelect_noDataset1
            },
            {
                name:    "onSelect_noDataset2",
                handler: this.onSelect_noDataset2
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
     *
     */
    public handleDatasetSelectorChanges(datasetNr:string, data:any) 
    {
        this.selected["dataset" + datasetNr] = data;
        
        // load according dimensions
        DataCube_Component.loadAllDimensions(
            this.app._.backend.url, "", this.selected ["model" + datasetNr].modelUri,
            data.datasetSelf ["http://purl.org/linked-data/cube#structure"], 
            data.datasetUri, function(result){
                console.log("");
                console.log("components");
                console.log(result);
            }
        );
    }
    
    /**
     *
     */
    public onSelect_dataset1(event, data) 
    {
        this.handleDatasetSelectorChanges("1", data);
    }
    
    /**
     *
     */
    public onSelect_dataset2(event, data) 
    {
        this.handleDatasetSelectorChanges("2", data);
    }
    
    /**
     *
     */
    public onSelect_dataset1AndDataset2(event, data) 
    {
        console.log("");
        console.log("onSelect_dataset1AndDataset2");
    }
    
    /**
     *
     */
    public onSelect_model1(event, data) 
    {
        this.selected["model1"] = data;
    }
    
    /**
     *
     */
    public onSelect_model2(event, data) 
    {
        this.selected["model2"] = data;
    }
    
    /**
     *
     */
    public onSelect_noDataset1() 
    {
        this.selected["dataset1"] = null;
    }
    
    /**
     *
     */
    public onSelect_noDataset2() 
    {
        this.selected["dataset2"] = null;
    }
    
    /**
     *
     */
    public onSelect_noModel1() 
    {
        // nullify model information
        this.selected ["model1"] = null;
        this.selected ["dataset1"] = null;
    }
    
    /**
     *
     */
    public onSelect_noModel2() 
    {
        // nullify model and dataset information
        this.selected ["model2"] = null;
        this.selected ["dataset2"] = null;
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
