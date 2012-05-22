<?php

/**
 * This file is part of the {@link http://ontowiki.net OntoWiki} project.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @package Extensions
 */

/**
 * General class for parsers enabling chart libraries in the component. This parser
 * class contains general implementations for the initialization and processing
 * of a parser as well as for the AddOn-system with the loading and default processing
 * of all addons registered for a certain parser.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Tom-Michael Hesse <tommichael.hesse@googlemail.com>
 */
abstract class Parser {
    
    /**
     * Holds the chart object for the parser to work with
     * @var Chart The chart object containing all chart data 
     */
    protected $_chart;
    
    /**
     * Holds all addons registered for the parser
     * @var array The addon list:
     * 'addonClass' => boolean
     */
    protected $_addons = array();
    
    /**
     * Holds all addon class object instantiated by the parser
     * @var array The addon object list:
     * 'addonClass' => addonObject 
     */
    protected $_addonObjects = array();
    
    /**
     * Holds the translate object for this parser
     * @var translate The translate object for this parser 
     */
    protected $_translate = null;
    
    /**
     * Holds the chart object on which the parser operates
     * @var mixed The chart object, depending on the library this can be a PHP
     * object for PHP-based processing or a string indicating a JavaScript reference 
     */
    protected $_chartObject = null;
    
    /**
     * Holds the supported chart types for this parser
     * @var array The supported chart types by this parser as a string array of
     * chart type names 
     */
    static protected $_supportedChartTypes = array();
    
    /**
     * Initializes the parser and creates the basic references on the translate
     * object, the chart and the addons.
     * @param Chart $chart The chart for this parser to operate with
     * @param array $addons The array containing the class names of all registered
     * addons for this parser
     * @param translate $translate The translate object for the output translation
     * of the parser 
     */
    public function  __construct($chart, $addons, $translate) {
        
        //set the chart object
        $this->_chart = $chart;
        
        //set the translation object
        $this->_translate = $translate;
        
        //load all registered plugins for this parser
        foreach($addons as $addon => $status) {
            
            require_once $addon.'.php';
            
            $this->_addons[$addon] = $status;
        }
        
    }
    
    /**
     * Returns the HTML output code of the parser for the graphical output of
     * the chart. This method has to be overwritten in the concrete parser classes.
     * @return string The HTML code as a string  
     */
    public function retrieveChartResult() {
        
        return '';
    }
    
    /**
     * Returns the code (JS script links...) which imports the needed libraries
     * for this parser.
     * @return The code with the needed library links 
     */
    public function retrieveImportCode() {
        
        return '';
    }
    
    /**
     * Returns the code (HTML/JS/...) needed for the interpretation and execution
     * of the chart result if the OntoWiki framework is not used for viewing.
     * This method is called by the service action of the component.
     * @return string The code needed to run the result code of the parser without
     * the OntoWiki framework 
     */
    public function retrieveServiceCode() {
        
        return '';
    }
    
    /**
     * Returns the HTML output code of the registered addons for this parser.
     * This method contains a general implementation that should not be overwritten
     * by child classes due to the homogenity of the GUI.
     * @return string The HTML code as a string 
     */
    public function retrieveAddOnCode() {
        
        //if no addon objects are created so far, return an empty string
        if(empty($this->_addonObjects)) return '';
        else {
            
            $result = '';
            //iterate through all addon objects to retrieve their output code
            foreach($this->_addonObjects as $addon => $addonObject) {
                
                $addonCode = $addonObject->retrieveHTMLOutput();
                
                if($addonCode != '') {
                    //build a div and a link for minimizing and maximizing the 
                    //div-box in which the addon code is stored
                    $result .= '<br /><b><a href="javascript:var result = 
                            $(\'#chartPlugin'.$addon.'\').toggle();"># '.
                            $this->_translate->_('addon '.$addon.' title '.$addon).
                            '</a></b><br />
                            <div id="chartPlugin'.$addon.'" style="margin:10px;
                                overflow:auto;border: 1px solid grey;">
                                '.$addonCode.'
                            </div><br />';
                }
            }
            
            return (empty($result) === true ? '' : 
                substr($result, 0, strlen($result)-6));
        }
    }
    
    /**
     * Creates all addon objects in this parser and stores them internally.
     */
    public function createAllAddOnObjects() {
        
        foreach($this->_addons as $addon => $status) {
            $this->createAddOnObject($addon);
        }
    }
    
    /**
     * Creates a certain addon object identified by its name and stores it
     * internally.
     * @param string $name The name of the addon object to create
     */
    public function createAddOnObject($name) {
        
        $this->_addonObjects[$name] = new $name($this->_chart->getType(), 
                $this->_translate, $this->_chartObject);
    }
    
    /**
     * Returns the names of all supported chart types by this parser.
     * @return array The supported chart types by this parser as a string array 
     */
    public static function getSupportedChartTypes() {
        
        return static::$_supportedChartTypes;
    }
}

?>
