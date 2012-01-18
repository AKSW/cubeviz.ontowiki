<?php

/**
 * This file is part of the {@link http://ontowiki.net OntoWiki} project.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @package Extensions
 */

/**
 * General class for parser addons that provides the major function skeleton
 * which is used by the parser objects to interact with the addon. All methods
 * have to be overwritten in a concrete implementation.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Tom-Michael Hesse <tommichael.hesse@googlemail.com>
 */
abstract class ParserAddOn {
    
    /**
     * Holds the chart type passed by the parser to the addon object
     * @var string The chart type for the addon to handle 
     */
    protected $_chartType = '';
    
    /**
     * Holds the translator for the GUI output translation
     * @var translate The translate object for the output texts 
     */
    protected $_translate = null;
    
    /**
     * Holds the chart object for the addon to operate on
     * @var Chart The chart object on which the addon can operate 
     */
    protected $_chartObject = null;
    
    /**
     * Initializes the addon object and sets all internal data for further use,
     * i.e. the chart type and object as well as the translator.
     * @param string $chartType The name string of the chart type to handle
     * @param translate $translate The translate object for any GUI output
     * @param mixed $chartObject The chart object to deal with, can be a string
     * name for JavaScript objects or a real PHP object depending on the type
     * of library and their implementation
     */
    public function __construct($chartType, $translate, $chartObject) {
        
        $this->_chartType = $chartType;
        
        $this->_translate = $translate;
        
        $this->_chartObject = $chartObject;
    
    }
    
    /**
     * Returns the HTML output of the addon to be plugged into the div containers
     * created in the corresponding parser object.
     * @return string The HTML code as a string 
     */
    public function retrieveHTMLOutput() {
        
        return '';
    }
    
    /**
     * Returns the manipulated PHP object representing the chart if such an object
     * exists due to the library implementation.
     * @return mixed The chart object with the user changes via the addon 
     */
    public function retrieveAdaptedContainer() {
        
        return null;
    }
}

?>
