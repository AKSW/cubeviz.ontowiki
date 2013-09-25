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
     * model instance
     */
    protected $_model = null;    
    
    /**
     * Constructor
     */
    public function __construct($model, $titleHelperLimit) 
    {        
        $this->_model = $model;
        $this->_titleHelperLimit = $titleHelperLimit;
        
        // caching
        $this->_objectCache = OntoWiki::getInstance()->erfurt->getCache();
    }
    
    /**
     *
     */
    public function loadStandardConfigForData($config) 
    {
        $query = new DataCube_Query($this->_model, $this->_titleHelperLimit);
        
        // if no data structure definitions were selected
        if(0 === count($config['dataSets'])) {
            $config['dataSets'] = $query->getDataSets();
        } 

        // if no data sets were selected
        if(0 === count($config['selectedDS'])) {
            $config['selectedDS'] = isset($config['dataSets'][0]) ? $config['dataSets'][0] : null;
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
            }
            
            $config['selectedComponents']['attribute'] = null;
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
        
        /**
         * Observations
         */
        $config['retrievedObservations'] = $query->getObservations(
            $config['selectedDS']['__cv_uri'],
            $config['selectedComponents']['dimensions']
        );
        
        return $config;
    }
    
    /**
     *
     */
    public function read($hash, $type) 
    {
        // load and return content, if ObjectCache entry exists
        if (null != $hash) {
            $content = $this->_objectCache->load($hash);
             
            if (false !== $content) {            
                return array(json_decode($content, true), $hash);
            }
            
        // hash null means, that we have to load standard data
        } else {
        
            $config = array();
            
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
                    ));                
                    
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
    }
    
    /**
     *
     */
    public function write($content, $filename) 
    {
        // adapt content (remove whitespaces)
        $content = trim($content);
        $content = str_replace(array("\r\n", "\\r", "\\n"), ' ', $content);
        $content = preg_replace('/\s\s+/', ' ', $content);
        $content = preg_replace('/\s+/', ' ', $content);
        $content = preg_replace('/\r\n|\r|\n/', ' ', $content);
        
        // save (override) content
        $this->_objectCache->save($content, $filename);
    }
}
