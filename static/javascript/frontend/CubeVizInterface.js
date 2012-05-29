$(document).ready(function(){
    
    /**
     * Click the overlay and all dialogs will be closed, the overlay too. 
     */
    $("#site-overlay").click (function () {
        org.aksw.cubeViz.Index.Main.closeAllDialogs ();
        $("#site-overlay").hide ();
    });
    
    /** SIDEBAR */
    
    $("#sidebar-reactivate").hide();

    $("#sidebar-right-arrow").click (function () {
        $("#sidebar-right-arrow").fadeOut('slow', function() {
            
            $("#container").fadeOut ( 'slow' );
            
            $('#sidebar-left').fadeIn ('slow', function () {
                
                $("#content").css ( 'left', 210 );
                
                $("#content").html ('<div id="container"></div>');
                
                    chart = new Highcharts.Chart(chartParameter);
                
                    $("#container").fadeIn ( 2000, function () {
                
                        $("#sidebar-left-arrow").fadeIn('slow');
                        
                    });
            });
        });
    });

    $("#sidebar-left-arrow").click (function () {
        $('#sidebar-left').fadeOut('slow', function() {
            $("#sidebar-left-arrow").fadeOut ('slow', function () {
                
                $("#container").fadeOut ( 'slow', function () { 
                
                    $("#content").css ( 'left', 20 );
                    
                    $("#content").html ('<div id="container"></div>');
                    
                    chart = new Highcharts.Chart(chartParameter);
                    
                    $("#container").fadeIn ( 3000, function () { 
                        $("#sidebar-right-arrow").fadeIn('slow');
                    });
                });
            });
        });
    });
    
    // -----------------------------------------------------
    // chart selection
    var sidebarLeftChartSelectionAreaOpen = false;
    
    $("#sidebar-left-chart-selection-arrow").click(function(){ 
        $('#sidebar-left-chart-selection-area').animate({height: 'toggle'}); 
        $('html,body').animate({scrollTop: $("#sidebar-left-chart-selection-area").offset().top-46},'slow');
        
        sidebarLeftChartSelectionAreaOpen = true;
        
        // toggle other sections too
        if ( true == sidebarLeftLibraryOptionsAreaOpen ) {
            $('#sidebar-left-library-options-area').animate({height: 'toggle'}); 
        }
    }); 
    
    $("#sidebar-left-chart-selection-area").hide();
    
    // -----------------------------------------------------
    // library options
    var sidebarLeftLibraryOptionsAreaOpen = false;
    
    $("#sidebar-left-library-options-arrow").click(function(){ 
        $('#sidebar-left-library-options-area').animate({height: 'toggle'}); 
        $('html,body').animate({scrollTop: $("#sidebar-left-library-options-area").offset().top-46},'slow');
        
        sidebarLeftLibraryOptionsAreaOpen = true;
        
        // toggle other sections too
        if ( true == sidebarLeftChartSelectionAreaOpen ) {
            $('#sidebar-left-chart-selection-area').animate({height: 'toggle'}); 
        }
    }); 
    
    $('#sidebar-left-library-options-area').hide();
    
    
    /**
     * TODO sorry for that, refactor this, its only for the presentation!
     * Dropdown for language selector
     */

    $("#edit-lang-dropdown-select_child").fadeOut(0);
    var langDropdownClickedArrow = false;

    $("#edit-lang-dropdown-select_arrow").click (function(){
        $("#edit-lang-dropdown-select_child").slideToggle ( 
            300, function () { }
        );
    });
    
});
