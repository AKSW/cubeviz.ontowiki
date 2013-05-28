<?php

// include EasyRDF
set_include_path(get_include_path() . PATH_SEPARATOR .
    ONTOWIKI_ROOT . 'extensions/cubeviz/classes/foreign/EasyRdf/lib/' . PATH_SEPARATOR .
    ONTOWIKI_ROOT . 'extensions/cubeviz/classes/foreign/EasyRdf/lib/EasyRdf/' . PATH_SEPARATOR
);

require_once 'EasyRdf.php';

/**
 * 
 */
class CubeViz_DataSelectionExporter
{   
    /**
     *
     */
    public static function _($type, $dataHash, &$model, $cacheDir) 
    {
        $c = new CubeViz_ConfigurationLink($cacheDir);
        $data = array ();

        // get all information to export
        list($data, $dh) = $c->read ($dataHash, $model);
        
        $graph = new EasyRdf_Graph();
        
        EasyRdf_Namespace::set('qb', 'http://purl.org/linked-data/cube#');
    
    
        /**
         * selected data structure definition
         */
        foreach ($data ['dataStructureDefinitions'] as $element) {
            
            if ($data['selectedDSD']['__cv_uri'] == $element ['__cv_uri']) {
            
                // go through all non-cubeviz element values
                foreach ($element as $predicateUri => $object) {                
                    // no cubeviz internal information, its plain from the store
                    if (false === strstr ($predicateUri, '__cv_')) {
                        
                        // is object an URI
                        if(true === Erfurt_Uri::check($object)) {
                            $graph->addResource($element ['__cv_uri'], $predicateUri, $object);
                        
                        // is object NOT an array
                        } else if (false === is_array($object)) {
                            $graph->add($element ['__cv_uri'], $predicateUri, $object);
                        
                        // assuming, object is an array
                        } else {
                            foreach ($object as $entry) {
                                if(true === Erfurt_Uri::check($entry)) {
                                    $graph->addResource($element ['__cv_uri'], $predicateUri, $entry);
                                } else {
                                    $graph->add($element ['__cv_uri'], $predicateUri, $entry);
                                }
                            }
                        }
                    }
                }
            }
        }
        

        /**
         * selected data set
         */
        foreach ($data ['dataSets'] as $element) {
            
            if ($data['selectedDS']['__cv_uri'] == $element ['__cv_uri']) {
            
                // go through all non-cubeviz element values
                foreach ($element as $predicateUri => $object) {                
                    // no cubeviz internal information, its plain from the store
                    if (false === strstr ($predicateUri, '__cv_')) {
                        
                        // is object an URI
                        if(true === Erfurt_Uri::check($object)) {
                            $graph->addResource($element ['__cv_uri'], $predicateUri, $object);
                        
                        // is object NOT an array
                        } else if (false === is_array($object)) {
                            $graph->add($element ['__cv_uri'], $predicateUri, $object);
                        
                        // assuming, object is an array
                        } else {
                            foreach ($object as $entry) {
                                if(true === Erfurt_Uri::check($entry)) {
                                    $graph->addResource($element ['__cv_uri'], $predicateUri, $entry);
                                } else {
                                    $graph->add($element ['__cv_uri'], $predicateUri, $entry);
                                }
                            }
                        }
                    }
                }
            }
        }
        

        /**
         * selected components: component specifications of the dimensions
         */
        foreach ($data ['selectedComponents']['dimensions'] as $element) {
            // go through all non-cubeviz element values
            foreach ($element as $predicateUri => $object) {                
                // no cubeviz internal information, its plain from the store
                if (false === strstr ($predicateUri, '__cv_')) {
                    
                    // is object an URI
                    if(true === Erfurt_Uri::check($object)) {
                        $graph->addResource($element ['__cv_uri'], $predicateUri, $object);
                    
                    // is object NOT an array
                    } else if (false === is_array($object)) {
                        $graph->add($element ['__cv_uri'], $predicateUri, $object);
                    
                    // assuming, object is an array
                    } else {
                        foreach ($object as $entry) {
                            if(true === Erfurt_Uri::check($entry)) {
                                $graph->addResource($element ['__cv_uri'], $predicateUri, $entry);
                            } else {
                                $graph->add($element ['__cv_uri'], $predicateUri, $entry);
                            }
                        }
                    }
                }
            }
            
            // dimension itself
            $dimension = $element ['http://purl.org/linked-data/cube#dimension'];
            $graph->addResource ($dimension, 'rdf:type', 'qb:DimensionProperty');
            
            // dimension elements
            foreach ($element ['__cv_elements'] as $dimension) 
            {
                // go through all non-cubeviz element values
                foreach ($dimension as $predicateUri => $object) {                
                    // no cubeviz internal information, its plain from the store
                    if (false === strstr ($predicateUri, '__cv_')) {
                        
                        // is object an URI
                        if(true === Erfurt_Uri::check($object)) {
                            $graph->addResource($element ['__cv_uri'], $predicateUri, $object);
                        
                        // is object NOT an array
                        } else if (false === is_array($object)) {
                            $graph->add($element ['__cv_uri'], $predicateUri, $object);
                        
                        // assuming, object is an array
                        } else {
                            foreach ($object as $entry) {
                                if(true === Erfurt_Uri::check($entry)) {
                                    $graph->addResource($element ['__cv_uri'], $predicateUri, $entry);
                                } else {
                                    $graph->add($element ['__cv_uri'], $predicateUri, $entry);
                                }
                            }
                        }
                    }
                }
            }
        }
        

        /**
         * selected components: component specifications of the selected attribute
         */
        if (true === is_array ($data ['selectedComponents']['attribute'])
            && 0 < count ($data ['selectedComponents']['attribute'])) {
            foreach ($data ['selectedComponents']['attribute'] as $predicateUri => $object) {                
                // no cubeviz internal information, its plain from the store
                if (false === strstr ($predicateUri, '__cv_')) {
                    if(true === Erfurt_Uri::check($object)) {
                        $graph->addResource($data ['selectedComponents']['attribute']['__cv_uri'], $predicateUri, $object);
                    } else {
                        $graph->add($data ['selectedComponents']['attribute']['__cv_uri'], $predicateUri, $object);
                    }
                }
            }
            
            $unit = $data ['selectedComponents']['attribute']['http://purl.org/linked-data/cube#attribute'];
            $graph->addResource ($unit, 'rdf:type', 'qb:AttributeProperty');
        }
        
        
        /**
         * selected components: component specifications of the selected measure
         */
        foreach ($data ['selectedComponents']['measure'] as $predicateUri => $object) {                
            // no cubeviz internal information, its plain from the store
            if (false === strstr ($predicateUri, '__cv_')) {
                if(true === Erfurt_Uri::check($object)) {
                    $graph->addResource($data ['selectedComponents']['measure']['__cv_uri'], $predicateUri, $object);
                } else {
                    $graph->add($data ['selectedComponents']['measure']['__cv_uri'], $predicateUri, $object);
                }
            }
        }        
        
        $measure = $data ['selectedComponents']['measure']['http://purl.org/linked-data/cube#measure'];
        $graph->addResource ($measure, 'rdf:type', 'qb:MeasureProperty');
        
        
        /**
         * Observations
         */
        $query = new DataCube_Query($model);
            
        $retrievedObservations = $query->getObservations(
            $data['selectedDS']['__cv_uri'],
            $data['selectedComponents']['dimensions']
        );
        
        foreach ($retrievedObservations as $element) {                
            foreach ($element as $predicateUri => $object) {                
                // no cubeviz internal information, its plain from the store
                if (false === strstr ($predicateUri, '__cv_')) {
                    if(true === Erfurt_Uri::check($object)) {
                        $graph->addResource($element['__cv_uri'], $predicateUri, $object);
                    } else {
                        $graph->add($element['__cv_uri'], $predicateUri, $object);
                    }
                }
            }
        } 
        
        return $graph->serialise($type);
    }
}
