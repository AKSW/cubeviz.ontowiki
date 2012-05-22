<?php
/**
 * This file is part of the {@link http://ontowiki.net OntoWiki} project.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @package Extensions
 */

/**
 * The file providing the title helper class for elements of a knowledge base
 */
require_once 'OntoWiki/Model/TitleHelper.php';

class AuxilaryFunctions {
	
	static private $paginationLimit = 100;
	static private $limit = 100;
	static private $offset = 0;
	static private $linksPath = "extensions/cubeviz/links/"; 
	
	/*******************************************
	 * Getters and setters for class variables *
	 *******************************************/
	
	static public function getPaginationLimit() {
		return AuxilaryFunctions::$paginationLimit;
	}
	
	static public function setPaginationLimit($paginationLimit) {
		AuxilaryFunctions::$paginationLimit = $paginationLimit;
	}
	
	static public function getLimit() {
		return AuxilaryFunctions::$limit;
	}
	
	static public function setLimit($limit) {
		AuxilaryFunctions::$limit = $limit;
	}
	
	static public function getOffset() {
		return AuxilaryFunctions::$offset;
	}
	
	static public function setOffset($offset) {
		AuxilaryFunctions::$offset = $offset;
	}
	
	/**
	 * Set the axis for dimensions on the assumption of their
	 * elements count (e.g. for dimension 'year' elements are '2000', '2001' etc.)
	 */
	static public function getAxisAllocationDefault($dimensions) {
        $allocation = array();
        $maximumRank = array('order' => 999, 'count' => 0, 'dimension' => '');
        
        foreach($dimensions as $dimension) {
			$order = $dimension->order;
            $count = $dimension->selectedElementCount;                
            if(($order != -1 && $order < $maximumRank['order'])
                    || ($order == -1 && $count > $maximumRank['count'])) {
                $maximumRank['dimension'] = $dimension;
                $maximumRank['order'] = $order;
                $maximumRank['count'] = $count;
            }
        }
        
        /*foreach($dimensions as $dimension) {
            $allocation[$dimension->uri] = ($maximumRank['dimension'] == $dimension ? 'x' : 'z');
            if($dimension->selectedElementCount == 1)
                $allocation[$dimension] = '-';
        }*/
        
        return $allocation;
    }
    
    /**
     * Extract information from $selectedDimensions variable about
     * user specified axes allocation for chosen dimensions
     */
    
   	static public function getAxisAllocationUserDefined($dimensions) {
        $allocation = array();
        
        foreach($dimensions as $dimension) {
			$allocation[$dimension->uri] = $dimension->chartAxis;
        }
                
        return $allocation;
    }
    
    /**
     * 
     */
    static public function getAxisAllocationFinal($selectedDimensions) {
		$allocation = array();
		
		$axisAllocationDefault = AuxilaryFunctions::getAxisAllocationDefault($selectedDimensions);
		$axisAllocationUserDefined = AuxilaryFunctions::getAxisAllocationUserDefined($selectedDimensions);
		$axisAllocationUserDefinedCount = array_count_values($axisAllocationUserDefined);
		
		foreach($axisAllocationUserDefinedCount as $axis => $count) {
			if($count > 1) {
				return $axisAllocationDefault;
			}
		}
		
		return $axisAllocationUserDefined;
	}
    
    /**
     * 
     */
    static public function layoutObservationData($resultObservations, $measOptionList) {
        
        $observationsResult = $resultObservations['observations'];
        $observationsNameTable = $resultObservations['nameTable'];
        
        $distinctDimensionTuples = array();
        $aggregatedMeasureData = array();
        
        foreach($observationsResult as $observationSet) {
            
            $temporaryDimStore = array();
            $temporaryMeasStore = array();
            
            foreach($observationsNameTable['d'] as $dimUriSet) {
                if(isset($observationSet[$dimUriSet['qname']]))
                    $temporaryDimStore[$dimUriSet['qname']] 
                        = htmlentities($observationSet[$dimUriSet['qname']],
                                ENT_QUOTES);
            }
            
            foreach($observationsNameTable['m'] as $measUriSet) {
                if(isset($observationSet[$measUriSet['qname']])) {
                    $uri = $measUriSet['uri'];
                    $temporaryMeasStore[$measUriSet['qname']] 
                        = strval(isset($measOptionList[$uri]['round']) ? 
                            round($observationSet[$measUriSet['qname']]) 
                            : $observationSet[$measUriSet['qname']]);
                }
                else {
                    $temporaryMeasStore[$measUriSet['qname']] = '';
                }
            }
            
            //create this dimension tuple and save measures as first values
            $distinctDimensionTuples[] = $temporaryDimStore;
            $aggregatedMeasureData[] = $temporaryMeasStore;
            
        }
        
        $result = array('dimensionData' => $distinctDimensionTuples, 
                        'measureData' => $aggregatedMeasureData);
                                
        return $result;
    }
    
