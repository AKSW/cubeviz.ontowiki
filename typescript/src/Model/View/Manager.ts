/**
 * 
 */
class View_Manager {
    
    private _allViews = [];
    
    /**
     * Constructor
     */
    constructor() 
    {
        this._allViews = [];
    }
    
    /**
     * Add a new view and set it to autostart or not.
     * @param view View instance to add.
     * @param autostart True if view has to be rendered on render() call, false or nothing otherwise.
     */
    public add(view:View_Abstract, autostart?:bool) 
    {
        // set autostart property
        view.autostart = true == autostart ? true : false;
        
        // save reference of this view manager instance into view
        view.setViewManager(this);
        
        // save view
        this._allViews.push (view);
    }
    
    /**
     * Get a particular view.
     * @param id ID of the view.
     * @return View_Abstract|bool View instance, if found, false otherwise.
     */
    public get(id:string) : any
    {
        var view = null;
        
        for(var i=0;i<this._allViews.length;++i){
            view = this._allViews[i];
            
            // if view was found, return it
            if(id == view.id){
                return view;
            }
        }
        return false;
    }
    
    /**
     * Re-initialize and render a particular view, if it exists.
     * @param id ID of the view.
     * @return void
     */
    public callView(id:string) : void
    {
        if(false != this.get(id)) {
            
            // first remove view instance
            this.remove(id);
            
            // add new instance of the view
            eval ("this.add(new " + id + "(\"" + view.attachedTo + "\"));");
            
            // render this new view
            this.get(id).render();
        }
    }
    
    /**
     * Removes an element.
     * @param id ID of the view to remove.
     * @return bool True if element with given id was found and removed, false otherwise.
     */
    public remove(id:string) : bool
    {
        var view = null;
        for(var i=0;i<this._allViews.length;++i){
            view = this._allViews[i];
            
            // if view was found, delete entry
            if(id == view.id) {
                delete this._allViews[i];
                this._allViews.splice(i,1);
                return true;
            }
        }
        return false;
    }
    
    /**
     * Renders all views, which have property autostart=true
     * @return void
     */
    public render() : void
    {
        var view = null;
        for(var i=0;i<this._allViews.length;++i){
            view = this._allViews[i];
            
            // if view was found
            if(true == view.autostart){
                view.render();
            }
        }
    }
}
