/// <reference path="..\..\..\DeclarationSourceFiles\jquery.d.ts" />
/// <reference path="..\..\..\DeclarationSourceFiles\Underscore.d.ts" />
/// <reference path="..\..\..\DeclarationSourceFiles\Backbone.d.ts" />

class View_Manager {
    
    private _allViews = [];
    
    /**
     * 
     */
    constructor() 
    {
        this._allViews = [];
    }
    
    /**
     * 
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
     * 
     */
    public get(id:string) : any
    {
        var view = null;
        
        for(var i=0;i<this._allViews.length;++i){
            view = this._allViews[i];
            if(id == view.id){
                return view;
            }
        }
        return false;
    }
    
    /**
     * 
     */
    public callView(id:string) 
    {
        var view = this.get(id);
        if(false != view) {
            view.render();
        }
    }
    
    /**
     * 
     */
    public render() 
    {
        var view = null;
        for(var i=0;i<this._allViews.length;++i){
            view = this._allViews[i];
            if(true == view.autostart){
                view.render();
            }
        }
    }
}
