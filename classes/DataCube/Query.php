<?php
/**
 * This class provide interface for querying the Data Cube
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov 
 * @author Konrad Abicht 
 */
class DataCube_Query 
{    
    protected $_model = null;
    protected $_store = null;
    
    /**
     * Constructor
     */
    public function __construct (&$model)
    {
        $this->_model = $model;
        $this->_store = $model->getStore();
    }
	
	/**
	 * Returns array of Data Structure Definitions 
     * @return array
	 */ 
	public function getDataStructureDefinitions ()
    {
		$result = array();
        
        $titleHelper = new OntoWiki_Model_TitleHelper ($this->_model);
        
		//get all indicators in the cube by the DataStructureDefinitions
		$sparql = 'SELECT ?dsd WHERE {
            ?dsd <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'. DataCube_UriOf::DataStructureDefinition .'>. 
        }';
		
        $queryResultDSD = $this->_model->sparqlQuery($sparql);
    
		foreach($queryResultDSD as $dsd) {
			if( false == empty ($dsd['dsd']) ) {
				$titleHelper->addResource($dsd['dsd']);
			}
		}

		foreach($queryResultDSD as $dsd) {
			if( false == empty ($dsd['dsd']) ) {
                $result [] = array ( 
                    'url'       => $dsd['dsd'],
                    'hashedUrl' => md5($dsd['dsd']),
                    'label'     => str_replace('"', "'", $titleHelper->getTitle($dsd['dsd']))
                );
			}
		}
        
        usort ( 
            $result, 
            function ($a, $b) { return strcasecmp ($a['label'], $b['label']); } 
        ); 
        
