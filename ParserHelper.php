<?php

/**
 * This file is part of the {@link http://ontowiki.net OntoWiki} project.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @package Extensions
 */

/**
 * Helper class for the chart library parsers. This class provides functions to 
 * retrieve all registered parsers and their class objects.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Tom-Michael Hesse <tommichael.hesse@googlemail.com>
 */
class ParserHelper {
    
    /**
     * Holds all parser names of the registered and thereby enabled parsers
     * of the component.
     * @var array The parser names of the registered parsers of the component:
     * 'parserClass' => 'parserName' 
     */
    private $_parserNames = array();
    
    /**
     * Initializes the parser helper with the parser names.
     * @param type $parserNames The parser names registered for the component:
     * 'parserClass' => 'parserName'
     */
    public function __construct($parserNames) {
        
        //set the parser names to the object
        $this->_parserNames = $parserNames;
        
        //include all parser class files
        foreach(array_keys($parserNames) as $parser) {
            
            require_once $parser.'.php';
        }
    }
    
    /**
     * Returns one specific parser object identified by the name. The parser is
     * created to work with the chart object given. Moreover a plugin list and
     * a translator are passed that can be used by the parser object.
     * @param string $name The parser class to create an object of
     * @param Chart $chart The chart object to create the parser for
     * @param array $addons The plugin class names:
     * 'pluginClass' => boolean
     * @param translate $translate The translate-object where the labels for the
     * parser and plugin output can be retrieved
     * @return Parser The parser object created with the given parameters 
     */
    public function getParser($name, $chart, $addons, $translate) {
        
        return new $name($chart, $addons, $translate);
    }
    
    /**
     * Returns all applicable parsers for the given chart type.
     * @param string $chartType The name of the chart type to retrieve the parsers
     * for
     * @return array A list of all applicable parser for the given chart type:
     * 'parserClass' => 'parserName' 
     */
    public function getParserNames($chartType) {
        
        $result = array();
        
        foreach($this->_parserNames as $parser => $name) {
            $types = $parser::getSupportedChartTypes();
            if(in_array($chartType, $types)) {
                $result[$parser] = $name;
            }
        }   
                
        return $result;
    }
}

?>
