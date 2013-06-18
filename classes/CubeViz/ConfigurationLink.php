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
     * filePrefix for cv_dataHash
     */
    public static $filePrefForDataHash = 'cv_dataHash-';
    
    /**
     * filePrefix for cv_uiHash
     */
    public static $filePrefForUiHash = 'cv_uiHash-';
    
    /**
     * Constructor
     */
    public function __construct($path) 
    {
        $this->_hashDirectory = $path;
    }
    
    /**
     *
     */
    public function loadStandardConfigForData($config, &$model, $titleHelperLimit) 
    {
        $query = new DataCube_Query($model, $titleHelperLimit);
        
        // if no data structure definitions were selected
        if(0 === count($config['dataSets'])) {
            $config['dataSets'] = $query->getDataSets();
        } 
        
        // if no data sets were selected
        if(0 === count($config['selectedDS'])) {
            $config['selectedDS'] = $config['dataSets'][0];
        }
        
        // if no data structure definitions were selected
        if(0 === count($config['dataStructureDefinitions'])) {
            $config['dataStructureDefinitions'] = $query->getDataStructureDefinitions();
        }
        
        // if no data structure definition was selected, use the DSD from the
        // selected DS
        if(0 === count($config['selectedDSD'])) {
            foreach ($config['dataStructureDefinitions'] as $ds) {
                if ($ds['__cv_uri'] == $config['selectedDS'][DataCube_UriOf::Structure]) {
                    $config['selectedDSD'] = $ds;
                }
            }
            
            // if no related data structure definition was found, throw an exception
            if (0 == count($config['selectedDSD'])) {
                throw new CubeViz_Exception(
                    'Selected DataSet '. $config['selectedDS'] .' has no '.
                    'related Data Structure Definition!' 
                );
            }
        } 
        
        // if no components were selected
        if(0 === count($config['components'])) {
            
            /**
             * Dimensions
             */
            $dimensions = $query->getComponents(
                $config['selectedDSD']['__cv_uri'],
                $config['selectedDS']['__cv_uri'],
                DataCube_UriOf::Dimension
            );
            $numberOfDimensions = count($dimensions);
            $numberOfUsedMultipleDimensions = 0;
            $useMultipleDimensionAnyway = false;
            
            // set components
            $config['components']['dimensions'] = array();
            foreach ($dimensions as $dimension) {
                $config['components']['dimensions']
                    [$dimension['__cv_uri']] = $dimension;
            }
            
            // set selectedComponents
            $config['selectedComponents']['dimensions'] = array();
            foreach ($dimensions as $dimension) {
                
                /**
                 * Preselect a couple of elements for current dimension
                 */
                $numberOfElements = $dimension['__cv_elements'];
                $numberOfElementsToPreSelect = (int) ceil(count($numberOfElements) * 0.3);
                
                if (10 < $numberOfElementsToPreSelect) {
                    $numberOfElementsToPreSelect = 10;
                } elseif (0 == $numberOfElementsToPreSelect) {
                    $numberOfElementsToPreSelect = 1;
                }
                
                // if more than one dimensions available use only 2 multiple at 
                // the same time and only one element of the other ones
                if (2 > $numberOfUsedMultipleDimensions 
                    && 2 < $numberOfDimensions 
                    && 1 < $numberOfElementsToPreSelect) {
                    ++$numberOfUsedMultipleDimensions;
                    
                    // fallback option, if there are a couple of one elmement 
                    // dimensions between two multiple ones.
                    if (2 == $numberOfUsedMultipleDimensions) {
                        $useMultipleDimensionAnyway = true;
                    }
                }
                
                $preSelectedElements = array();
                $stillUsedIndexes = array();
                
                // if this dimension has only one element or we have already 
                // reach the maximum number of multiple dimensions
                if (1 == $numberOfElementsToPreSelect 
                    || (2 == $numberOfUsedMultipleDimensions && false == $useMultipleDimensionAnyway)) {
                    
                    foreach ($dimension['__cv_elements'] as $elementUri => $element) {
                        $preSelectedElements [$elementUri] = 
                            $dimension['__cv_elements'][$elementUri];
                        break;
                    }
                    
                // ... more than one element
                } elseif (1 < $numberOfElementsToPreSelect) {
                    for($i = 0; $i < $numberOfElementsToPreSelect; ++$i) {
                        
                        // search as long as necessary a new random index                    
                        do {
                            $randomI = rand(0, $numberOfElementsToPreSelect);
                            
                            // only break if new index is not already in use
                            if(false === in_array($randomI, $stillUsedIndexes)) {
                                $stillUsedIndexes [] = $randomI;
                                break;
                            }
                        } while (true);
                        
                        $j = 0;
                        foreach ($dimension['__cv_elements'] as $elementUri => $element) {
                            // after compute a random index for a certain element
                            // lets find this element by count up as long as the 
                            // current element's index is equal to the computed one.
                            if($j++ == $randomI) {
                                $preSelectedElements [$elementUri] = 
                                    $dimension['__cv_elements'][$elementUri];
                                // in this way we keep the elementUri as key
                                break;
                            }
                        }
                    }
                    
                // ... has no elements
                } else {
                    $preSelectedElements = array();
                }
                
                $dimension['__cv_elements'] = $preSelectedElements;
                
                $config['selectedComponents']['dimensions']
                    [$dimension['__cv_uri']] = $dimension;
                    
                if (true == $useMultipleDimensionAnyway) {
                    $useMultipleDimensionAnyway = false;
                }
            }
        }
        
        /**
         * measures
         */
        if (false === isset($config['selectedComponents']['measure']) 
            || false === isset($config['components']['measures'])) {
                
            $measures = $query->getComponents(
                $config['selectedDSD']['__cv_uri'],
                $config['selectedDS']['__cv_uri'],
                DataCube_UriOf::Measure
            );
            
            $config['selectedComponents']['measure'] = null;
            
            // set measures
            $config['components']['measures'] = array();
            foreach ($measures as $measure) {
                $config['components']['measures'][$measure['__cv_uri']] = $measure;
                
                if(null == $config['selectedComponents']['measure']) {
                    $config['selectedComponents']['measure'] = $measure;
                }
            }
        }
        
        /**
         * attributes
         */
        if (false === isset($config['selectedComponents']['attribute'])
            || false === isset($config['components']['attributes'])) {
                
            $attributes = $query->getComponents(
                $config['selectedDSD']['__cv_uri'],
                $config['selectedDS']['__cv_uri'],
                DataCube_UriOf::Attribute
            );
            
            $config['selectedComponents']['attribute'] = null;
            
            // set attributes
            $config['components']['attributes'] = array();
            foreach ($attributes as $attribute) {
                $config['components']['attributes'][$attribute['__cv_uri']] = $attribute;
                
                if(null == $config['selectedComponents']['attribute']) {
                    $config['selectedComponents']['attribute'] = $attribute;
                }
            }
        }
        
        /**
         * slices
         */
        if (0 == count($config['slices'])) {
            
            $config['slices'] = array ();
            
            // get slice keys
            $sliceKeys = $query->getSliceKeys(
                $config['selectedDSD']['__cv_uri'],
                $config['selectedDS']['__cv_uri']
            );
            
            // collect all slices in one list
            foreach ($sliceKeys as $sliceKey) {
                $config['slices'] = array_merge ($config['slices'], $sliceKey ['slices']);
            }
        }
        
        /**
         * number of multiple dimensions
         */
        $config['numberOfMultipleDimensions'] = 0;
            
        foreach ($config['selectedComponents']['dimensions'] as $dim) {
            if(1 < count($dim ['__cv_elements'])) {
                ++$config['numberOfMultipleDimensions'];
            }
        }
        
        // number of one element dimensions
        $config['numberOfOneElementDimensions'] = 0;
        
        foreach ($config['selectedComponents']['dimensions'] as $dim) {
            if(1 == count($dim ['__cv_elements'])) {
                ++$config['numberOfOneElementDimensions'];
            }
        }
        
        return $config;
    }
    
    /**
     *
     */
    public function read($hash, &$model, $titleHelperLimit) 
    {
        /**
         * load and return file content, if file exists
         */
        if(true === file_exists($this->_hashDirectory . $hash)){
            $c = file($this->_hashDirectory . $hash);
            
            // if configuration file contains information
            if (true == isset ($c [0])) {
                
                // contains stuff e.g. selectedDSD, ...
                return array(json_decode($c[0], true), $hash);
            }
        }
        
        /**
         * If you are here, either the file does not exists or there was nothing
         * to read in the file's first line.
         * 
         * ... so now set standard values.
         */
        $config = array();
        $type = '';
        
        $filePrefData = CubeViz_ConfigurationLink::$filePrefForDataHash;
        $filePrefUi= CubeViz_ConfigurationLink::$filePrefForUiHash;
        
        // determine which type the hash is:
        if($filePrefData == substr($hash, 0, strlen($filePrefData))) {
            $type = 'data';
        } elseif($filePrefUi == substr($hash, 0, strlen($filePrefUi))){
            $type = 'ui';
        }
        
        switch($type) {
            
            /**
             * Information about the data cube itself and what was selected
             */
            case 'data':
            
                $config = $this->loadStandardConfigForData(array(
                    'dataStructureDefinitions'      => array(),
                    'dataSets'                      => array(),
                    'components'                    => array(),
                    'numberOfOneElementDimensions'  => 0,
                    'numberOfMultipleDimensions'    => 0,
                    'selectedDSD'                   => array(),
                    'selectedDS'                    => array(),
                    'selectedComponents'            => array(
                        'attribute'                 => array(),
                        'dimensions'                => array(),
                        'measure'                   => array()
                    ),
                    'selectedSlice'                 => array(),
                    'slices'                        => array()
                ), $model, $titleHelperLimit);                
                
                $type = 'data';
                
                break;
            
            /**
             * Information about the user interface
             */
            case 'ui':
            
                $config = array(
                    'visualization'                 => array(
                        'className'                 => ''
                    ),
                    // will contain information/settings for each visualization class
                    'visualizationSettings'         => array(
                        // TODO: dirty hack, without it, jQuery does not transmit empty array
                        0                           => null
                    )
                );
                
                $type = 'ui';
                  
                break;
                
            // something went wrong, hash type unknown
            default: return array (null, null);
        }
        
        return array(
            $config,
            $this->write(json_encode($config, JSON_FORCE_OBJECT), $type) // = generated hash
        );
    }
    
    /**
     *
     */
    public function write($content, $type) 
    {
        $filename = '';
        
        if('data' == $type) {
            $filename = CubeViz_ConfigurationLink::$filePrefForDataHash;
        } elseif('ui' == $type) {
            $filename = CubeViz_ConfigurationLink::$filePrefForUiHash;
        } else {
            // in this case something went wrong!
            return;
        }
        
        $content = trim($content);
        $content = str_replace(array("\r\n", "\\r", "\\n"), ' ', $content);
        $content = preg_replace('/\s\s+/', ' ', $content);
        $content = preg_replace('/\s+/', ' ', $content);
        $content = preg_replace('/\r\n|\r|\n/', ' ', $content);
        
        // attach hash based on the given string
        $filename .= $this->generateHash ($content);
        
        // set full file path
        $filePath = $this->_hashDirectory . $filename;

        if(false == file_exists($filePath)) {
            // can't open the file: throw exception
            if(false === ($fh = fopen($filePath, 'w'))) {
                $m = 'No write permissions for '. $filePath;
                throw new CubeViz_Exception ( $m );
                return $m;
            }

            // write all parameters line by line
            fwrite($fh, $content);
            chmod ($filePath, 0755);
            fclose($fh);
        } 
        
        return $filename;
    }
    
    /**
     * 
     */	
    private function generateHash ($content) 
    {
        return md5(json_encode($content));
    }
}
