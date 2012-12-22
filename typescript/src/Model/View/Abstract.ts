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
     * Unique identifier (e.g. used for backbone.collection)
     */
    public id:string;
    public viewManager:View_Manager;    
    
    /**
     * 
     */
    public viewInstance:Object;
    
    /**
     * 
     */
    public backboneViewContainer:Backbone.View;
    
    /**
     *
     */
    public backboneViewInstance:Object;
    
    /**
     * 
     */
    constructor(attachedTo:string) 
    {
        this.autostart = false;
        this.attachedTo = attachedTo;
        this.id = "View_Abstract";
        this.viewManager = null;
        this.viewInstance = {};
        this.backboneViewContainer = null;
        this.backboneViewInstance = null;
    }
    
    /**
     * 
     */
    public getId (): string { return this.id; }
    
    /**
     * 
     */
    public render(): void {}
    
    /**
     * 
     */
    public setViewManager(viewManager:View_Manager): void 
    {
        this.viewManager = viewManager;
    }
}
