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
    protected $_linksFolder = '';    
    
    /**
     * Needs to be public to be accessible through json_encode interface
     */
    protected $_links = null;
    
    /**
     * Constructor
     */
    public function __construct($cubeVizDir) {
        $ds = DIRECTORY_SEPARATOR;        
        $this->_linksFolder = $cubeVizDir . $ds . 'data' . $ds . 'links' . $ds;
        $this->_links = array ();
	}
    
	/**
	 * Read configuration from a json file in links folder
     * @param $linkCode Name of the file (name = hash code)
     * @return boolean
	 */
	public function read($linkCode) {
        
		if (true === file_exists($this->_linksFolder . $linkCode) ) {
            return file($this->_linksFolder . $linkCode);
		}
		return false;
	}
	
	public function writeToFile($config) {
		$fileName = $this->generateHashCodeFor($config);
		
		//TODO: check the existence of the folders and make folders available
		//set permissions 0777 for the folders!
				
		$filePath = $this->_linksFolder . $fileName;
		
		if( false == file_exists($this->_linksFolder)) {
			mkdir($this->_linksFolder);
		}
				
		if( false == file_exists($filePath) && true == isset ( $config['selectedGraph'] ) ) {
            
            if ( false === ( $fh = fopen($filePath, 'w') ) ) {
                // can't open the file
                var_dump("No write permission oO"); die;
                return null;
            }
			
            // write all parameters line by line
			fwrite($fh, $config['sparqlEndpoint'] . "\n");
			fwrite($fh, $config['selectedGraph'] . "\n");
			fwrite($fh, $config['selectedDSD'] . "\n");
			fwrite($fh, $config['selectedDS'] . "\n");
			fwrite($fh, $config['selectedMeasures'] . "\n");
			fwrite($fh, $config['selectedDimensions'] . "\n");
			fwrite($fh, $config['selectedDimensionComponents'] . "\n");
			fwrite($fh, $config['selectedChartType'] . "\n");
			fclose($fh);
			return $fileName;
		} else {
			return $fileName;
		}
	}
	
	private function generateHashCodeFor($config) {

		$sparqlEndpoint = json_decode($config['sparqlEndpoint'], true);
		$selectedGraph = json_decode($config['selectedGraph'], true);
		$selectedDSD = json_decode($config['selectedDSD'], true);
		$selectedDS = json_decode($config['selectedDS'], true);
		$selectedMeasures = json_decode($config['selectedMeasures'], true);
		$selectedDimensions = json_decode($config['selectedDimensions'], true);
		$selectedDimensionComponents = json_decode($config['selectedDimensionComponents'], true);
		
		//just a string
		$sparqlEndpoint = hash('md5', $sparqlEndpoint); 
		//array - label and number (need to refactor the code to throw out number)
		
		$selectedGraph = hash('md5', $selectedGraph["label"]);
		$selectedDSD = hash('md5', $selectedDSD['url']);
		$selectedDS = hash('md5', $selectedDS['url']);
		
		$selectedMeasures_strings = array();
		$selectedMeasures_length = sizeof($selectedMeasures['measures']);
		for($i = 0; $i < $selectedMeasures_length; $i++) {
			$measure = $selectedMeasures['measures'][$i]['url'];
			array_push($selectedMeasures_strings, $measure);
		}
		rsort($selectedMeasures_strings);
		$selectedMeasures_strings = implode($selectedMeasures_strings);
		$selectedMeasures = hash('md5', $selectedMeasures_strings);
		
		$selectedDimensions_strings = array();
		$selectedDimensions_length = sizeof($selectedDimensions['dimensions']);
		for($i = 0; $i < $selectedDimensions_length; $i++) {
			$dimension = $selectedDimensions['dimensions'][$i]['url'];
			array_push($selectedDimensions_strings, $dimension);
		}
		rsort($selectedDimensions_strings);
		$selectedDimensions_strings = implode($selectedDimensions_strings);
		$selectedDimensions = hash('md5', $selectedDimensions_strings);
		
		$selectedDimComps_strings = array();
		$selectedDimComps_length = sizeof($selectedDimensionComponents);
		for($i = 0; $i < $selectedDimComps_length; $i++) {
			$dimComp = $selectedDimensionComponents[$i]['property'];
			array_push($selectedDimComps_strings, $dimComp);
		}
		rsort($selectedDimComps_strings);
		$selectedDimComps_strings = implode($selectedDimComps_strings);
		$selectedDimensionComponents = hash('md5', $selectedDimComps_strings);
		
		//concatenate all into one string
		$hash = $sparqlEndpoint . $selectedGraph . $selectedDSD . $selectedDS .
			    $selectedMeasures . $selectedDimensions . $selectedDimensionComponents;
		
		$hash = hash('md5', $hash);
		
		return $hash;
	}
}
