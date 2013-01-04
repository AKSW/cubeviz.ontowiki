/**
 * 
 */
class CubeViz_View_Application 
{    
    /**
     * 
     */
    private _allViews:CubeViz_Collection;
    
    
    /**
     * 
     */
    private _renderedViews:CubeViz_Collection;
    
    /**
     * Data container
     */
    public _:any;
    
    /**
     * Constructor
     */
    constructor() 
    {
        this._allViews      = new CubeViz_Collection;
        this._renderedViews = new CubeViz_Collection;
        this._              = {};
    }
    
    /**
     * Add a new view and set it to autostart or not.
     * @param view View instance to add.
     * @param autostart True if view has to be rendered on render() call, false or nothing otherwise.
     */
    public add(id:string, attachedTo:string, autostart?:bool) : CubeViz_View_Application
    {
        // set autostart property
        autostart = true == autostart ? true : false;
        
        this._allViews.add({id:id, attachedTo:attachedTo, autostart:autostart});
        
        return this;
    }
    
    /**
     * Destroy a certain view
     * @param id ID of the view.
     * @return CubeViz_View_Application Itself
     */
    public destroyView(id:string) : CubeViz_View_Application
    {
        var renderedView = this._renderedViews.get(id),
            alreadyRendered = undefined !== renderedView;
        
        if(true === alreadyRendered) {
            renderedView.destroy();
            this._renderedViews.remove(id);
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
        return this._allViews.get(id);
    }
    
    /**
     * Re-initialize and render a particular view, if it exists.
     * @param id ID of the view.
     * @return CubeViz_View_Application Itself
     */
    public renderView(id:string) : CubeViz_View_Application
    {
        var view = this.get(id),
            renderedView = this._renderedViews.get(id),
            alreadyRendered = undefined !== renderedView;
        
        // do nothing, if view does not exists
        if(true === _.isUndefined(view)) {
            
        // otherwise ...
        } else {        
            // ... if view was already rendered, destroy old instance and ...
            if(true === alreadyRendered) {
                renderedView.destroy();
                this._renderedViews.remove(id);
            }
            
            // ... render view
            eval ("this._renderedViews.add (new " + id + "(\"" + view.attachedTo + "\", this));");
        }
        
        return this;
    }
    
    /**
     * Removes an element.
     * @param id ID of the view to remove.
     * @return CubeViz_View_Application Itself
     */
    public remove(id:string) : CubeViz_View_Application
    {
        this._allViews.remove(id);
        this._renderedViews.remove(id);
        return this;
    }
    
    /**
     * Renders all views, which have property autostart=true
     * @return CubeViz_View_Application Itself
     */
    public render() : CubeViz_View_Application
    {
        var self = this;
        $(this._allViews._).each(function(i, view){
            // if view's autostart was set to true
            if(true == view["autostart"]){
                self.renderView(view["id"]);
            }
        });
        return this;
    }
}
