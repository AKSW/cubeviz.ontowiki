<?php
/**
 * This file is part of the {@link http://ontowiki.net OntoWiki} project.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @package Extensions
 */

/**
 * The superclass-file containing the class skeleton for this AddOn
 */
require_once 'ParserAddOn.php';

/**
 * One addon for the HighCharts parser that enables various options that can be
 * set adapting the HighCharts output in the chart object. The addon is mostly
 * working with manipulating the JavaScript processing of the chart object by
 * adapting the JSON container configuring the library workflow.
 * 
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Tom-Michael Hesse <tommichael.hesse@googlemail.com>
 */
class AttributeConfigurationHighChartsParserAddOn extends ParserAddOn {
    
    /**
     * Holds the chart type translations for the HighCharts library
     * @var array The string array with the mapping of the chart names:
     * 'chartType' => 'highChartsName' 
     */
    private $chartTypes = array('bar' => 'column', 
                                'pie' => 'pie', 
                                'line' => 'line', 
                                'area' => 'area', 
                                'splines' => 'spline', 
                                'scatterplot' => 'scatter',
                                'table' => 'table');
    
    /**
     * Initializes the addon object and sets all internal data for further use,
     * i.e. the chart type and object as well as the translator. Here the type
     * of the chart object is explicitly set as a string because it holds the 
     * name of the JS object of the chart.
     * @param string $chartType The name string of the chart type to handle
     * @param translate $translate The translate object for any GUI output
     * @param mixed $chartObject The chart object to deal with, can be a string
     * name for JavaScript objects or a real PHP object depending on the type
     * of library and their implementation
     * @see ParserAddOn::__construct()
     */
    public function __construct($chartType, $translate, $chartObject) {
        
        //load the basic addon variables
        parent::__construct($chartType, $translate, (string) $chartObject);
    
    }
    
