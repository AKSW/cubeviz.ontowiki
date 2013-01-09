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
    public add(id:string, attachedTo:string, merge?:bool) : CubeViz_View_Application
    {        
        var options:any = true === merge ? {merge:true} : undefined,
            
            viewObj = {
            alreadyRendered: false,
            attachedTo:attachedTo,
            id:id,
            instance: null
        };
        
        // create instance of the given view class
        eval ("viewObj.instance = new " + id + "(\"" + attachedTo + "\", this);");
        
        this._viewInstances.add(viewObj, options);
        
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
     * From a view you have the possibility to bind event handlers to the application
     * the view is running in. If one of the global event is triggered it will 
     * run all the associated event handlers.
     * @param events An array of event objects: each object has a name (for instance
     *               onChange_visualizationName) and a handler (function)
     * @param callee The instance (usally a view) which calls this method (used in 
     *               combination with $.proxy to bind this to callee)
     * @param CubeViz_View_Application Itself
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
             *  hint2: event name is oriented on W3C standard, but separates the
             *         logical unit from the event itself via an underline.
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
     * Reset all views and this application instance
     */
    public reset() 
    {
        // kill all set events
        $(this).off();
        
        var self = this;
        
        _.each(this._viewInstances._, function(view){
            self
                .destroyView(view.id)
                .add(view.id, view.attachedTo, true);
        });
    }
    
    /**
     * Triggers a global event. Other view may listen to this event and execute
     * their event handlers.
     * @param eventName Name of the event to fire
     * @param data Additional data to pass through the event handler as second parameter
     * @return CubeViz_View_Application Itself
     */
    public triggerEvent(eventName:string, data?:any) : CubeViz_View_Application
    {
        $(this).trigger(eventName, [data]);
        return this;
    }
}
