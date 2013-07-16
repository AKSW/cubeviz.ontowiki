// Typing for the d3js

interface D3js { 
    
    layout: any;
    
    append (selector:string): any;
    pack (): any;
    select (selector:string): D3js;
}
declare var d3: D3js;
