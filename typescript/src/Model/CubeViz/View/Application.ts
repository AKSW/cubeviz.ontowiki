/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />

/**
 * 
 */
class CubeViz_View_Application 
{    
    /**
     * 
     */
    private _viewInstances:CubeViz_Collection;
    
    /**
     * 
     */
    private _renderedViews:CubeViz_Collection;
    
    /**
     * 
     */
    private _eventHandlers:CubeViz_Collection;
    
    /**
     * Data container
     */
    public _:any;
    
    /**
     * Constructor
     */
    constructor() 
    {
        this._viewInstances     = new CubeViz_Collection;
        this._eventHandlers     = new CubeViz_Collection;
        this._                  = {};
    }
    
    /**
     * Add a new view and set it to autostart or not.
     * @param view View instance to add.
     * @param attachedTo Class or id of a certain DOM element.
     */
    public add(id:string, attachedTo:string) : CubeViz_View_Application
    {        
        var viewObj = {
            alreadyRendered: false,
            attachedTo:attachedTo,
            id:id,
            instance: null
        };
        
        // create instance of the given view class
        eval ("viewObj.instance = new " + id + "(\"" + attachedTo + "\", this);");
        
        this._viewInstances.add(viewObj);
        
        return this;
    }
    
    /**
     * Destroy a certain view
     * @param id ID of the view.
     * @return CubeViz_View_Application Itself
     */
    public destroyView(id:string) : CubeViz_View_Application
    {
        var view = this._viewInstances.get(id);
        
        if(true === view.alreadyRendered) {
            view.destroy();
            this._viewInstances.get(id).alreadyRendered = false;
        }
        
        return this;
    }
    
    /**
     * Get a particular view.
     * @param id ID of the view.
     * @return CubeViz_View_Abstract|bool View instance, if found, false otherwise.
     */
    public get(id:string) : any
    {
        return this._viewInstances.get(id);
    }
    
    /**
     * @param events
     */
    public bindGlobalEvents(events:any[], callee:any) : CubeViz_View_Application
    {
        if(true === _.isUndefined(events) || 0 == _.size(events) ) 
            return this;
            
        var self = this;
        
        // iterate over events's properties: each property/value pair represents
        // a event type with event target and the method
        _.each(events, function(event){
            
            /*
             *  event object example:
             *  ---------------------
             *  {
                    name:      onChange_visualizationName
             *      handler:   function(event, data){...}
             *  }
             * 
             *  hint: handler should named as the event itself
             */
             
            $(self).on(event.name, $.proxy(event.handler, callee));
        });
        
        return this;
    }
    
    /**
     * Re-initialize and render a particular view, if it exists.
     * @param id ID of the view.
     * @param attachedTo ID or class of a DOM element
     * @return CubeViz_View_Application Itself
     */
    public renderView(id:string, attachedTo?:string) : CubeViz_View_Application
    {
        // add view to list if it does not exist yet
        this
            .add(id, attachedTo)

        // ... if view was already rendered, destroy old instance and ...
            .destroyView(id)
        
        // ... initialize view (with initialize it, you render it)
            .get(id).instance.initialize();
        
        return this;
    }
    
    /**
     * Removes an element.
     * @param id ID of the view to remove.
     * @return CubeViz_View_Application Itself
     */
    public remove(id:string) : CubeViz_View_Application
    {
        this._viewInstances.remove(id);
        return this;
    }
    
    /**
     * Renders all views
     * @return CubeViz_View_Application Itself
     */
    public renderAll() : CubeViz_View_Application
    {
        var self = this;
        _.each(this._viewInstances._, function(view){
            self.renderView(view.id, view.attachedTo);
        });
        return this;
    }
    
    /**
     * @param eventName
     * @return CubeViz_View_Application Itself
     */
    public triggerEvent(eventName:string, data?:any) : CubeViz_View_Application
    {
        $(this).trigger(eventName, [data]);
        return this;
    }
}
