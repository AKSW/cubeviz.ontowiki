/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Backbone.d.ts" />

/**
 * 
 */
class View_Abstract extends Backbone.View {
    
    public autostart:bool;
    
    /**
     * Classname or id of HTML element to attache the view.
     */
    public attachedTo:string;
    
    /**
     * Unique identifier (e.g. used for backbone.collection)
     */
    public id:string;
    
    /**
     * 
     */
    public collection:Backbone.Collection;
    
    /**
     * Reference to view manager which called this instance
     */
    public viewManager:View_Manager;    
        
    /**
     * 
     */
    constructor(attachedTo:string, viewManager:View_Manager) 
    {
        // call constructor of Backbone.View
        super();
        
        // set properties
        this.attachedTo = attachedTo;
        this.autostart = false;
        this["el"] = $(attachedTo);
        this.id = "View_Abstract";
        this.collection = new Backbone.Collection;
        this.viewManager = viewManager;
    }
}
