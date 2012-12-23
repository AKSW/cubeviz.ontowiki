/**
 * 
 */
class View_Abstract {
    
    public autostart:bool;
    
    /**
     * Classname or id of HTML element to attache the view.
     */
    public attachedTo:string;
    
    /**
     * 
     */
    public collection:CubeViz_Collection;
    
    /**
     * 
     */
    public id:string;
    
    /**
     * Reference to view manager which called this instance
     */
    public viewManager:View_Manager;    
        
    /**
     * 
     */
    constructor(id:string, attachedTo:string, viewManager:View_Manager) 
    {        
        // set properties
        this.attachedTo = attachedTo;
        this.autostart = false;
        this["el"] = $(attachedTo);
        this.id = "view" || id;
        this.collection = new CubeViz_Collection;
        this.viewManager = viewManager;
    }
    
    /**
     * 
     */
    public delegateEvents (events?:any) : any 
    {
        if(undefined == events) return;
        
        for (var key in events) {
            var method = events[key];
            if (!_.isFunction(method)) {
                method = this[events[key]];
            }
            if (!method) {
                throw new Error('Method "' + events[key] + '" does not exist');
            }
            var eventName = key.substr(0, key.indexOf(" "));
            var selector = key.substr(key.indexOf(" ")+1);
            
            // bind given event
            $(selector).on(
                eventName, 
                $.proxy(method, this)
            );
        }
    }
}
