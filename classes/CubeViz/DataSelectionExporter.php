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
    public static function _($type, $dataHash, $model, $titleHelperLimit) 
    {
        if ('csv' == $type) {
            return CubeViz_DataSelectionExporter::exportAsCSV($dataHash, $model, $titleHelperLimit);
        
        // 'turtle' == $type
        } else { 
            return CubeViz_DataSelectionExporter::exportAsRdfTurtle($dataHash, $model, $titleHelperLimit);
        }
    }    
    
    /**
     *
     */
    public static function exportAsRdfTurtle($dataHash, $model, $titleHelperLimit)
    {
        $c = new CubeViz_ConfigurationLink($model, $titleHelperLimit);
        $data = array ();

        // get all information to export
        list($data, $dh) = $c->read ($dataHash);
        
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
                        
                        // assuming, object is an array
                        if(true === is_array($object)) {
                            foreach ($object as $entry) {
                                if(true === Erfurt_Uri::check($entry)) {
                                    $graph->addResource($element ['__cv_uri'], $predicateUri, $entry);
                                } else {
                                    $graph->add($element ['__cv_uri'], $predicateUri, $entry);
                                }
                            }
                                                    
                        // is object NOT an array
                        } else if (false === is_array($object)) {
                            $graph->add($element ['__cv_uri'], $predicateUri, $object);
                        
                        // is object an URI
                        } elseif(true === Erfurt_Uri::check($entry)) {                            
                            $graph->addResource($element ['__cv_uri'], $predicateUri, $object);
                        
                        } else {
                            
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
                        
                        // assuming, object is an array
                        if(true === is_array($object)) {
                            foreach ($object as $entry) {
                                if(true === Erfurt_Uri::check($entry)) {
                                    $graph->addResource($element ['__cv_uri'], $predicateUri, $entry);
                                } else {
                                    $graph->add($element ['__cv_uri'], $predicateUri, $entry);
                                }
                            }
                        
                        // is object NOT an array
                        } else if (false === is_array($object)) {
                            $graph->add($element ['__cv_uri'], $predicateUri, $object);
                        
                        // is object an URI
                        } elseif(true === Erfurt_Uri::check($object)) {
                            $graph->addResource($element ['__cv_uri'], $predicateUri, $object);
                            
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
                    
                    // assuming, object is an array
                    if(true === is_array($object)) {
                        foreach ($object as $entry) {
                            if(true === Erfurt_Uri::check($entry)) {
                                $graph->addResource($element ['__cv_uri'], $predicateUri, $entry);
                            } else {
                                $graph->add($element ['__cv_uri'], $predicateUri, $entry);
                            }
                        }
                    
                    // is object NOT an array
                    } else if (false === is_array($object)) {
                        $graph->add($element ['__cv_uri'], $predicateUri, $object);
                    
                    // is object an URI
                    } elseif(true === Erfurt_Uri::check($object)) {
                        $graph->addResource($element ['__cv_uri'], $predicateUri, $object);
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
                        
                        // assuming, object is an array
                        if(true === is_array($object)) {
                            foreach ($object as $entry) {
                                if(true === Erfurt_Uri::check($entry)) {
                                    $graph->addResource($element ['__cv_uri'], $predicateUri, $entry);
                                } else {
                                    $graph->add($element ['__cv_uri'], $predicateUri, $entry);
                                }
                            }
                            
                        // is object NOT an array
                        } else if (false === is_array($object)) {
                            $graph->add($element ['__cv_uri'], $predicateUri, $object);
                        
                        // is object an URI
                        } elseif(true === Erfurt_Uri::check($object)) {
                            $graph->addResource($element ['__cv_uri'], $predicateUri, $object);
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
        $query = new DataCube_Query($model, $titleHelperLimit);
            
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
        
        return "#" . PHP_EOL .
               "# CubeViz Export of data hash " . $dataHash . PHP_EOL .
               "#" . PHP_EOL . PHP_EOL .
               $graph->serialise('turtle');
    }
    
    /**
     * 
     */
    public static function exportAsCSV($dataHash, $model, $titleHelperLimit)
    {
        $attributeSet = false;
        $c = new CubeViz_ConfigurationLink($model, $titleHelperLimit);
        $data = $result = array (array());

        // get all information to export
        list($data, $dh) = $c->read ($dataHash);
        
        /**
         * set the header of the CSV file
         */
        foreach ($data ['selectedComponents']['dimensions'] as $element) {
            $result [0][] = $element ['__cv_niceLabel'];
        }
        
        // measure
        $result [0][] = $data ['selectedComponents']['measure']['__cv_niceLabel'];
        
        // use attribute, if available
        if (true === isset($data ['selectedComponents']['attribute'])) {
            $result [0][] = $data ['selectedComponents']['attribute']['__cv_niceLabel'];
            $attributeSet = true;
        }
        
        /**
         * set the content of the CSV file
         */
        $query = new DataCube_Query($model, $titleHelperLimit);
        $selectedDimensions = $data ['selectedComponents']['dimensions'];
        $i = 1;
            
        $retrievedObservations = $query->getObservations(
            $data['selectedDS']['__cv_uri'],
            $data['selectedComponents']['dimensions']
        );
        
        // each line in the CSV file represents one observation
        foreach ($retrievedObservations as $observation) {
            
            // go through all dimensions
            foreach ($selectedDimensions as $d) {
            
                // e.g. http://data.lod2.eu/scoreboard/properties/country
                $dimensionUrl = $d ['http://purl.org/linked-data/cube#dimension'];
            
                // save dimension element url
                $dimensionElementUrl = $observation [$dimensionUrl];
                
                // use dimension element url to get his label
                foreach ($d ['__cv_elements'] as $dimensionElement) 
                {
                    if ($dimensionElement ['__cv_uri'] == $dimensionElementUrl) {
                        $result [$i][] = $dimensionElement ['__cv_niceLabel'];
                    }
                }
            }
            
            // get measure
            $measureUri = $data['selectedComponents']['measure']['http://purl.org/linked-data/cube#measure'];
            $result [$i][] = $observation [$measureUri];
            
            // get attribute, if available
            if (true === $attributeSet) {
                $result [$i][] = $data['selectedComponents']['attribute']['__cv_niceLabel'];
            }
            
            ++$i;
        } 
        
        return CubeViz_DataSelectionExporter::arrayToCsv (
            $result,    // array containing all the data
            ';',        // delimiter
            '"'         // enclose all field values with that
        );
    }
    
    /**
      * Returns the CSV representation of a given array
      * Copied from http://stackoverflow.com/a/12470042
      * @param array $data Array containing the data to transform
      */
    public static function arrayToCsv($data) 
    {
        $outputBuffer = fopen("php://output", 'w');
        foreach($data as $val) {
            fputcsv($outputBuffer, $val);
        }
        fclose($outputBuffer);
    }
}
