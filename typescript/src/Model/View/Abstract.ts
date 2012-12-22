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
     * 
     */
    public cid:string;
    
    /**
     * Cached regex to split keys for `delegate`.
     */
    public delegateEventSplitter = /(.*)\s+(.*)/i;
    
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
        this.cid = _.uniqueId('c');
        this["el"] = $(attachedTo);
        this.id = "View_Abstract";
        this.collection = new Backbone.Collection;
        this.viewManager = viewManager;
    }
    
    /**
     * 
     */
    public delegateEvents (events?:any) : any 
    {
        if(undefined == events) return;
        
        for (var key in events) {
            var eventName = key.substr(0, key.indexOf(" "));
            var selector = key.substr(key.indexOf(" ")+1);
            var method = events[key];
            if (!_.isFunction(method)) method = this[events[key]];
            if (!method) throw new Error('Method "' + events[key] + '" does not exist');
            $(selector).on(eventName, method);
        }
    }
}
