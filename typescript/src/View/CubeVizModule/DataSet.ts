/// <reference path="..\..\..\DeclarationSourceFiles\views\CubeVizModule.d.ts" />

/// <reference path="..\..\..\DeclarationSourceFiles\libraries\jquery.d.ts" />
/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Underscore.d.ts" />
/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Backbone.d.ts" />

declare var CubeViz_Links_Module: any;

class View_CubeVizModule_DataSet extends View_Abstract {
        
    constructor() 
    {
        super();
        
        this.id = "DataStructureDefintionView";
        this.attachedTo = "#cubviz-dataStructureDefinition-container";
    }
}