		return $result;
	}  
    
	/**
	 * Function for getting datasets for this data structure
	 * @param $dsUri Data Set Uri
     * @return array
	 */
    public function getDataSets($dsdUri) {	
        
        $titleHelper = new OntoWiki_Model_TitleHelper ($this->_model);
        
        //get all data sets in the cube for the given DataStructureDefinition
        $sparql = 'SELECT ?ds WHERE {
            ?ds <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::DataSet.'>.
            ?ds <'.DataCube_UriOf::Structure.'> <'.$dsdUri.'>.
        };';

        $queryResultDS = $this->_model->sparqlQuery($sparql);

        $result = array();

        foreach($queryResultDS as $ds) {
            if(false == empty($ds['ds'])) {
                $titleHelper->addResource($ds['ds']);
            }
        }

        foreach($queryResultDS as $ds) {
            if(false == empty($ds['ds'])) {
                $result[] = array (
                    'url'       => $ds['ds'],
                    'hashedUrl' => md5($ds['ds']),
                    'label'     => str_replace('"', "'", $titleHelper->getTitle($ds['ds']))
                );
            }
        }
        
        usort ( 
            $result, 
            function ($a, $b) { return strcasecmp ($a['label'], $b['label']); } 
        ); 
        
        return $result;
    }
    
    /**
     * Returns an array of components (Component) with md5 of URI, type and URI.
     * @param $dsdUri Data Structure Definition URI
     * @param $dsUri Data Set URI
     * @param $component DataCube_UriOf::Dimension or ::Measure
     * @return array
     */
	public function getComponents($dsdUri, $dsUri, $componentType) {
              
        if ( $componentType != DataCube_UriOf::Dimension && 
             $componentType != DataCube_UriOf::Measure ) {
            throw new CubeViz_Exception (
                'Invalid component type given! '. 
                'You have to use '. DataCube_UriOf::Dimension .' or '. DataCube_UriOf::Measure
            );
        }
                
        $titleHelper = new OntoWiki_Model_TitleHelper ($this->_model);
                
        //search for the components specified by the parameters
        $sparql = 'SELECT ?comp ?comptype ?order WHERE {
            <'.$dsdUri.'> <'.DataCube_UriOf::Component.'> ?comp.                
            ?comp <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::ComponentSpecification.'>.
            ?comp <'.$componentType.'> ?comptype.
            
            OPTIONAL {?comp <'.DataCube_UriOf::Order.'> ?order.}
        }
        ORDER BY ASC(?order);';

        $queryresultComp = $this->_model->sparqlQuery($sparql);
                
        $result = array();
        
        // iterate through all found results
        foreach($queryresultComp as $comp) {
            if(false == empty($comp['comp'])) {
                $titleHelper->addResource($comp['comp']);
            }
        }
        
        // iterate through all found results again and add title
        foreach($queryresultComp as $comp) {
            if(false == empty($comp['comp'])) {
				//add the component properties to the result set
                $element = array ( 
                    'label'     => str_replace('"', "'", $titleHelper->getTitle($comp['comp'])),
                    'order'     => isset($comp['order']) ? $comp['order'] : -1,
                    'url'       => $comp['comp'],
                    'hashedUrl' => md5($comp['comp']),
                    'typeUrl'   => $comp['comptype']
                );
                
                if ( DataCube_UriOf::Dimension == $componentType ) {
                    $element ['elements'] = $this->getComponentElements($dsUri, $comp['comptype']);
                }
                
                $result [] = $element;
            }
        }
        
        usort ( 
            $result, 
            function ($a, $b) { return strcasecmp ($a['label'], $b['label']); } 
        ); 
        
        return $result;
    }
    
    /**
     * Returns an array of Resources which has a certain relation ($componentProperty) to a dataset.
     * @param $dataSetUri DataSet Uri
     * @param $componentProperty Uri of a certain dimension property
     * @param $limit Limit number of result entries
     * @param $offset Start position in result 
     * @return array
     */
    public function getComponentElements($dataSetUri, $componentProperty, $limit = 0, $offset = 0) {
        
        $sparql = 'SELECT DISTINCT ?element WHERE {
            ?observation <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::Observation.'>.
            ?observation <'.DataCube_UriOf::DataSetRelation.'> <'.$dataSetUri.'>.
            ?observation <'.$componentProperty.'> ?element.
        } 
        ORDER BY ASC(?element)';
        
        $sparql .= 0 < $limit ? ' LIMIT '. $limit : '';
        $sparql .= 0 < $limit && 0 <= $offset ? ' OFFSET '. $offset .';' : '';
        
        $queryResultElements = $this->_model->sparqlQuery($sparql);
		
		
        $result = array();
        
		foreach($queryResultElements as $key => $element) {
            if(false == empty ($element['element'])) {
				$result[$key] = $element['element'];
			}
        }
        
        $titleHelper = new OntoWiki_Model_TitleHelper ($this->_model); 
        
        foreach($result as $key => $element) {
            if($this->isUrl($element)) {
				$titleHelper->addResource($element);
			}
		}
		
		$result_with_labels = array();
		foreach($result as $key => $element) {
            $result_with_labels[$key]['propertyLabel'] = true == $this->isUrl($element) 
                ? str_replace('"', "'", $titleHelper->getTitle ( $element ))
                : str_replace('"', "'", $element);
        
            $result_with_labels[$key]['hashedProperty'] = md5 ($element);
			$result_with_labels[$key]['property'] = $element;
		}
		                                
        return $result_with_labels;
    }
	
	/**
	 * 
	 * 
	 */
	public function getComponentElementCount($dsUri, $componentProperty) {

        return count ( $this->getComponentElements ( $dsUri, $componentProperty ) );
    } 
       
    /**
     * 
     */
    public function getObservations ($linkConfiguration) {
        
        // Case: link configuration was found and loaded
        if ( 0 < count ( $linkConfiguration ) ) {
            // Extract and save neccessary parameters from link configuration
            $selectedComponents = $linkConfiguration['selectedComponents'];
            $dataSetUrl = $linkConfiguration['selectedDS']['url'];		
            $selCompDims = $linkConfiguration['selectedComponents']['dimensions'];
        } 
        
        // Case: no link configuration was given
        else {
            
            // set default values for DSD
            $dataStructureDefinitionUrl = $this->getDataStructureDefinitions();
            $dataStructureDefinitionUrl = $dataStructureDefinitionUrl [0]['url'];
            
            // ... and DS
            $dataSetUrl = $this->getDataSets($dataStructureDefinitionUrl);
            $dataSetUrl = $dataSetUrl [0]['url'];
            
            $tmp = $this->getComponents (
                $dataStructureDefinitionUrl, $dataSetUrl, DataCube_UriOf::Dimension
            );
            
            $selCompDims = array ();
            
            foreach ( $tmp as $dimension ) {
                $dimension ['elements'] = array($dimension ['elements'][0]);
                $selCompDims [] = $dimension;
            }
        }
        		 
        /**
         * Fill SimpleQuery object with live!
         */
		$queryObject = new Erfurt_Sparql_SimpleQuery();
		
        // CONSTRUCT
		$queryObject->setProloguePart('CONSTRUCT {?s ?p ?o}');
	
        // FROM
		$queryObject->setFrom(array ($this->_model->getModelIri()));
        
        // WHERE
		$where = 'WHERE { ' ."\n" .'
			?s ?p ?o .' ."\n" .'
            ?s <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'. DataCube_UriOf::Observation.'> .' . "\n".'
            ?s <'.DataCube_UriOf::DataSetRelation.'> <'.$dataSetUrl.'> .' ."\n";
        
        $i = 0;
        // Set selected properties (e.g. ?s <http://data.lod2.eu/scoreboard/properties/year> ?d0 .)
        foreach ( $selCompDims as $ele ) {
            $where .= ' ?s <'. $ele ['typeUrl'] .'> ?d'. $i++ .' .'. "\n";
        }
        
        // Set FILTER (e.g. FILTER (?d1 = "2003" OR ?d1 = "2001" OR ?d1 = "2002") )
        $i = 0;
        foreach ( $selCompDims as $dim ) {
            
            $dimElements = $dim ['elements'];
            
            if ( 0 < count ( $dimElements ) ) {
            
                $filter = array ();
            
                foreach ( $dimElements as $element ) {
                    
                    // If property is an URL
                    if ( true == $this->isUrl ( $element ['property'] ) ) {
                        $filter [] = ' ?d'. $i .' = <'. $element ['property'] .'> ';
                        
                    // If property is NOT an URL
                    } else {
                        $filter [] = ' ?d'. $i .' = "'. $element ['property'] .'" ';
                    }
                }
                
                $i++;
                $where .= ' FILTER (' . implode ( 'OR', $filter ) .') ' . "\n";
            }
        }
        
        $where .= '}';    
		
        $queryObject->setWherePart($where);
        
        // send query, return result as JSON
        $result = json_decode ( $this->_store->sparqlQuery (
            $queryObject, 
            array('result_format' => 'json')
        ), true );
        
        $tmp = array ();
        $titleHelper = new OntoWiki_Model_TitleHelper ($this->_model); 
        
        foreach ( $result as $entry ) {
            $count = count ( $entry );
            foreach ( $entry as $key => $ele ) { 
                if ( 'uri' == $entry [$key] [0]['type'] ) {
                    $titleHelper->addResource ( $ele [0]['value'] );
                }
            }
        }
        
        foreach ( $result as $entry ) {
            $count = count ( $entry );
            $tmpEntry = $entry;
            foreach ( $entry as $key => $ele ) {
                if ( 'uri' == $entry [$key] [0]['type'] ) {
                    $tmpEntry [$key][0]['label'] = str_replace('"', "'", $titleHelper->getTitle($ele [0]['value']));
                }
                $entry [$key] [0]['typeUrl'] = $entry [$key] [0]['type'];
                unset($entry [$key] [0]['type']);
            }
            $tmp [] = $tmpEntry;
        }
        
        return $tmp;
	}
    
    private function isUrl($url) {
		$url_pattern = "#((http|https|ftp)://(\S*?\.\S*?))(\s|\;|\)|\]|\[|\{|\}|,|\"|'|:|\<|$|\.\s)#ie";
		return preg_match($url_pattern, $url);
	}
	
	/**
     * 
     */
    public function getResultObservationsFromLink($link) {
		
		$dsUri = $link['selectedDS']['url'];
		
		$dimensions = array();
		$dimensionTypes = null;
		$dimensionOptions = null;
		$dimensionElements = null;
		
		for($i = 0, $dimensions_length = sizeof($link['selectedDimensions']['dimensions']); $i < $dimensions_length; $i++) {
			$url = $link['selectedDimensions']['dimensions'][$i]["url"];
			array_push($dimensions, $url);
			
			$dimensionTypes[$url] = array();
			$dimensionTypes[$url]['url'] = $url;
			$dimensionTypes[$url]['typeUrl'] = $link['selectedDimensions']['dimensions'][$i]['typeUrl'];
			$dimensionTypes[$url]['order'] = '-1';
			
			$dimensionOptions[$url] = array();
			$dimensionOptions[$url]['order'] = 'NONE';
			
			$dimensionElements[$url] = array();
		}
		
		for($i = 0, $dimComp_length = sizeof($link['selectedDimensionComponents']['selectedDimensionComponents']); $i < $dimComp_length; ++$i) {
			$url = $link['selectedDimensionComponents']['selectedDimensionComponents'][$i]['dimension_url'];
			array_push($dimensionElements[$url], $link['selectedDimensionComponents']['selectedDimensionComponents'][$i]['property']);
		}
		
		$measures = array();
		$measureTypes = null;
		$measureAggregationMethods = null;
		$measureOptions = null;
		
		for($i = 0, $meas_length = sizeof($link['selectedMeasures']['measures']); $i < $meas_length; ++$i) {
			$url = $link['selectedMeasures']['measures'][$i]['url'];
			array_push($measures, $url);
			$measureTypes[$url] = array();
			$measureTypes[$url]['url'] = $url;
			$measureTypes[$url]['typeUrl'] = $link['selectedMeasures']['measures'][$i]['typeUrl'];
			$measureTypes[$url]['order'] = '-1';
			$measureAggregationMethods[$url] = 'sum';
			$measureOptions[$url]['order'] = 'NONE';
		}

		return $this->getObservations($dsUri, 
            $dimensions, $dimensionElements, $dimensionTypes, $dimensionOptions, 
            $measures, $measureTypes, $measureAggregationMethods, $measureOptions);
	}
    
    /**
     * 
     * @param $dsUri Data Set URI
     * @param $dimensions Array of dimension URI's
     * @param $dimensionElements Array of dimension URI's
     * @param $dimensionLimits Array of elements with structure: dimension URI => order (NONE, ASC, DESC)
     * @param $dimensionOptions Array of elements with structure: dimension URI => order (NONE, ASC, DESC)
     * @param $dimensionTypes Array of elements with structure: dimension URI => uri, md5, type, elemCount, order
     * @param $measures Array of measure URI
     * @param $measureTypes Array of elements with structure: measure URI => uri, md5, type, order
     * @param $measureAggregationMethod Array of elements with structure: measure URI => aggregation (AVG, MIN or MAX)
     * @param $measureOptions Array of elements with structure: measure URI => order (NONE, ASC, DESC)
     * @return
     */
    public function getResultObservations($dsUri, $dimensions, $dimensionElements, $dimensionTypes, 
        $dimensionOptions, $measures, $measureTypes, $measureAggregationMethods, $measureOptions) {
        
        $internalNameTable = array ();       
        $titleHelper = new OntoWiki_Model_TitleHelper ($this->_model); 

		// change to CONSTRUCT { ?s ?p ?o } WHERE { ?s ?p ?o . ?s a qb:Observation . }
        $sparqlSelect = 'SELECT ';
        $sparqlWhere  = ' WHERE {
            ?observation <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'. DataCube_UriOf::Observation .'> .
            ?observation <'. DataCube_UriOf::DataSetRelation .'> <'. $dsUri .'> . ';
        
        $sparqlGroupBy = '';
        $sparqlOrderBy = '';
        
        // add all dimensions to the query
        foreach($dimensions as $index => $dimension) {
            $titleHelper->addResource($dimension);
        }
            
        foreach($dimensions as $index => $dimension) {
            
            $dimPropertyUri = $dimensionTypes [$dimension]['type'];
            
            // temporary name of this dimension
            $dimQName = 'd'. $index;
                        
            $dimensionOptions [$dimension]['order'] = strtoupper($dimensionOptions [$dimension]['order']);
            
            // only add those dimensions for which more than one element was selected
            if (1 < $dimensionTypes[$dimension]['elemCount']) {
                $sparqlSelect .= ' ?'. $dimQName;
                $sparqlGroupBy .= ' ?'. $dimQName;
                
                if ( $dimensionOptions [$dimension]['order'] != 'NONE' ) {
                    $sparqlOrderBy .= $dimensionOptions [$dimension]['order'] .'(?'.$dimQName.') ';
                }
            }
            
            // predicate is here the URI of a dimension                
            $sparqlWhere .= ' ?observation <'. $dimensionTypes [$dimension]['type'] .'> ?'. $dimQName . '.';
            
            // 
            $internalNameTable['d'][$dimension] = array ( 
                'index'     => $index, 
                'qname'     => $dimQName,
                'url'       => $dimension,
                'label'     => str_replace('"', "'", $titleHelper->getTitle($dimension)),
                'type'      => $dimensionTypes [$dimension]['type']
            );
            
            // add constraints for the dimension element selection in the observations
            if ( true == isset($dimensionElements [$dimension]) ) {
                
                //$dimElemList = DataCube_Query::getComponentElements ($dsUri, $dimPropertyUri);
                $falseList = array_diff($dimElemList, $dimensionElements [$dimension]);
                $count = count($falseList);
                
                if(0 < $countFalseList) {
                    
                    $sparqlWhere .= $countFalseList < 80 ? 
                        // if the falselist contains less than 80 elements, dont use filter statement
                        ' FILTER ( NOT(' : 
                        // else use the regular filter statement
                        ' FILTER ( (';

                    foreach($falseList as $element) {
                        $elementString = '<'.$element.'>';
                        
                        if( false === strpos($element, 'http://') ) 
                            $elementString = '"'.$element.'"';
                            
                        $sparqlWhere.= ' ?'. $dimQName .' = '. $elementString .' OR';
                    }

                    $sparqlWhere = substr($sparqlWhere, 0, strlen($sparqlWhere)-3) .')).';
                }
            }
            
            // add element constraints if the dimension elements are paginated
            if( true == isset($dimensionLimits[$dimension]) ) {
                
                $dimElemList = $this->getComponentElements (
                    $dsUri, $dimensionTypes [$dimension]['type'], null, 
                    $dimensionLimits[$dimension]
                );
                
                $sparqlWhere = substr($sparqlWhere,0,strlen($queryWherePart)-1).
                        ' FILTER (';
                
                foreach($dimElemList as $element) {
                    $elementString = '<'.$element.'>';
                    if( false === strpos($element, 'http://')) 
                        $elementString = '"'.$element.'"';
                    $queryWherePart.= ' ?'. $dimQName .' = '. $elementString .' OR';
                }
                
                $queryWherePart = substr($queryWherePart, 0, strlen($queryWherePart)-3) .').';
            }
        }
        
        $titleHelper = new OntoWiki_Model_TitleHelper ($this->_model); 
        
        // add all measures to the query
        foreach($measures as $index => $measure) {
            
            if ( $measureOptions [$measure]['order'] != 'NONE' ) {
            
                $internalNameTable['m'][$measure] = array ( 
                    'index' => $index,
                    'qname' => $measQName,
                    'url'   => $measure,
                    'type'  => $measureTypes [$measure]['type']
                ); 
            }
        
            foreach($internalNameTable as $type => $compSpec) {
                foreach($compSpec as $uri => $elements) {
                    $internalNameTable[$type][$uri]['label'] = $titleHelper->addResource($elements['url']); 
                }
            }
        }    
        
        foreach($measures as $index => $measure) {
            
            $measPropertyUri = $measureTypes [$measure]['type'];
            $measQName = 'm'. $index;
            
            $sparqlSelect .= ' '. $measureAggregationMethods [$measure] . '(?'. $measQName .') AS ?'. $measQName;    
            
            $sparqlWhere .= ' ?observation <'. $measureTypes [$measure]['type'] .'> ?'. $measQName .'.';
            
            if ( $measureOptions [$measure]['order'] != 'NONE' ) {
                $sparqlOrderBy .= $measureOptions [$measure]['order'] . '(?'.$measQName.') ';
            
                $internalNameTable['m'][$measure] = array ( 
                    'index' => $index,
                    'qname' => $measQName,
                    'url'   => $measure,
                    'type'  => $measureTypes [$measure]['type']
                ); 
            }
        
            foreach($internalNameTable as $type => $compSpec) {
                foreach($compSpec as $uri => $elements) {
                    $internalNameTable[$type][$uri]['label'] = $titleHelper->getTitle($elements['url']); 
                }
            }
            
            //add group-by- and order-by-statements only if there are things to group and to sort
            $sparqlWhere .= '} ';
            
            if ('' != $sparqlGroupBy)
                $sparqlWhere .= ' GROUP BY '. $sparqlGroupBy;
                
            if ('' != $sparqlOrderBy)
                $sparqlWhere .= ' ORDER BY '. $sparqlOrderBy;
                                    
            return array (
                'observations' => $this->_model->sparqlQuery($sparqlSelect . $sparqlWhere), 
                'nameTable' => $internalNameTable
            );
        }
    }
    
    /**
     * Returns an array of all dimension properties
     * @return array
     */
    public function getDimensionProperties () {
        
        $sparql = 'SELECT DISTINCT ?url ?label WHERE {
            ?propertyUri ?p <'. DataCube_UriOf::DimensionProperty.'>.
            OPTIONAL { ?propertyUri <http://www.w3.org/2000/01/rdfschema#label> ?rdfsLabel }
        };';
        
        return $this->_model->sparqlQuery($sparql);
    }   
    
    /**
     * Returns an array of all measure properties
     * @return array
     */
    public function getMeasureProperties () {
        
        $sparql = 'SELECT DISTINCT ?url ?label WHERE {
            ?propertyUri ?p <'. DataCube_UriOf::MeasureProperty.'>.
            OPTIONAL { ?propertyUri <http://www.w3.org/2000/01/rdf-schema#label> ?rdfsLabel }
        };';
        
        return $this->_model->sparqlQuery($sparql);
    }
    
    /**
     * Check if there is at least one observation in the knowledgebase
     */
    public function containsDataCubeInformation () {
        $sparql = 'PREFIX qb:<http://purl.org/linked-data/cube#>
                    ASK FROM http://data.lod2.eu/scoreboard/ 
                    {
                        ?observation a qb:Observation .
                        ?observation qb:dataSet ?dataset .
                        ?observation ?dimension ?dimelement .
                        ?observation ?measure ?value .

                        ?dataset a qb:DataSet .
                        ?dataset qb:structure ?datastructuredefintion .

                        ?datastructuredefintion a qb:DataStructureDefinition .
                        ?datastructuredefintion qb:component ?dimensionspecification .
                        ?datastructuredefintion qb:component ?measurespecification .

                        ?dimensionspecification a qb:ComponentSpecification .
                        ?dimensionpecification qb:dimension ?dimension .

                        ?measurespecification a qb:ComponentSpecification .
                        ?measurespecification qb:measure ?measure .
                    }';
            
        return 1 == count ( $this->_model->sparqlQuery($sparql) ) ? true : false;
    }
}