    /**
     * Returns the HTML output of the addon to be plugged into the div containers
     * created in the corresponding parser object.
     * @return string The HTML code as a string 
     * @see ParserAddOn::retrieveHTMLOutput()
     */
    public function retrieveHTMLOutput() {
        
        //prepare the result output parts in html and script code
        $i = 0;
        
        $scriptPart = '<script type="text/javascript">';
        
        $htmlPart = '<form name="formAttributeConfiguration" action="">
                     <ol class="bullets-none separated">';
        
        //prepare the script code for plugin
        $scriptPart .= '
            
                $(document).ready(

                function initializeAddOn() {
                
                var extremes = '.$this->_chartObject.'.yAxis[0].getExtremes();
                var options = '.$this->_chartObject.'.options;
                var optionsForm = document.forms["formAttributeConfiguration"];
                
                if(optionsForm.elements["chartTitle"]) {
                optionsForm.elements["chartTitle"].value = options.title.text;
                }
                
                if(optionsForm.elements["chartSubtitle"]) {
                optionsForm.elements["chartSubtitle"].value = options.subtitle.text;
                }
                
                if(optionsForm.elements["creditsText"]) {
                optionsForm.elements["creditsText"].value = options.credits.text;
                }
                
                if(optionsForm.elements["creditsLink"]) {
                optionsForm.elements["creditsLink"].value = options.credits.link;
                }

                if(optionsForm.elements["yMinimum"]) {
                optionsForm.elements["yMinimum"].value = extremes["min"];
                }
                
                if(optionsForm.elements["yMaximum"]) {
                optionsForm.elements["yMaximum"].value = extremes["max"];
                }
                
                if(optionsForm.elements["areaThreshold"]) {
                optionsForm.elements["areaTreshold"].value = options.plotOptions.area.threshold;
                }
                
                });
                
                function initializeAddOn() {
                
                var extremes = '.$this->_chartObject.'.yAxis[0].getExtremes();
                var options = '.$this->_chartObject.'.options;
                var optionsForm = document.forms["formAttributeConfiguration"];
                
                if(optionsForm.elements["chartTitle"]) {
                optionsForm.elements["chartTitle"].value = options.title.text;
                }
                
                if(optionsForm.elements["chartSubtitle"]) {
                optionsForm.elements["chartSubtitle"].value = options.subtitle.text;
                }
                
                if(optionsForm.elements["creditsText"]) {
                optionsForm.elements["creditsText"].value = options.credits.text;
                }
                
                if(optionsForm.elements["creditsLink"]) {
                optionsForm.elements["creditsLink"].value = options.credits.link;
                }

                if(optionsForm.elements["yMinimum"]) {
                optionsForm.elements["yMinimum"].value = extremes["min"];
                }
                
                if(optionsForm.elements["yMaximum"]) {
                optionsForm.elements["yMaximum"].value = extremes["max"];
                }
                
                if(optionsForm.elements["areaThreshold"]) {
                optionsForm.elements["areaTreshold"].value = options.plotOptions.area.threshold;
                }
                
                }

                function updateChart() {
            
                var optionsForm = document.forms["formAttributeConfiguration"];
                var options = '.$this->_chartObject.'.options;
                
                if(optionsForm.elements["stacking"]) {
                if(optionsForm.elements["stacking"].value != "null") {
                options.plotOptions.'.
                $this->chartTypes[$this->_chartType].
                '.stacking = optionsForm.elements["stacking"].value;
                }
                else {
                options.plotOptions.'.
                $this->chartTypes[$this->_chartType].
                '.stacking = null;
                }
                }
                
                if(optionsForm.elements["elementShadow"]) {
                if(optionsForm.elements["elementShadow"].value != "true") {
                options.plotOptions.'.
                $this->chartTypes[$this->_chartType].
                '.shadow = false;
                }
                else {
                options.plotOptions.'.
                $this->chartTypes[$this->_chartType].
                '.shadow = true;
                }
                }
                
                if(optionsForm.elements["elementDataLabels"]) {
                var value = false;
                if(optionsForm.elements["elementDataLabels"].value == "true") value = true;
                if((options.chart.defaultSeriesType != "bar") 
                    && (options.chart.defaultSeriesType != "column")) {
                options.plotOptions.'.
                $this->chartTypes[$this->_chartType].
                '.dataLabels.enabled = value;
                }
                else {
                options.plotOptions.series.dataLabels.enabled = value;
                }
                }

                if(optionsForm.elements["layout"]) {
                if(optionsForm.elements["layout"].value != "horizontal") {
                options.legend.layout = "vertical";
                options.legend.align = "left";
                options.legend.verticalAlign = "top";
                options.legend.floating = true;
                options.legend.width = null;
                options.legend.x = 100;
                options.legend.y = 70;
                }
                else {
                options.legend.layout = "horizontal";
                options.legend.align = "center";
                options.legend.verticalAlign = "bottom";
                options.legend.floating = false;
                options.legend.width = null;
                options.legend.x = 15;
                options.legend.y = 0;
                }
                }
                
                if(optionsForm.elements["legendShadow"]) {
                if(optionsForm.elements["legendShadow"].value != "true") {
                options.legend.shadow = false;
                }
                else {
                options.legend.shadow = true;
                }
                }

		if(optionsForm.elements["legendShow"]) {
                if(optionsForm.elements["legendShow"].value != "true") {
                options.legend.enabled = false;
                }
                else {
                options.legend.enabled = true;
                }
                }             
                
                if(optionsForm.elements["xLabelRotation"]) {
                options.xAxis.labels.rotation = optionsForm.elements["xLabelRotation"].value;
                    if(optionsForm.elements["xLabelRotation"].value < 0) {
                    options.xAxis.labels.align = "right";
                    optionsForm.elements["xLabelAlign"].options[2].selected = true;
                    optionsForm.elements["xLabelAlign"].disabled = true;
                    }
                    if(optionsForm.elements["xLabelRotation"].value > 0) {
                    options.xAxis.labels.align = "left";
                    optionsForm.elements["xLabelAlign"].options[1].selected = true;
                    optionsForm.elements["xLabelAlign"].disabled = true;
                    }
                    if(optionsForm.elements["xLabelRotation"].value == 0) {
                    optionsForm.elements["xLabelAlign"].disabled = false;
                    }
                }
                
                if(optionsForm.elements["xLabelAlign"]) {
                options.xAxis.labels.align = optionsForm.elements["xLabelAlign"].value;
                }
                
                if(optionsForm.elements["xLabelStaggering"]) {
                options.xAxis.labels.staggerLines = optionsForm.elements["xLabelStaggering"].value;
                }
                
                if(optionsForm.elements["yLabelAlign"]) {
                options.yAxis.title.align = optionsForm.elements["yLabelAlign"].value;
                }
                
                if(optionsForm.elements["lineDashStyle"]) {
                options.plotOptions.'.
                $this->chartTypes[$this->_chartType].
                '.dashStyle = optionsForm.elements["lineDashStyle"].value;
                }
                
                if(optionsForm.elements["lineWidth"]) {
                options.plotOptions.'.
                $this->chartTypes[$this->_chartType].
                '.lineWidth = optionsForm.elements["lineWidth"].value;
                options.plotOptions.'.
                $this->chartTypes[$this->_chartType].
                '.states.hover.lineWidth = optionsForm.elements["lineWidth"].value;
                }
                
                if(optionsForm.elements["areaOpacity"]) {
                options.plotOptions.area.fillOpacity = optionsForm.elements["areaOpacity"].value;
                }
                
                if(optionsForm.elements["barStyle"]) {
                options.chart.defaultSeriesType = optionsForm.elements["barStyle"].value;
                if(optionsForm.elements["barStyle"].value == "bar") {
                options.xAxis.labels.align = "right";
                optionsForm.elements["xLabelAlign"].value = "right";
                optionsForm.elements["xLabelAlign"].disabled = true;
                }
                else {
                optionsForm.elements["xLabelAlign"].disabled = false;
                }
                }
                
                if(optionsForm.elements["barBorderWidth"]) {
                options.plotOptions.series.borderWidth = optionsForm.elements["barBorderWidth"].value;
                }
                
                if(optionsForm.elements["barBorderRadius"]) {
                options.plotOptions.series.borderRadius = optionsForm.elements["barBorderRadius"].value;
                }

                if(optionsForm.elements["pieSize"]) {
                options.plotOptions.pie.size = optionsForm.elements["pieSize"].value;
                }
                
                if(optionsForm.elements["pieInnerSize"]) {
                options.plotOptions.pie.innerSize = optionsForm.elements["pieInnerSize"].value;
                }
                
                if(optionsForm.elements["pieSlicedOffset"]) {
                options.plotOptions.pie.slicedOffset = optionsForm.elements["pieSlicedOffset"].value;
                }
                
                if(optionsForm.elements["creditsShow"]) {
                if(optionsForm.elements["creditsShow"].value == "true") {
                options.credits.enabled = true;
                }
                else {
                options.credits.enabled = false;
                }
                }
                
                $(document).ready(function() { '.$this->_chartObject.
                ' = new Highcharts.Chart(options); });
                $(document).ready(initializeAddOn());
                }
                
                function setYValues() {
                
                var optionsForm = document.forms["formAttributeConfiguration"];
                var options = '.$this->_chartObject.'.options;

                if(optionsForm.elements["yMaximum"]) {
                options.yAxis.max = optionsForm.elements["yMaximum"].value;
                }
                
                if(optionsForm.elements["yMinimum"]) {
                options.yAxis.min = optionsForm.elements["yMinimum"].value;
                }

                options.legend.width = null;
                $(document).ready(function() { '.$this->_chartObject.
                ' = new Highcharts.Chart(options); });
                }
                
                function setChartTitle() {
                
                var optionsForm = document.forms["formAttributeConfiguration"];
                var options = '.$this->_chartObject.'.options;

                options.title.text = optionsForm.elements["chartTitle"].value;
                
                options.subtitle.text = optionsForm.elements["chartSubtitle"].value;

                options.legend.width = null;
                $(document).ready(function() { '.$this->_chartObject.
                ' = new Highcharts.Chart(options); });
                }
                
                function setChartCredits() {
                
                var optionsForm = document.forms["formAttributeConfiguration"];
                var options = '.$this->_chartObject.'.options;

                options.credits.text = optionsForm.elements["creditsText"].value;
                
                options.credits.href = optionsForm.elements["creditsLink"].value;
                
                options.legend.width = null;
                $(document).ready(function() { '.$this->_chartObject.
                ' = new Highcharts.Chart(options); });
                }
                
                function setAreaValues() {
                
                var optionsForm = document.forms["formAttributeConfiguration"];
                var options = '.$this->_chartObject.'.options;

                options.plotOptions.area.threshold = optionsForm.elements["areaThreshold"].value;
                
                options.legend.width = null;
                $(document).ready(function() { '.$this->_chartObject.
                ' = new Highcharts.Chart(options); });
                }';
        
        if($this->_chartType == 'bar' || $this->_chartType == 'line' || 
                $this->_chartType == 'splines' || $this->_chartType == 'area' || 
                $this->_chartType == 'scatterplot') {
           //add the chart elements options
           $htmlPart .= '<li class="'.($i % 2 == 0 ? 'even' : 'odd').'"><table border="0"><tr><td>
                <b>'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn title chart elements').
                   '</b>
                &nbsp;&nbsp;&nbsp;'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text stacking').': 
                <select name="stacking" size="1" onchange="javascript:updateChart();" 
                style="min-width:8em;width:8em;">
                <option value="null" selected="selected">'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text disabled').
                   '</option>
                <option value="normal">'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text normal').
                   '</option>
                <option value="percent">'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text percent').
                   '</option></select>
                &nbsp;&nbsp;&nbsp;'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text shadow').': 
                <select name="elementShadow" size="1" onchange="javascript:updateChart();" 
                style="min-width:8em;width:8em;">
                <option value="true" selected="selected">'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text enabled').
                   '</option>
                <option value="false">'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text disabled').
                   '</option></select>
                &nbsp;&nbsp;&nbsp;'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text data labels').': 
                <select name="elementDataLabels" size="1" onchange="javascript:updateChart();" 
                style="min-width:8em;width:8em;">
                <option value="false" selected="selected">'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text disabled').
                   '</option>
                <option value="true">'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text enabled').
                   '</option></select>
                </td></tr></tr></table></li>';
           $i++;
        
           //add the legend options
           $htmlPart .= '<li class="'.($i % 2 == 0 ? 'even' : 'odd').'"><table border="0"><tr><td>
                <b>'
                   .$this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn title chart legend').
                   '</b>
                &nbsp;&nbsp;&nbsp;'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text legend show').': 
                <select name="legendShow" size="1" onchange="javascript:updateChart();" 
                style="min-width:8em;width:8em;">
                <option value="true" selected="selected">'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text enabled').
                   '</option>
                <option value="false">'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text disabled').
                   '</option></select>
                &nbsp;&nbsp;&nbsp;'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text layout').': 
                <select name="layout" size="1" onchange="javascript:updateChart();" 
                style="min-width:8em;width:8em;">
                <option value="horizontal" selected="selected">'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text horizontal').
                   '</option>
                <option value="vertical">'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text vertical').
                   '</option></select>
                &nbsp;&nbsp;&nbsp;'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text shadow').': 
                <select name="legendShadow" size="1" onchange="javascript:updateChart();" 
                style="min-width:8em;width:8em;">
                <option value="true" selected="selected">'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text enabled').
                   '</option>
                <option value="false">'.
                   $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text disabled').
                   '</option></select></td></tr></table></li>';
            $i++;
        
            //add the xAxis-options for bar and line charts
            $htmlPart .= '<li class="'.($i % 2 == 0 ? 'even' : 'odd').'"><table border="0"><tr><td>
                <b>'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn title chart xaxis').
                    '</b>
                &nbsp;&nbsp;&nbsp;'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text label rotation').': 
                <select name="xLabelRotation" size="1" onchange="javascript:updateChart();" 
                style="min-width:4em;width:4em;">
                <option value="0" selected="selected">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text rotation 0').
                    '</option>
                <option value="-45">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text rotation -45').
                    '</option>
                <option value="-90">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text rotation -90').
                    '</option>
                <option value="45">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text rotation 45').
                    '</option>
                <option value="90">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text rotation 90').
                    '</option></select>
                &nbsp;&nbsp;&nbsp;'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text label align').':  
                <select name="xLabelAlign" size="1" onchange="javascript:updateChart();" 
                style="min-width:8em;width:8em;">
                <option value="center" selected="selected">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text center').
                    '</option>
                <option value="left">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text left').
                    '</option>
                <option value="right">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text right').
                    '</option></select>
                &nbsp;&nbsp;&nbsp;'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text label staggering').': 
                <select name="xLabelStaggering" size="1" onchange="javascript:updateChart();" 
                style="min-width:8em;width:8em;">
                <option value="" selected="selected">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 1 line').
                    '</option>
                <option value="2">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 2 lines').
                    '</option>
                <option value="3">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 3 lines').
                    '</option></select>
                </td></tr></table></li>';
            $i++;
        
            //add the yAxis-options for bar and line charts
            $htmlPart .= '<li class="'.($i % 2 == 0 ? 'even' : 'odd').'"><table border="0"><tr><td>
                <b>'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn title chart yaxis').
                    '</b>
                &nbsp;&nbsp;&nbsp;'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text minimum value').': 
                <input name="yMinimum" value="0" size="10" />
                &nbsp;&nbsp;&nbsp;'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text maximum value').':  
                <input name="yMaximum" value="0" size="10" />
                &nbsp;&nbsp;&nbsp;<a href="javascript:setYValues();">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn link set values').
                    '</a>
                &nbsp;&nbsp;&nbsp;'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text label align').': 
                <select name="yLabelAlign" size="1" onchange="javascript:updateChart();" 
                style="min-width:8em;width:8em;">
                <option value="middle" selected="selected">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text center').
                    '</option>
                <option value="high">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text top').
                    '</option>
                <option value="low">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text bottom').
                    '</option></select>
                </td></tr></table></li>';
            $i++;
        }
        
        if($this->_chartType == 'pie') {
            
            //add the pie plot option configuration
            $htmlPart .= '<li class="'.($i % 2 == 0 ? 'even' : 'odd').'"><table border="0"><tr><td>
                <b>'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn title pie elements').
                    '</b>
                &nbsp;&nbsp;&nbsp;'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text pie size').': 
                <select name="pieSize" size="1" onchange="javascript:updateChart();" 
                style="min-width:4em;width:4em;">
                <option value="90%">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 90%').
                    '</option>
                <option value="75%" selected="selected">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 75%').
                    '</option>
                <option value="50%">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 50%').
                    '</option>
                <option value="25%">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 25%').
                    '</option></select>
                &nbsp;&nbsp;&nbsp;'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text pie inner size').': 
                <select name="pieInnerSize" size="1" onchange="javascript:updateChart();" 
                style="min-width:4em;width:4em;">
                <option value="0" selected="selected">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 0').
                    '</option>
                <option value="25%">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 25%').
                    '</option>
                <option value="50%">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 50%').
                    '</option></select>'.
