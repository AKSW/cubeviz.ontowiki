/**
 * 
 */
class CubeViz_View_Abstract {
    
    /**
     * Reference to application which called this instance
     */
    public app:CubeViz_View_Application;    
    
    /**
     * 
     */
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
    public el:any;
    
    /**
     * 
     */
    public id:string;
        
    /**
     * 
     */
    constructor(id:string, attachedTo:string, app:CubeViz_View_Application) 
    {        
        // set properties
        this.app = app;
        this.attachedTo = attachedTo;
        this.autostart = false;
        this.el = $(attachedTo);
        this.collection = new CubeViz_Collection;
        this.id = id || "view";
        
        this.initialize();
    }
    
    /**
     * Binds events to DOM elements (using $.proxy!)
     * @return void
     * @throws Error
     */
    public delegateEvents (events?:any) : void 
    {
        if(undefined == events) 
            return;
        
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
            // want to find out more about the proxy method?
            // have a look at: http://www.jimmycuadra.com/posts/understanding-jquery-14s-proxy-method
            $(selector).on(
                eventName, 
                $.proxy(method, this)
            );
        }
    }
    
    /**
     * Unbind all events, remove element and reset collection 
     */
    public destroy() : CubeViz_View_Abstract
    {
        this.el
            .off()
            .empty();
        
        this.collection.reset();
        
        return this;
    }
    
    /**
     * 
     */
    public initialize() {}
}
