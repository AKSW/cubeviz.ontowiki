/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Underscore.d.ts" />

class CubeViz_Collection 
{
    public idKey:string;
    
    /**
     * Contains all the elements of the collection
     */
    public _:any[];
    
    /**
     * 
     */
    constructor(idKey?:string) 
    {
        this.reset(idKey);
    }
    
    /**
     * 
     */
    public add(element:any, option?:any) : bool
    {
        // if it does not exists in the list, add it
        if(undefined === this.get(element[this.idKey])) {
            this._.push(element);
            return true;
            
        // if it does exists and option.merge is true, add it 
        } else if ((undefined !== option && undefined !== option["merge"] 
                     && option["merge"] == true)) {
            this.remove(element[this.idKey]);
            this._.push(element);
        }
        
        // otherwise do nothing
        return false;
    }
    
    /**
     * 
     */
    public addList(list) 
    {
        var self = this;
        $(list).each(function(i, element){
            self.add(element);
        });
    }
    
    /**
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
     * 
     */
    public remove(id:string) : void
    {
        this._ = _.reject(this._, function(element){ 
            return element[this.idKey] === id; 
        });
    }
    
    /**
     * 
     */
    public reset(idKey?:string)
    {        
        this.idKey = undefined === idKey ? "id" : idKey;
        this._ = [];
    }
    
    /**
     * 
     */
    public size() 
    {
        return _.size(this._);
    }
}
