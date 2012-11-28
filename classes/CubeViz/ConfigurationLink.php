<?php
/**
 * This class represents an LinkHandle object
 * Used for handling files in the links/ directory
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov
 * @author Konrad Abicht
 */ 
class CubeViz_ConfigurationLink
{   
	/**
     * Path to the links folder
     */
    protected $_hashDirectory = '';    

	/**
     * filePrefix for hashes
     */
    protected $_filePrefix = 'cubeviz-hash-';
    
    /**
     * Needs to be public to be accessible through json_encode interface
     */
    protected $_links = null;
    
    /**
     * Constructor
     */
    public function __construct($path) {
        $this->_hashDirectory = $path;
        $this->_links = array ();
	}
    
	/**
	 * Read configuration from a json file in links folder
     * @param $linkCode Name of the file (name = hash code)
     * @return boolean
	 */
	public function read($linkCode) {
        
		if (true === file_exists($this->_hashDirectory . $linkCode) ) {
            return file($this->_hashDirectory . $linkCode);
		}
		return false;
	}
	
    /**
     * Writes a given configuration to a file
     */
	public function write($config) {
        // compute hashcode for the given configuration
        $fileName = $this->_filePrefix . $this->generateHash ($config);
		$filePath = $this->_hashDirectory . $fileName;
        				
		if( false == file_exists($filePath) ) {
            
            if ( false === ( $fh = fopen($filePath, 'w') ) ) {
                // can't open the file
                $m = "No write permissions for ". $filePath;
                throw new CubeViz_Exception ( $m );
                return $m;
            }
			
            // write all parameters line by line
			fwrite($fh, json_encode ( $config['cubeVizLinksModule'] ) . "\n"); // CubeViz_Config_Module
			fwrite($fh, json_encode ( $config['uiChartConfig'] ) . "\n"); // cubeVizUIChartConfig
			chmod ($filePath, 0755);
			fclose($fh);
		} 
        
        // return generated hashCode (=fileName)
        return $fileName;
	}
    
    /**
     * 
     */
	
	private function generateHash ($config) {		
		return hash ( 'sha256', json_encode ( $config ) );
	}
}
