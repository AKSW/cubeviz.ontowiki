/**
 * 
 */
class CubeViz_View_Application {
    
    private _allViews:CubeViz_Collection;
    
    /**
     * Constructor
     */
    constructor() 
    {
        this._allViews = new CubeViz_Collection;
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
     * @return void
     */
    public renderView(id:string) : CubeViz_View_Application
    {
        var view = this.get(id);
        if(undefined !== view) {
            // render view
            eval ("new " + id + "(\"" + view.attachedTo + "\", this);");
        }
        
        return this;
    }
    
    /**
     * Removes an element.
     * @param id ID of the view to remove.
     * @return bool True if element with given id was found and removed, false otherwise.
     */
    public remove(id:string) : CubeViz_View_Application
    {
        this._allViews.remove(id);
        return this;
    }
    
    /**
     * Renders all views, which have property autostart=true
     * @return void
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
