class CubeViz_Visualization 
{
    public name:string;
    public supportedClassNames:string[];
    
    /**
     *
     */
    constructor() {}
    
    /**
     *
     */
    public getName() 
    {
        return this.name;
    }
    
    /**
     * Get list of supported class names.
     * @return string[] List of supported class names
     */
    public getSupportedClassNames() : string[] 
    {
        return this.supportedClassNames;
    }
    
    /**
     * Loads an instance of a particular class, if this wrapper is responseable 
     * for it.
     * @param c Full name of the class to load
     * @return CubeViz_Visualization_HighCharts_Chart
     * @throws Error If this wrapper is not responseable for given c
     */
    public load (c:string) : any 
    {
        if(true === this.isResponsibleFor(c)) {
            var chartInstance:any;
            eval ("chartInstance = new " + c +"();");
            return chartInstance;
        }
        throw new Error ( "Invalid c (" + c + ") given!" );
    }
    
    /**
     * Checks if a given class name is managed by this visualization library wrapper.
     * @param className Name of the class to check
     * @return bool True if this wrapper is responseable for it, false otherwise.
     */
    public isResponsibleFor(className:string) : bool 
    {
        return _.contains(
            this.getSupportedClassNames(),
            className
        );
    }
}