    /**
     * Adapter translating URI interface variables to the resultCubeSpec
     * variable, that is used in retrieving of observations
     */
     
    static public function resultCubeSpecAdapter($selectedDS,$selectedDimensions,
												$selectedDimensionComponents,$selectedMeasures) {
		// pack the $resultCubeSpec array and send it to 
		//$resultCubeSpec - array(8)
		//["ds"] => URI
        //["dim"] => array() URIs
        //["dimtypes"] => array() ["URI" => uri, md5, type, elemCount, order]
        //["ms"] => URI
        //["mstypes"] => array() ["URI" => uri, md5, type, order]
        //["dimOptionList"] => array() ["URI" => string()]
        //["measFunctionList"] => ["URI" => string()] - SUM
        //["measOptionList"] => ["URI" => string()] - DESC
        //["measOptionList"] => ["URI" => string()] - DESC
        
        //var_dump($selectedDimensions); die;
        
		$resultCubeSpec = array();
		$resultCubeSpec["ds"] = $selectedDS->uri;
					
		foreach($selectedDimensions as $key => $dimension) {
			$resultCubeSpec["dim"][$key] = $dimension->uri;
			
			// TODO: a hack here
			if($dimension->orderDirection == "None") {
				$dimension->orderDirection = "NONE";
			}
			if($dimension->orderDirection == "Ascending") {
				$dimension->orderDirection = "ASC";
			}
			if($dimension->orderDirection == "Descending") {
				$dimension->orderDirection = "DESC";
			}
			
			
			$resultCubeSpec["dimtypes"][$dimension->uri] = array(
				"uri" => $dimension->uri,
				"type" => $dimension->type,
				"elemCount" => $dimension->elementCount,
				"order" => $dimension->order
			);
			//$resultCubeSpec["dimOptionList"][$key][$dimension->uri] = array(
			$resultCubeSpec["dimOptionList"][$dimension->uri] = array(
				"order" => $dimension->orderDirection
			);
			
			// TODO: adhoc solution here (rewrite?)
			foreach($selectedDimensionComponents as $key => $dimensionComponent) {
				if(!isset($resultCubeSpec["dimElemList"][$dimension->uri])) {
					$resultCubeSpec["dimElemList"][$dimension->uri] = array();
				}
				if($dimensionComponent->label == $dimension->label) {
					array_push($resultCubeSpec["dimElemList"][$dimension->uri], $dimensionComponent->property);
				}
			} 
			
		}
		
		foreach($selectedMeasures as $key => $measure) {
			
			// TODO: a hack here
			if($measure->orderDirection == "None") {
				$measure->orderDirection = "NONE";
			}
			if($measure->orderDirection == "Ascending") {
				$measure->orderDirection = "ASC";
			}
			if($measure->orderDirection == "Descending") {
				$measure->orderDirection = "DESC";
			}
			
			if($measure->aggregationMethod == "average") {
				$measure->aggregationMethod = "AVG";
			}
			if($measure->aggregationMethod == "minimum") {
				$measure->aggregationMethod = "MIN";
			}
			if($measure->aggregationMethod == "maximum") {
				$measure->aggregationMethod = "MAX";
			}
			
			$resultCubeSpec["ms"][$key] = $measure->uri;
			$resultCubeSpec["mstypes"][$measure->uri] = array(
				"uri" => $measure->uri,
				"type" => $measure->type,
				"order" => $measure->order
			);
			$resultCubeSpec["measFunctionList"][$measure->uri] = $measure->aggregationMethod;
			$resultCubeSpec["measOptionList"][$measure->uri] = array(
				"order" => $measure->orderDirection
			);
		}
		
		return $resultCubeSpec;
	}
	
	static public function setLimits($selectedDimensions) {
		$selectedDimensions_temp = $selectedDimensions;
		$paginationLimit = AuxilaryFunctions::getPaginationLimit();
		$limit = AuxilaryFunctions::getLimit();
		
		foreach($selectedDimensions_temp as $key => $dim) {	
			// restricting selectedElementCount value
			if($dim->selectedElementCount > $paginationLimit) {
				$dim->selectedElementCount = $paginationLimit;
			}
			if($dim->selectedElementCount > $limit) {
				$dim->selectedElementCount = $limit;
			}
		} 
		
		return $selectedDimensions_temp;
	}
	
	public static function readConfiguration($hashCode) {
		$configuration = array();
		if(file_exists(AuxilaryFunctions::$linksPath . $hashCode)) {
			$parameters = file(AuxilaryFunctions::$linksPath . $hashCode);
			$configuration['sparqlEndpoint'] = trim($parameters[0]);
			$configuration['selectedGraph'] = trim($parameters[1]);
			$configuration['selectedDSD'] = trim($parameters[2]);
			$configuration['selectedDS'] = trim($parameters[3]);
			$configuration['selectedMeasures'] = trim($parameters[4]);
			$configuration['selectedDimensions'] = trim($parameters[5]);
			$configuration['selectedDimensionComponents'] = trim($parameters[6]);
			$configuration['selectedChartType'] = trim($parameters[7]);
		} else {
			die("The configuration you provided does not exist.\n");
		}
		return $configuration;
	}
	
