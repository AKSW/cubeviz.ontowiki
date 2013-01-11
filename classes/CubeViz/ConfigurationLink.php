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
     *
     */
    public function loadStandardData($config, &$model) 
    {
        $query = new DataCube_Query($model);
        
        // if no data structure definitions were selected
        if(0 === count($config['data']['dataStructureDefinitions'])) {
            $config['data']['dataStructureDefinitions'] = $query->getDataStructureDefinitions();
        } 
        
        // if no data structure definition was selected
        if(0 === count($config['data']['selectedDSD'])) {
            $config['data']['selectedDSD'] = $config['data']['dataStructureDefinitions'][0];
        }
                        
        // if no data structure definitions were selected
        if(0 === count($config['data']['dataSets'])) {
            $config['data']['dataSets'] = $query->getDataSets($config['data']['selectedDSD']['url']);
        } 
        
        // if no data sets were selected
        if(0 === count($config['data']['selectedDS'])) {
            $config['data']['selectedDS'] = $config['data']['dataSets'][0];
        }
        
        // if no components were selected
        if(0 === count($config['data']['components'])) {
            
            /**
             * Dimensions
             */
            $dimensions = $query->getComponents(
                $config['data']['selectedDSD']['url'],
                $config['data']['selectedDS']['url'],
                DataCube_UriOf::Dimension
            );
            
            // set components
            $config['data']['components']['dimensions'] = array();
            foreach ($dimensions as $dimension) {
                $config['data']['components']['dimensions']
                    [$dimension['hashedUrl']] = $dimension;
            }
            
            // set selectedComponents
            $config['data']['selectedComponents']['dimensions'] = array();
            foreach ($dimensions as $dimension) {
                
                $dimension['elements'] = array(
                    $dimension['elements'][0]
                );
                
                $config['data']['selectedComponents']['dimensions']
                    [$dimension['hashedUrl']] = $dimension;
            }
            
            /**
             * Measures
             */
            $measures = $query->getComponents(
                $config['data']['selectedDSD']['url'],
                $config['data']['selectedDS']['url'],
                DataCube_UriOf::Measure
            );
            
            // set measures
            $config['data']['components']['measures'] = array();
            foreach ($measures as $measure) {
                $config['data']['components']['measures']
                    [$measure['hashedUrl']] = $measure;
            }
            
            // set selectedComponents
            $config['data']['selectedComponents']['measures'] = array();
            foreach ($measures as $measure) {
                $config['data']['selectedComponents']['measures']
                    [$measure['hashedUrl']] = $measure;
            }
        }
        
        // number of multiple dimensions
        $config['data']['numberOfMultipleDimensions'] = 0;
            
        foreach ($config['data']['selectedComponents']['dimensions'] as $dim) {
            if(1 < count($dim ['elements'])) {
                ++$config['data']['numberOfMultipleDimensions'];
            }
        }
        
        // number of one element dimensions
        $config['data']['numberOfOneElementDimensions'] = 0;
        
        foreach ($config['data']['selectedComponents']['dimensions'] as $dim) {
            if(1 == count($dim ['elements'])) {
                ++$config['data']['numberOfOneElementDimensions'];
            }
        }
        
        // if no retrievedObservations were selected
        if(0 === count($config['data']['retrievedObservations'])){
            
            $config['data']['retrievedObservations'] = $query->getObservations(array(
                'selectedComponents' => $config['data']['selectedComponents'],
                'selectedDS' => array('url' => $config['data']['selectedDS']['url'])
            ));
        }
        
        return $config;
    }
    
	/**
	 * Read configuration from a json file in links folder
     * @param $linkCode Name of the file (name = hash code)
     * @return array Array with different kinds of information
	 */
	public function read($linkCode, &$model) 
    {
        // If link code file exists, try to load content
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
                
                return $readedConfig;
            } 
		}
        
        // Otherwise set standard values
        $readedConfig ['backend'] = array('backend' => '');
        
        /**
         * Information about the data cube itself and what was selected
         */
        $readedConfig ['data'] = array(
            'dataStructureDefinitions'  => array(),
            'dataSets'                  => array(),
            'components'                => array(),
            'numberOfMultipleDimensions'=> 0,
            'selectedDSD'               => array(),
            'selectedDS'                => array(),
            'selectedComponents'        => array(
                'dimensions'            => array(),
                'measures'              => array()
            ),
            'retrievedObservations'     => array()
        );
        
        /**
         * Information about the user interface
         */
        $readedConfig ['ui'] = array(
            'visualization'             => array(
                'class'                 => ''
            ),
            // will contain information/settings for each visualization class
            'visualizationSettings'     => array(
                // dirty hack, without it, jQuery does not transmit empty array
                0                       => null
            )
        );
        
        $readedConfig = $this->loadStandardData($readedConfig, $model);
        
        // set link code
        $readedConfig['data']['linkCode'] = $this->write(
            $readedConfig['data'], $readedConfig['ui']
        );
        
		return $readedConfig;
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
