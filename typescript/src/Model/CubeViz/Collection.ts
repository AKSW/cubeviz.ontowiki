/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

class CubeViz_Collection 
{
    /**
     * Name of the ID to identify elements(Objects) in the collection.
     */
    public idKey:string;
    
    /**
     * Contains all the elements of the collection.
     */
    public _:any[];
    
    /**
     * Constructor
     * @param idKey Name of the key to use in a future collection.
     */
    constructor(idKey?:string) 
    {
        this.reset(idKey);
    }
    
    /**
     * Add a new element to the collection. If it already exists, it will be ignored
     * except option.merge = true.
     * @param element Element to add, usally an object
     * @param option Further configuration, e.g. merge=true means replace the element 
     *        if already exists.
     * @return CubeViz_Collection Itself, for chaining.
     */
    public add(element:any, option?:any) : CubeViz_Collection
    {
        if(true === _.isUndefined(element[this.idKey])) {
            throw new Error("Key " + this.idKey + " in element not set!");
            return this;
        }
        
        // if it does not exists in the list, add it
        if(undefined === this.get(element[this.idKey])) {
            this._.push(element);
            
        // if it does exists and option.merge is true, add it 
        } else if ((undefined !== option && undefined !== option["merge"] 
                     && option["merge"] == true)) {
            this.remove(element[this.idKey]);
            this._.push(element);
        }
        
        // otherwise do nothing
        return this;
    }
    
    /**
     * Add a list to the collection. 
     * @param list Objects and arrays are possible to use.
     * @return CubeViz_Collection Itself, for chaining.
     */
    public addList(list) : CubeViz_Collection
    {
        var self = this;
        
        // if list is an array
        if(true == _.isArray(list)){
            _.each(list, function(element){
                self.add(element);
            });
            
        // if list is an object, than this function recall itself with all the 
        // values of the object 
        } else if(true == _.isObject(list)){
            this.addList(_.values(list));
        }
        
        return self;
    }
    
    /**
     * Executes given func for each item in this._ using Underscorejs's each.
     * @param func Anonymous function to call for each element.
     * @return CubeViz_Collection Itself, for chaining.
     */
    public each(func) : CubeViz_Collection
    {
        _.each(this._, func);
        return this;
    }
    
    /**
     * Checks if an element with given id exists in this collection.
     * @param id ID of the element to search
     * @return bool True if element exists, false otherwise.
     */
    public exists(id:string) : bool 
    {
        return false === _.isUndefined(this.get(id));
    }
    
    /**
     * Get element by id. 
     * @param id ID of the element.
     * @return any|undefined Found object or undefined.
     */
    public get(id:string) : any
    {
        var self = this;
        var t = _.filter(this._, function(element){
            if(element[self.idKey] == id) {
                return true;
            } else { 
                return false;
            }
        });
        return 1 == t.length ? t[0] : undefined;
    }
    
    /**
     * Get first element.
     * @return any|undefined Found object or undefined.
     */
    public getFirst() : any
    {
        return _.first(this._);
    }
    
    /**
     * Remove element by id.
     * @param id ID f the element.
     * @return CubeViz_Collection Itself, for chaining.
     */
    public remove(id:string) : CubeViz_Collection
    {
        var self = this;
        this._ = _.reject(this._, function(element){ 
            return element[self.idKey] == id; 
        });
        
        return this;
    }
    
    /**
     * Reset collection. Reset idKey too, if you like or use the old one(idKey=undefined).
     * @param idKey Optional, new idKey. If undefined, it will use the old one.
     * @return CubeViz_Collection Itself, for chaining.
     */
    public reset(idKey?:string) : CubeViz_Collection
    {        
        this.idKey = undefined === idKey 
            // if nothing was given, check own idKey 
            ? ( undefined === this.idKey ? "id" : this.idKey ) 
            : idKey;
        // empty array which contains all the element of the collection
        this._ = [];
        
        return this;
    }
    
    /**
     * Size of the collection
     * @param number Size.
     */
    public size () : number
    {
        return _.size(this._);
    }
    
    /**
     * Sort all entry ascending by a given key.
     * @param key Name key to sort entries by.
     * @return CubeViz_Collection Itself, for chaining.
     */
    public sortAscendingBy (key?:string) : CubeViz_Collection
    {
        var a:any = "", b:any = "", c:any = "", d:any = "", 
            useKey = false === _.isUndefined(key) ? key : this.idKey;
        
        this._.sort(function(a, b) {
            
            try{
                // check if a is a float
                try {
                    c = parseFloat(a[useKey]);
                    d = parseFloat(b[useKey]);
                    
                    // if c or d is not NaN, handle them as strings!
                    if(true === _.isNaN(c) || true === _.isNaN(d)) { throw new Error(); }
                    
                } catch (ex) {
                    /**
                     * i come here when a "TypeError" appears which mean that
                     * i can not case a or b to a float
                     */
                    c = a[useKey].toUpperCase();
                    d = b[useKey].toUpperCase();
                }
                
                return (c < d) ? -1 : (c > d) ? 1 : 0;
            } catch(e) {
                
            }
        });
        
        return this;
    }
    
    /**
     * Returns an object with numeric index containing all elements.
     * @return Object
     */
    public toObject() 
    {
        var i = 0, obj = {};
        
        _.each(this._, function(entry){
            obj[i++] = entry;
        });
        
        return obj;
    }
}
