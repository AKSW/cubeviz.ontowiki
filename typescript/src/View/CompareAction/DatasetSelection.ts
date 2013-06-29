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
     * 
     */
    public initialize() : void 
    {
        this.collection.reset("__cv_uri");        
        this.render();
    }
    
    /**
     * @param event Event thrown jQuery event
     * @param data object Data attached to the event
     */
    public onSelect_model1(event, data) 
    {
        // show dataset selection
        $("#cubeviz-compare-datasetSelection").show();
        $("#cubeviz-compare-dataset1Selection").show();
        
        DataCube_DataSet.loadAll (
            this.app._.backend.url, "", data.modelUri, "", function(result) {
                console.log("");
                console.log(result);
            }
        );
    }
    
    /**
     * @param event Event thrown jQuery event
     * @param data object Data attached to the event
     */
    public onSelect_model2(data) 
    {
        // show dataset selection
        $("#cubeviz-compare-datasetSelection").show();
        $("#cubeviz-compare-dataset2Selection").show();
    }
    
    /**
     *
     */
    public onSelect_noModel1() 
    {
        $("#cubeviz-compare-dataset1Selection").hide();
    }
    
    /**
     *
     */
    public onSelect_noModel2() 
    {
        $("#cubeviz-compare-dataset2Selection").hide();
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