//                &nbsp;&nbsp;&nbsp;'.
//                $this->translate->_('addon AttributeConfigurationHighChartsParserAddOn text pie sliced offset').': 
//                <select name="pieSlicedOffset" size="1" onchange="javascript:updateChart();" 
//                style="min-width:8em;width:8em;">
//                <option value="0">'.
//                $this->translate->_('addon AttributeConfigurationHighChartsParserAddOn text 0px').
//                '</option>
//                <option value="10" selected="selected">'.
//                $this->translate->_('addon AttributeConfigurationHighChartsParserAddOn text 10px').
//                '</option>
//                <option value="20">'.
//                $this->translate->_('addon AttributeConfigurationHighChartsParserAddOn text 20px').
//                '</option></select>
                '</td></tr></table></li>';
            $i++;
        }
        
        if($this->_chartType == 'line' || $this->_chartType == 'splines' || 
                $this->_chartType == 'area') {
            
            //add the line-options for all charts with lines
            $htmlPart .= '<li class="'.($i % 2 == 0 ? 'even' : 'odd').'"><table border="0"><tr><td>
                <b>'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn title chart line style').
                    '</b>               
                &nbsp;&nbsp;&nbsp;'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text dash style').': 
                <select name="lineDashStyle" size="1" onchange="javascript:updateChart();" 
                style="min-width:8em;width:8em;">
                <option value="Solid" selected="selected">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text solid').
                    '</option>
                <option value="ShortDash">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text short dashed').
                    '</option>
                <option value="ShortDot">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text short dotted').
                    '</option>
                <option value="Dot">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text dotted').
                    '</option>
                <option value="Dash">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text dashed').
                    '</option>
                <option value="LongDash">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text long dashed').
                    '</option>
                <option value="DashDot">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text dash dot').
                    '</option></select>
                &nbsp;&nbsp;&nbsp;'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text line width').': 
                <select name="lineWidth" size="1" onchange="javascript:updateChart();" 
                style="min-width:8em;width:8em;">
                <option value="1">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 1px').
                    '</option>
                <option value="2" selected="selected">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 2px').
                    '</option>
                <option value="3">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 3px').
                    '</option>
                <option value="4">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 4px').
                    '</option>
                <option value="5">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 5px').
                    '</option>
                <option value="6">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 6px').
                    '</option></select>
                </td></tr></table></li>';            
            $i++;
        }
        
        if($this->_chartType == 'bar') {
            
            //add the line-options for all charts with lines
            $htmlPart .= '<li class="'.($i % 2 == 0 ? 'even' : 'odd').'"><table border="0"><tr><td>
                <b>'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn title chart bar style').
                    '</b>               
                &nbsp;&nbsp;&nbsp;'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text bar direction').': 
                <select name="barStyle" size="1" onchange="javascript:updateChart();" 
                style="min-width:8em;width:8em;">
                <option value="column" selected="selected">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text columns').
                    '</option>
                <option value="bar">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text bars').
                    '</option></select>
                &nbsp;&nbsp;&nbsp;'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text border width').': 
                <select name="barBorderWidth" size="1" onchange="javascript:updateChart();" 
                style="min-width:4em;width:4em;">
                <option value="0">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 0px').
                    '</option>
                <option value="1" selected="selected">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 1px').
                    '</option>
                <option value="2">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 2px').
                    '</option>
                <option value="3">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 3px').
                    '</option>
                <option value="4">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 4px').
                    '</option>
                <option value="5">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 5px').
                    '</option>
                <option value="6">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 6px').
                    '</option></select>
                &nbsp;&nbsp;&nbsp;'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text border radius').': 
                <select name="barBorderRadius" size="1" onchange="javascript:updateChart();" 
                style="min-width:4em;width:4em;">
                <option value="0" selected="selected">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 0px').
                    '</option>
                <option value="5">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 5px').
                    '</option>
                <option value="10">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 10px').
                    '</option></select>
                </td></tr></table></li>';            
            $i++;
        }
        
        if($this->_chartType == 'area') {
            
            //add the line-options for all charts with lines
            $htmlPart .= '<li class="'.($i % 2 == 0 ? 'even' : 'odd').'"><table border="0"><tr><td>
                <b>'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn title chart area style').
                    '</b>               
                &nbsp;&nbsp;&nbsp;'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text fill opacity').': 
                <select name="areaOpacity" size="1" onchange="javascript:updateChart();" 
                style="min-width:4em;width:4em;">
                <option value="1.0">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 100%').
                    '</option>
                <option value="0.75" selected="selected">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 75%').
                    '</option>
                <option value="0.50">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 50%').
                    '</option>
                <option value="0.25">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 25%').
                    '</option>
                <option value="0.10">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text 10%').
                    '</option></select>
                &nbsp;&nbsp;&nbsp;'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text area threshold').':  
                <input name="areaThreshold" value="0" size="10" />
                &nbsp;&nbsp;&nbsp;<a href="javascript:setAreaValues();">'.
                    $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn link set values').
                    '</a>
                </td></tr></table></li>';
            $i++;
        }
        
        $htmlPart .= '<li class="'.($i % 2 == 0 ? 'even' : 'odd').'"><table border="0"><tr><td>
                <b>'.
                $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn title chart title').
                '</b>
                &nbsp;&nbsp;&nbsp;'.
                $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text chart title').': 
                <input name="chartTitle" value="0" size="15" />
                &nbsp;&nbsp;&nbsp;'.
                $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text chart subtitle').':  
                <input name="chartSubtitle" value="0" size="15" />
                &nbsp;&nbsp;&nbsp;<a href="javascript:setChartTitle();">'.
                $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn link set values').
                '</a>
                </td></tr></table></li>';
        $i++;
        
        $htmlPart .= '<li class="'.($i % 2 == 0 ? 'even' : 'odd').'"><table border="0"><tr><td>
                <b>'.
                $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn title chart credits').
                '</b>
                &nbsp;&nbsp;&nbsp;'.
                $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text show credits').':
                <select name="creditsShow" size="1" onchange="javascript:updateChart();" 
                style="min-width:8em;width:8em;">
                <option value="false" selected="selected">'.
                $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text disabled').
                '</option>
                <option value="true">'.
                $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text enabled').
                '</option></select>
                &nbsp;&nbsp;&nbsp;'.
                $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text credits text').': 
                <input name="creditsText" value="0" size="15" />
                &nbsp;&nbsp;&nbsp;'.
                $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn text credits link').':  
                <input name="creditsLink" value="0" size="15" />
                &nbsp;&nbsp;&nbsp;<a href="javascript:setChartCredits();">'.
                $this->_translate->_('addon AttributeConfigurationHighChartsParserAddOn link set values').
                '</a>
                </td></tr></table></li>';
        $i++;
                    
        //finish the code
        $scriptPart .= '</script>';
        
        $htmlPart .= '</ol></form>';
        
        return $scriptPart.$htmlPart;
    }
}

?>
