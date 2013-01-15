/// <reference path="..\..\..\declaration\libraries\jquery.d.ts" />
/// <reference path="..\..\..\declaration\libraries\Underscore.d.ts" />

declare var cubeVizIndex:CubeViz_View_Application;

class View_CubeVizModule_Footer extends CubeViz_View_Abstract {
        
    constructor(attachedTo:string, app:CubeViz_View_Application) 
    {
        super("View_CubeVizModule_Footer", attachedTo, app);
        
        // publish event handlers to application:
        // if one of these events get triggered, the associated handler will
        // be executed to handle it
        this.bindGlobalEvents([
            {
                name:    "onAfterChange_selectedDSD",
                handler: this.onAfterChange_selectedDSD
            },
            {
                name:    "onChange_selectedDS",
                handler: this.onChange_selectedDS
            },
            {
                name:    "onStart_application",
                handler: this.onStart_application
            }
        ]);
    }
    
    /**
     *
     */
    public changePermaLinkButton() 
    {
        // Open perma link menu and show link
        var value:string = "";
        
        // If no buttonVal is set, we see the Permalink button,
        // so transform it to see the link
        if(true == _.isUndefined(this.collection.get("buttonVal"))) {
            // remember old perma link button label, because of the language
            this.collection.add({
                id: "buttonVal", 
                value: $("#cubeviz-footer-permaLinkButton").attr("value").toString()
            });
            this.showLink(">>");
            
        // We see the link, so transform it back to the Permalink button,
        // we saw before.
        } else {
            value = this.collection.get("buttonVal").value;
            this.collection.remove("buttonVal");
            this.closeLink(value);
        }
    }
    
    /**
     *
     */
    public closeLink(label:string) {
        $("#cubeviz-footer-permaLinkMenu").fadeOut ( 
            450,
            function () {
                $("#cubeviz-footer-permaLinkButton")
                    .animate({width:75}, 450)
                    .attr("value", label);
            }
        );
    }
    
    /**
     *
     */
    public initialize() 
    {        
        this.render();
    }
    
    /**
     *
     */
    public onChange_selectedDS()
    {
        this.onAfterChange_selectedDSD();
    }
    
    /**
     *
     */
    public onAfterChange_selectedDSD() 
    {
        // Close permaLink button if it is still open
        if(false === _.isUndefined(this.collection.get("buttonVal"))){
            this.changePermaLinkButton();
        }
    }
    
    /**
     *
     */
    public onClick_permaLinkButton(event) 
    {        
        // change perma link button
        this.changePermaLinkButton();
    }
    
    /**
     *
     */
    public onClick_showVisualization(event) 
    {
        var self = this;
        
        // if module + indexAction stuff was loaded
        if(true === cubeVizApp._.backend.uiParts.index.isLoaded) {
            
            this.triggerGlobalEvent("onReRender_visualization");
            
        // if you are only in the module
        } else {
            
            if(false === cubeVizApp._.backend.uiParts.index.isLoaded) {
                DataCube_Observation.loadAll(this.app._.backend.dataHash, this.app._.backend.url,
                    function(newEntities){
                        // save new observations
                        self.app._.data.retrievedObservations = newEntities;
                
                        // update link code
                        CubeViz_ConfigurationLink.save(
                            self.app._.backend.url,
                            self.app._.data,
                            "data",
                            function(updatedDataHash){            
                                // refresh page and show visualization for the latest linkCode
                                window.location.href = self.app._.backend.url
                                    + "?m=" + encodeURIComponent (self.app._.backend.modelUrl)
                                    + "&cv_dataHash=" + updatedDataHash
                                    + "&cv_uiHash=" + self.app._.backend.uiHash;
                            }
                        );
                    }
                );
            } else {
                // update link code
                CubeViz_ConfigurationLink.save(
                    this.app._.backend.url,
                    this.app._.data,
                    "data",
                    function(updatedDataHash){            
                        // refresh page and show visualization for the latest linkCode
                        window.location.href = self.app._.backend.url
                            + "?m=" + encodeURIComponent (self.app._.backend.modelUrl)
                            + "&cv_dataHash=" + updatedDataHash
                            + "&cv_uiHash=" + self.app._.backend.uiHash;
                    }
                );
            }
        }
    }
    
    /**
     *
     */
    public onStart_application() 
    {
        this.initialize();
    }
    
    /**
     *
     */
    public render() 
    {
        // Delegate events to new items of the template
        this.bindUserInterfaceEvents({
            "click #cubeviz-footer-permaLinkButton": this.onClick_permaLinkButton,
            "click #cubeviz-footer-showVisualizationButton": this.onClick_showVisualization
        });
        
        return this;
    }
    
    /**
     *
     */
    public showLink(label:string) 
    {
        var self = this;
        
        $("#cubeviz-footer-permaLinkButton")
            .attr ( "value", label)
            .animate(
                { width: 31 }, 
                450, 
                "linear",
                function() {                        
                    var position = $("#cubeviz-footer-permaLinkButton").position();
            
                    $("#cubeviz-footer-permaLinkMenu")
                        .css ("top", position.top + 2)
                        .css ("left", position.left + 32);
                        
                    // build link to show later on
                    var link = self.app._.backend.url
                               + "?m=" + encodeURIComponent (self.app._.backend.modelUrl)
                               + "&cv_dataHash=" + self.app._.backend.dataHash
                               + "&cv_uiHash=" + self.app._.backend.uiHash;
                        
                    var url = $("<a></a>")
                        .attr ("href", link)
                        .attr ("target", "_self")
                        .html ($("#cubeviz-footer-permaLink").html ());
                        
                    $("#cubeviz-footer-permaLinkMenu")
                        .animate({width:"toggle"},450);
                    
                    $("#cubeviz-footer-permaLink")
                        .show()
                        .html(url);
                }
        ); 
    }
}
