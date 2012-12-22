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
    public add(id:string, attachedTo:string, autostart?:bool) 
    {
        // set autostart property
        autostart = true == autostart ? true : false;
        
        // first remove view instance
        if(false !== this.get(id)) {
            this.remove(id);
        } 
        
        // add view
        this._allViews.push({id:id, attachedTo:attachedTo, autostart:autostart});
    }
    
    /**
     * Get a particular view.
     * @param id ID of the view.
     * @return View_Abstract|bool View instance, if found, false otherwise.
     */
    public get(id:string) : any
    {
        for(var i=0;i<this._allViews.length;++i){
            if(id == this._allViews[i].id) {
                return this._allViews[i];
            }
        }
        return false;
    }
    
    /**
     * Re-initialize and render a particular view, if it exists.
     * @param id ID of the view.
     * @return void
     */
    public renderView(id:string) : void
    {
        if(false != this.get(id)) {
            // render view
            eval ("new " + id + "(\"" + this.get(id).attachedTo + "\", this);");
        }
    }
    
    /**
     * Removes an element.
     * @param id ID of the view to remove.
     * @return bool True if element with given id was found and removed, false otherwise.
     */
    public remove(id:string) : bool
    {
        for(var i=0;i<this._allViews.length;++i){            
            // if view was found, delete entry
            if(id == this._allViews[i].id) {
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
        for(var i=0;i<this._allViews.length;++i){            
            // if view was found
            if(true == this._allViews[i].autostart){
                this.renderView(this._allViews[i].id);
            }
        }
    }
}
