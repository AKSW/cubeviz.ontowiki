/**
 * 
 */
class CubeViz_View_Abstract 
{    
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
    }
    
    /**
     *
     */
    public bindGlobalEvents(events:any[]) : CubeViz_View_Abstract
    {
        this.app.bindGlobalEvents(events, this);
        return this;
    }
    
    /**
     * Binds events to DOM elements (using $.proxy!)
     * @return void
     * @throws Error
     */
    public bindUserInterfaceEvents (events?:any) : void 
    {
        if(true === _.isUndefined(events) || 0 == _.size(events) ) 
            return;
            
        var eventName = "",
            selector = "",
            self = this;
        
        // iterate over events's properties: each property/value pair represents
        // a event type with event target and the method
        _.each(events, function(method, key){
            if (false === _.isFunction(method)) {
                method = self[method];
            }
            if (!method) {
                throw new Error("Method " + method + " does not exist");
            }
            
            eventName = key.substr(0, key.indexOf(" "));
            selector = key.substr(key.indexOf(" ")+1);
            
            // bind given event
            // want to find out more about the proxy method?
            // have a look at: http://www.jimmycuadra.com/posts/understanding-jquery-14s-proxy-method
            $(selector).on(eventName, $.proxy(method, self));
        });
    }
    
    /**
     * Unbind all events, empty (empty it, delete all of its elements) element and 
     * reset its collection .
     * @return CubeViz_View_Abstract Itself, for chaining.
     */
    public destroy() : CubeViz_View_Abstract
    {
        // Unbind all events
        this.el.off();
        
        // if el is a div, empty it
        if(true === this.el.is("div")) {
            this.el.empty();
            
        // if el is a select box, delete all of its option's
        } else if (true === this.el.is("select")) {
            this.el.find("option").remove();
        }
        // TODO what is with other types?
        
        this.collection.reset();
        
        return this;
    }
    
    /**
     * 
     */
    public initialize() {}
    
    /**
     *
     */
    public triggerGlobalEvent(eventName:string, data?:any) : CubeViz_View_Abstract
    {
        this.app.triggerEvent(eventName, data:any);
        return this;
    }
}
