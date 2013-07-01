/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class View_CompareAction_ModelSelection extends CubeViz_View_Abstract 
{        
    /**
     * 
     */
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CompareAction_ModelSelection", attachedTo, app);
        
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
        return this;
    }
    
    /**
     * Handles changes in both model selectors
     * @param modelNr string Number of the model as string
     * @return
     * @throw
     */
    public handleModelSelectorChanges(modelNr:string) 
    {        
        // extract model information
        var selectedModelLabel = _.str.trim($("#cubeviz-compare-modelSelector" + modelNr + " option:selected").text()),
            selectedModelUri = $("#cubeviz-compare-modelSelector" + modelNr).val();
        
        // model was selected
        if ('' != selectedModelUri) {
            
            // save selected model
            this.app._.compareAction.models [selectedModelUri] = {
                __cv_compareNr: modelNr,
                __cv_uri:       selectedModelUri,
                __cv_niceLabel: selectedModelLabel
            };
            
            // save assignment
            this.app._.compareAction.modelNr2UriAssignment[modelNr] = selectedModelUri;
            
            this.triggerGlobalEvent("onSelect_model" + modelNr);
            
            // there are two models selected
            if ('' != this.app._.compareAction.modelNr2UriAssignment[1]
                && '' != this.app._.compareAction.modelNr2UriAssignment[2]) {
                this.triggerGlobalEvent ("onSelect_model1AndModel2");
            }
        
        // specific model is empty (again)
        } else {
            
            // nullify model instance
            var modelUri = this.app._.compareAction.modelNr2UriAssignment[modelNr];
            this.app._.compareAction.models[modelUri] = null;
            
            // nullify model nr to uri assignment
            if (false == _.str.isBlank(this.app._.compareAction.modelNr2UriAssignment[modelNr])) {
                this.app._.compareAction.modelNr2UriAssignment[modelNr] = '';
            }
            
            this.triggerGlobalEvent ("onSelect_noModel" + modelNr);
        }
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
    public onChange_modelSelector1() 
    {
        this.handleModelSelectorChanges ("1");
    }
    
    /**
     *
     */
    public onChange_modelSelector2() 
    {
        this.handleModelSelectorChanges ("2");
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
            "change #cubeviz-compare-modelSelector1": this.onChange_modelSelector1,
            "change #cubeviz-compare-modelSelector2": this.onChange_modelSelector2
        });
        
        return this;
    }
}
