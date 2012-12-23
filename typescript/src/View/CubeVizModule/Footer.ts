/// <reference path="..\..\..\DeclarationSourceFiles\libraries\jquery.d.ts" />
/// <reference path="..\..\..\DeclarationSourceFiles\libraries\Underscore.d.ts" />

/**
 * Declare variables that are used in the HTML too
 */
declare var CubeViz_Links_Module: any;
declare var CubeViz_UI_ChartConfig: any;

class View_CubeVizModule_Footer extends View_Abstract {
        
    constructor(attachedTo:string, viewManager:View_Manager) 
    {
        super("View_CubeVizModule_Footer", attachedTo, viewManager);
    }
    
    /**
     *
     */
    public changeLink() 
    {
        // Open perma link menu and show link
        if ( undefined == $("#cubeviz-footer-permaLinkButton").data ( "oldValue" ) ) {
            
            $("#cubeviz-footer-permaLinkButton")
                .data ( "oldValue", $("#cubeviz-footer-permaLinkButton").attr ("value").toString() )
                .attr ( "value", ">>")
                .animate(
                    { width: 31 }, 
                    450, 
                    "linear",
                    function() {                        
                        var position = $("#cubeviz-footer-permaLinkButton").position();
                
                        $("#cubeviz-footer-permaLinkMenu")
                            .css ( "top", position.top + 2 )
                            .css ( "left", position.left + 32 );
                            
                        // build link to show later on
                        var link = CubeViz_Links_Module.cubevizPath
                                   + "?m=" + encodeURIComponent (CubeViz_Links_Module.modelUrl)
                                   + "&lC=" + CubeViz_Links_Module.linkCode;
                            
                        var url = $("<a></a>")
                            .attr ( "href", link )
                            .attr ( "target", "_self" )
                            .html ( $("#cubeviz-footer-permaLink").html () );
                            
                        $("#cubeviz-footer-permaLinkMenu").animate({width:'toggle'},450);
                        
                        $("#cubeviz-footer-permaLink")
                            .show()
                            .html ( url );
                    }
                );        
        
        // Close perma link menu
        } else {
            
            $("#cubeviz-footer-permaLinkMenu").fadeOut ( 
                450,
                function () {
                    $("#cubeviz-footer-permaLinkButton")
                        .animate({width:75}, 450)
                        .attr ( "value", $("#cubeviz-footer-permaLinkButton").data("oldValue").toString())
                        .data ( "oldValue", undefined );
                }
            );
        }
    }
    
    /**
     *
     */
    public initialize() 
    {        
        var self = this;
        this.render();
    }
    
    /**
     *
     */
    public onClick_permaLinkButton() 
    {
        var self = this;
        
        // if selectedComponents.dimension was null, there must be an change event
        // for DSD or DS, so force recreation of a new linkcode
        CubeViz_Links_Module.linkCode = null;
        
        CubeViz_ConfigurationLink.saveToServerFile ( 
            CubeViz_Links_Module,
            CubeViz_UI_ChartConfig,
            function ( newLinkCode ) {
                // Save new generated linkCode
                CubeViz_Links_Module.linkCode = newLinkCode;
                // TODO handle case if it was not possible to 
                //      generate a new linkcode
                
                // change perma link button
                self.changeLink();
            }
        );
    }
    
    /**
     *
     */
    public render() 
    {
        // Delegate events to new items of the template
        this.delegateEvents({
            "click #cubeviz-footer-permaLinkButton" : this.onClick_permaLinkButton
        });
        
        return this;
    }
}
