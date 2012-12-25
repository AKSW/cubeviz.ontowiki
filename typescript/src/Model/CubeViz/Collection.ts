/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Underscore.d.ts" />

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
    constructor(idKey:string) 
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
            $(list).each(function(i, element){
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
     * Remove element by id.
     * @param id ID f the element.
     * @return CubeViz_Collection Itself, for chaining.
     */
    public remove(id:string) : CubeViz_Collection
    {
        var self = this;
        this._ = _.reject(this._, function(element){ 
            return element[self.idKey] === id; 
        });
    }
    
    /**
     * Reset collection. Reset idKey too, if you like or use the old one.
     * @param idKey Optional, new idKey. If undefined, it will use the old one.
     * @return CubeViz_Collection Itself, for chaining.
     */
    public reset(idKey?:string) : CubeViz_Collection
    {        
        this.idKey = undefined === idKey ? this.idKey : idKey;
        this._ = [];
        return this;
    }
    
    /**
     * Size of the collection
     * @param int Size.
     */
    public size() : int
    {
        return _.size(this._);
    }
}
