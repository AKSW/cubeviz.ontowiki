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
    public function __construct($path) 
    {
        $this->_hashDirectory = $path;
        $this->_links = array ();
	}
    
	/**
	 * Read configuration from a json file in links folder
     * @param $linkCode Name of the file (name = hash code)
     * @return array Array with different kinds of information
	 */
	public function read($linkCode) 
    {
		if (true === file_exists($this->_hashDirectory . $linkCode) ) {
            
            $readedConfig = array ();
            
            $c = file($this->_hashDirectory . $linkCode);
            
            // if configuration file contains information
            if (true == isset ($c [0])) {
                
                // contains stuff e.g. selectedDSD, ...
                $readedConfig ['data'] = json_decode($c[0], true);
                
                // contains UI chart config information
                $readedConfig ['ui'] = json_decode($c [1], true);
                if(null == $readedConfig ['ui']) $readedConfig ['ui'] = array();
            
            // no content in file, set default values
            } else {
                
                $readedConfig ['backend'] = array('backend' => '');
                $readedConfig ['data'] = array(
                    'components'            => array(),
                    'selectedDSD'           => array(),
                    'selectedDS'            => array(),
                    'selectedComponents'    => array(
                        'dimensions'        => array(),
                        'measures'          => array()
                    )
                );
                $readedConfig ['ui'] = array();
            }
            
            return $readedConfig;
		}
		return false;
	}
	
    /**
     * Writes a given configuration to a file
     */
	public function write($data, $ui) 
    {
        // compute hashcode for the given configuration
        $fileName = $this->_filePrefix . $this->generateHash ($data, $ui);
        
        $data['linkCode'] = $fileName;
        
		$filePath = $this->_hashDirectory . $fileName;
        				
		if( false == file_exists($filePath) ) {
            
            // can't open the file: throw exception
            if ( false === ( $fh = fopen($filePath, 'w') ) ) {
                $m = 'No write permissions for '. $filePath;
                throw new CubeViz_Exception ( $m );
                return $m;
            }
			
            // write all parameters line by line
			fwrite($fh, json_encode ( $data ) . "\n");
			fwrite($fh, json_encode ( $ui ) . "\n");
			chmod ($filePath, 0755);
			fclose($fh);
		} 
        
        // return generated hashCode (=fileName)
        return $fileName;
	}
    
    /**
     * 
     */	
	private function generateHash ($data, $ui) 
    {		
		return hash ( 'sha256', json_encode ( $data ) . json_encode ( $ui ) );
	}
}
