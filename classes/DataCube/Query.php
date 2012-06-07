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
 */
class DataCube_Query {
    
    protected $_model = null;
    
    /**
     * Constructor
     */
    public function __construct (&$model) {
        $this->_model = $model;
    }
	
	/**
	 * Returns array of Data Structure Definitions 
     * @return array
	 */ 
	public function getDataStructureDefinition() {   
		
		$result = array();
        $titleHelper = new OntoWiki_Model_TitleHelper ($this->_model);

		//get all indicators in the cube by the DataStructureDefinitions
		$sparql = 'SELECT ?dsd WHERE {
            ?dsd <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'. DataCube_UriOf::DataStructureDefinition .'>. 
        }';
		
        $queryResultDSD = $this->_model->sparqlQuery($sparql);
    
		foreach($queryResultDSD as $dsd) {
			if( false == empty ($dsd['dsd']) ) {
				// $result[] = $dsd['dsd'];
				if( false == empty ($this->_titleHelper) ) {
                    $titleHelper->addResource($dsd['dsd']);
                }
			}
		}

		foreach($queryResultDSD as $dsd) {
			if( false == empty ($dsd['dsd']) ) {
                $result [] = array ( 
                    'url'   => $dsd['dsd'],
                    'label' => $titleHelper->getTitle($dsd['dsd'])
                );
			}
		}
        
		return $result;
	}  
    
	/**
	 * Function for getting datasets for this data structure
	 * @param $dsUri Data Set Uri
     * @return array
	 */
    public function getDataSets($dsUri) {	
        
        $titleHelper = new OntoWiki_Model_TitleHelper ($this->_model);
        
        //get all data sets in the cube for the given DataStructureDefinition
        $sparql = 'SELECT ?ds WHERE {
            ?ds <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::DataSet.'>.
            ?ds <'.DataCube_UriOf::Structure.'> <'.$dsUri.'>.
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
                    'url'   => $ds ['ds'],
                    'label' => $titleHelper->getTitle($ds['ds'])
                );
            }
        }
        
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
                $entry = array ( 
                    'uri'   => $comp['comp'],
                    'md5'   => md5($comp['comp']),
                    'type'  => $comp['comptype'],
                    'order' => isset($comp['order']) ? $comp['order'] : -1,
                    'label' => $titleHelper->getTitle($comp['comp'])
                );

                if($componentType == 'dimension'){
                    $entry ['elementCount'] = $this->getComponentElementCount(
                        $dsUri, $entry['type']
                    );
                }
                    
                $result[$comp['comp']] = $entry;
            }
        }
        
        return $result;
    }
    
    /**
     * Returns an array of all dimension properties
     * @return array
     */
    public function getDimensionProperties () {
        
        $sparql = 'SELECT DISTINCT ?propertyUri ?rdfsLabel WHERE {
            ?propertyUri ?p <'. DataCube_UriOf::DimensionProperty.'>.
            OPTIONAL { ?propertyUri <http://www.w3.org/2000/01/rdf-schema#label> ?rdfsLabel }
        };';
        
        return $this->_model->sparqlQuery($sparql);
    }   
    
    /**
     * Returns an array of all measure properties
     * @return array
     */
    public function getMeasureProperties () {
        
        $sparql = 'SELECT DISTINCT ?propertyUri ?rdfsLabel WHERE {
            ?propertyUri ?p <'. DataCube_UriOf::MeasureProperty.'>.
            OPTIONAL { ?propertyUri <http://www.w3.org/2000/01/rdf-schema#label> ?rdfsLabel }
        };';
        
        return $this->_model->sparqlQuery($sparql);
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
                        
        return $result;
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
        
        $sparqlSelect = 'SELECT ';
        $sparqlWhere  = ' WHERE {
            ?observation <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'. DataCube_UriOf::Observation .'> .
            ?observation <'. DataCube_UriOf::DataSetRelation .'> <'. $dsUri .'> . ';
        
        $sparqlGroupBy = '';
        $sparqlOrderBy = '';
        
        // add all dimensions to the query
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
            
            $this->_titleHelper->addResource($dimension);
            
            // 
            $internalNameTable['d'][$dimension] = array ( 
                'index' => $index, 
                'qname' => $dimQName,
                'uri' => $dimension,
                'type' => $dimensionTypes [$dimension]['type']
            );
            
            // add constraints for the dimension element selection in the observations
            if ( true == isset($dimensionElements [$dimension]) ) {
                
                $dimElemList = DataCube_Query::getComponentElements ($dsUri, $dimPropertyUri);
                $falseList = array_diff($dimElemList, $dimensionElements [$dimension]);
                
                if(count($falseList)>0) {
                    
                    $sparqlWhere .= count($falseList) < 80 ? 
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
        
        // add all measures to the query
        foreach($measures as $index => $measure) {
            
            $this->_titleHelper->addResource($measure);
            
            $measPropertyUri = $measureTypes [$measure]['type'];
            $measQName = 'm'. $index;
            
            $sparqlSelect .= ' '. $measureAggregationMethods [$measure] . '(?'. $measQName .') AS ?'. $measQName;    
            
            $sparqlWhere .= ' ?observation <'. $measureTypes [$measure]['type'] .'> ?'. $measQName .'.';
            
            if ( $measureOptions [$measure]['order'] != 'NONE' ) {
                $sparqlOrderBy .= $measureOptions [$measure]['order'] . '(?'.$measQName.') ';
            
                $internalNameTable['m'][$measure] = array ( 
                    'index' => $index,
                    'qname' => $measQName,
                    'uri'   => $measure,
                    'type'  => $measureTypes [$measure]['type']
                ); 
            }
        
            foreach($internalNameTable as $type => $compSpec) {
                foreach($compSpec as $uri => $elements) {
                    $internalNameTable[$type][$uri]['label'] 
                        = $this->_titleHelper->getTitle($elements['uri']); 
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
}