	public static function generateHashCodeForConfiguration($configuration) {
		$hashCode = 0;
		
		$sparqlEndpoint = $configuration['sparqlEndpoint'];
		$selectedGraph = json_decode($configuration['selectedGraph'], true);
		$selectedDSD = json_decode($configuration['selectedDSD'], true);
		$selectedDS = json_decode($configuration['selectedDS'], true);
		$selectedMeasures = json_decode($configuration['selectedMeasures'], true);
		$selectedDimensions = json_decode($configuration['selectedDimensions'], true);
		$selectedDimensionComponents = json_decode($configuration['selectedDimensionComponents'], true);
		
		//just a string
		$sparqlEndpoint = hash('md5', $sparqlEndpoint); 
		//array - label and number (need to refactor the code to throw out number)
		$selectedGraph = hash('md5', $selectedGraph["label"]);
		$selectedDSD = hash('md5', $selectedDSD['uri']);
		$selectedDS = hash('md5', $selectedDS['uri']);
		
		$selectedMeasures = AuxilaryFunctions::extractUri($selectedMeasures, "measures");
		$selectedMeasures = hash('md5', $selectedMeasures);
		
		$selectedDimensions = AuxilaryFunctions::extractUri($selectedDimensions, "dimensions");
		$selectedDimensions = hash('md5', $selectedDimensions);
		
		$selectedDimensionComponents = AuxilaryFunctions::extractDimensionComponents($selectedDimensionComponents);
		
		//concatenate all into one string
		$hash = $sparqlEndpoint . $selectedGraph . $selectedDSD . $selectedDS .
			    $selectedMeasures . $selectedDimensions . $selectedDimensionComponents;
		
		$hash = hash('md5', $hash);
						
		//generate random timestamp for now
		$hashCode = uniqid();
		
		return $hashCode;
	}
	
	private static function extractUri($selectedComponents, $componentSpec) {
		// $componentSpec can be "measures" or "dimensions"
		$selectedComponents_uri = array();
		foreach($selectedComponents[$componentSpec] as $selectedComponent) {
			array_push($selectedComponents_uri, $selectedComponent["uri"]);
		}
		// sort array
		sort($selectedComponents_uri);
		// concat to string
		$selectedComponents_uri = implode($selectedComponents_uri);
		// get hash
		
		return $selectedComponents_uri;
	}
	
	private static function extractDimensionComponents($selectedDimensionComponents) {
		$dimComp_uri = array();
		$i = 0;
		foreach($selectedDimensionComponents as $key => $dimComp) {
			// save current dimComp
			$label_current = $dimComp['label'];
			if(!isset($dimComp_uri[$label_current])) {
				$dimComp_uri[$label_current] = array();
			}
			array_push($dimComp_uri[$label_current], $dimComp['property']);
		}
		// sort by key
		ksort($dimComp_uri);
		$dimComp_strings = array();
		foreach($dimComp_uri as $label => $dimCompUris) {
			sort($dimCompUris);
			$dimComp_uri[$label] = implode($dimCompUris);
		}
		$dimComp_uri = implode($dimComp_uri);
		$hash = hash('md5', $dimComp_uri);
		
		return $hash;
	}
	
	public static function writeConfiguration($configuration) {
		
		$fileName = AuxilaryFunctions::generateHashCodeForConfiguration($configuration);
        $filePath = AuxilaryFunctions::$linksPath . $fileName;
                
		if( false == file_exists($filePath) && true == isset ( $configuration['modelUri'] ) ) {
            
            if ( false === ( $fh = fopen($filePath, 'w') ) ) {
                // can't open the file
                return null;
            }
			
            // write all parameters line by line
			fwrite($fh, $configuration['sparqlEndpoint'] . "\n");
			fwrite($fh, $configuration['selectedGraph'] . "\n");
			fwrite($fh, $configuration['selectedDSD'] . "\n");
			fwrite($fh, $configuration['selectedDS'] . "\n");
			fwrite($fh, $configuration['selectedMeasures'] . "\n");
			fwrite($fh, $configuration['selectedDimensions'] . "\n");
			fwrite($fh, $configuration['selectedDimensionComponents'] . "\n");
			fwrite($fh, $configuration['selectedChartType'] . "\n");
			fwrite($fh, $configuration['modelUri'] . "\n");
			fclose($fh);
			return $fileName;
		} else {
			return $fileName;
		}
		
	}
	
}
