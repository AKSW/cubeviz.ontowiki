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
	
	/**
	 * Variables from the config file
	 */
	//special entities
	static private $qb = "http://purl.org/linked-data/cube#";
	static private $rdfType = "http://www.w3.org/1999/02/22-rdf-syntax-ns#type";
	static private $rdfsLabel = "http://www.w3.org/2000/01/rdf-schema#label";
	
	//cube concepts
	static private $qb_DataStructureDefinition = "http://purl.org/linked-data/cube#DataStructureDefinition";
	static private $qb_ComponentSpecification = "http://purl.org/linked-data/cube#ComponentSpecification";
	static private $qb_ComponentProperty = "http://purl.org/linked-data/cube#ComponentProperty";
	static private $qb_DimensionProperty = "http://purl.org/linked-data/cube#DimensionProperty";
	static private $qb_MeasureProperty = "http://purl.org/linked-data/cube#MeasureProperty";
	static private $qb_AttributeProperty = "http://purl.org/linked-data/cube#AttributeProperty";
	static private $qb_DataSet = "http://purl.org/linked-data/cube#DataSet";
	static private $qb_Observation = "http://purl.org/linked-data/cube#Observation";

	//cube properties
	static private $qb_component = "http://purl.org/linked-data/cube#component";
	static private $qb_measure = "http://purl.org/linked-data/cube#measure";
	static private $qb_dimension = "http://purl.org/linked-data/cube#dimension";
	static private $qb_attribute = "http://purl.org/linked-data/cube#attribute";
	static private $qb_order = "http://purl.org/linked-data/cube#order";
	static private $qb_datasetrel = "http://purl.org/linked-data/cube#dataset";
	static private $qb_structure = "http://purl.org/linked-data/cube#structure";

	//chart types
	
	/**
	 * Function for retrieving Data Structure Definitions of the 
	 * Data Cube through OntoWiki ODBC
	 */ 
	static public function getDataStructureDefinition($titleHelper = null) {   
		$store = Erfurt_App::getInstance()->getStore();
		
		//get the required initializations
		$queryDSD = new Erfurt_Sparql_SimpleQuery();
		$result = array();

		//get all indicators in the cube by the DataStructureDefinitions
		$queryDSD->setProloguePart('SELECT ?dsd');
		$queryDSD->setWherePart('WHERE {?dsd <'.DataCube_Query::$rdfType.'> <'.DataCube_Query::$qb_DataStructureDefinition.'>}');
		//$store = Erfurt_App::getInstance()->getStore();
		$queryResultDSD = $store->sparqlQuery($queryDSD);

		foreach($queryResultDSD as $dsd) {
			if(isset($dsd['dsd'])) {
				$result[] = $dsd['dsd'];
				if(isset($titleHelper)) $titleHelper->addResource($dsd['dsd']);
			}
		}
		return $result;
	}
	
	/**
	 * Function for getting datasets for this data structure
	 * dataStructure = http://data.lod2.eu/scoreboard/DSD_a110cc8322b900af0121c5860fc1d9fe
	 */
    static public function getDataSets($dsUri, $titleHelper = null) {	
		$store = Erfurt_App::getInstance()->getStore();
			
        //get the required initializations
        $queryDS = new Erfurt_Sparql_SimpleQuery();
        $result = array();

        //get all data sets in the cube for the given DataStructureDefinition
        $queryDS->setProloguePart('SELECT ?ds');
        $queryDS->setWherePart('WHERE {?ds <'.DataCube_Query::$rdfType.'> 
            <'.DataCube_Query::$qb_DataSet.'>.
            ?ds <'.DataCube_Query::$qb_structure.'> <'.$dsUri.'>.}');

        $queryResultDS = $store->sparqlQuery($queryDS);

        foreach($queryResultDS as $ds) {

            if(isset($ds['ds'])) {
                $result[] = $ds['ds'];
                if(isset($titleHelper)) $titleHelper->addResource($ds['ds']);
            }
        }
        
        return $result;
    }
    
    /**
     * Function for getting components (dimension | measure)
     */
	static public function getComponents($dsdUri, $dsUri, $componentType, $titleHelper = null) {
        $store = Erfurt_App::getInstance()->getStore();
        
        // dimension | measure
        $typeVarName = "qb_" . $componentType;
        
        $result = array();
        
        //search for the components specified by the parameters
        $queryComp = new Erfurt_Sparql_SimpleQuery();
        $queryComp->setProloguePart('SELECT ?comp ?comptype ?order');
        $queryComp->setWherePart('WHERE {<'.$dsdUri.'> <'.DataCube_Query::$qb_component.'> ?comp.                
                                    ?comp <'.DataCube_Query::$rdfType.'> 
                                        <'.DataCube_Query::$qb_ComponentSpecification.'>.
                                    ?comp <'.DataCube_Query::$$typeVarName.'> ?comptype.
                                    OPTIONAL {?comp <'.DataCube_Query::$qb_order.'> ?order.}}
                                  ORDER BY ASC(?order)');

        $queryresultComp = $store->sparqlQuery($queryComp);
        //iterate through all found results
        foreach($queryresultComp as $comp) {
            if(isset($comp['comp'])) {
				//add the component properties to the result set
                $result[$comp['comp']]['uri'] = $comp['comp'];
                $result[$comp['comp']]['md5'] = md5($comp['comp']);
                $result[$comp['comp']]['type'] = $comp['comptype'];
                if($componentType == 'dimension') {
					
                    $result[$comp['comp']]['elementCount'] 
                        = DataCube_Query::getComponentElementCount($dsUri, $comp['comptype']);
                }
                $result[$comp['comp']]['order'] 
                    = (isset($comp['order']) ? $comp['order'] : -1);
                if(isset($titleHelper)) $titleHelper->addResource($comp['comp']);
            }
        }
        
        return $result;
    }
    
    /**
     * TODO: put comments
     */
    static public function getComponentElements($dsUri, $componentProperty, $model = null, $limits = array()) {
        $store = Erfurt_App::getInstance()->getStore();
        
        //var_dump($titleHelper); die;
        
        //dsUri =  "http://data.lod2.eu/scoreboard/DS_6b611b19ff2a0b58057966f04dd1ddcb"
		//componentProperty =  "http://data.lod2.eu/scoreboard/properties/country"
        
        $result = array();
        $result_label = array();
                
        $queryComponentElements = new Erfurt_Sparql_SimpleQuery();
        $queryComponentElements->setProloguePart('SELECT DISTINCT(?element)');
        
        $wherePart = 'WHERE {?observation <'.DataCube_Query::$rdfType.'> <'.DataCube_Query::$qb_Observation.'>.
            ?observation <'.DataCube_Query::$qb_datasetrel.'> <'.$dsUri.'>.
            ?observation <'.$componentProperty.'> ?element.} ORDER BY ASC(?element)';
        
        if(count($limits)>0) {
            $wherePart .= ' LIMIT '.$limits['limit'].' OFFSET '.$limits['offset'];
        }
        
        $queryComponentElements->setWherePart($wherePart);
        
        $queryResultElements = $store->sparqlQuery($queryComponentElements);
		
		foreach($queryResultElements as $key => $element) {
            if(isset($element['element'])) {
				$result[$key] = $element['element'];
			}
        }
                        
        return $result;
    }
    
    static public function getLabels($uris, $model) {
		/***********************************************
		 * TODO: Unoptimal usage of Title Helper below *
		 ***********************************************/
		
		$result = array();
		
        foreach($uris as $uri) {
			//initialize titleHelper
			$titleHelper = new OntoWiki_Model_TitleHelper($model);
	        $titleHelper->addResource($uri);
			$result[] = $titleHelper->getTitle($uri);
        }
        
        return $result;
	}
    
    /**
     * Function for retrieving the graph names from the specified SPARQL Endpoint
     * TODO: Micha
     */
    static public function getGraphs($sparqlEndpoint) {
		$graphs = array();
		
		return $graphs;
	}
	
	/**
	 * 
	 * 
	 */
	static private function getComponentElementCount($dsUri, $componentProperty) {
        $store = Erfurt_App::getInstance()->getStore();
        $result = 0;
                
        $queryComponentElementCount = new Erfurt_Sparql_SimpleQuery();
        $queryComponentElementCount->setProloguePart('SELECT COUNT(DISTINCT(?element)) 
            AS ?elemCount');
        $queryComponentElementCount->setWherePart('WHERE {?observation 
            <'.DataCube_Query::$rdfType.'> <'.DataCube_Query::$qb_Observation.'>.
            ?observation <'.DataCube_Query::$qb_datasetrel.'> <'.$dsUri.'>.
            ?observation <'.$componentProperty.'> ?element.}');
        
        $queryResultElementCount 
            = $store->sparqlQuery($queryComponentElementCount);

        $countRow = current($queryResultElementCount);
        $result = (int) $countRow['elemCount'];
        
        return $result;
    } 
    
    /**
     * 
     * 
     */
    static public function getResultObservations($resultCubeSpec, $model) {
        
        //$resultCubeSpec - array(8)
        //["ds"] => URI
        //["dim"] => array() URIs
        //["dimtypes"] => array() ["URI" => uri, md5, type, elemCount, order]
        //["ms"] => URI
        //["mstypes"] => array() ["URI" => uri, md5, type, order]
        //["dimOptionList"] => array() ["URI" => string()]
        //["measFunctionList"] => ["URI" => string()] - SUM
        //["measOptionList"] => ["URI" => string()] - DESC
        
        $internalNameTable = array();
        
        $titleHelper = new OntoWiki_Model_TitleHelper($model);
        
        $queryProloguePart = "SELECT";
        $queryWherePart = "WHERE { ?observation <".DataCube_Query::$rdfType."> 
            <".DataCube_Query::$qb_Observation.">.";
        $queryWherePart .= " ?observation <".DataCube_Query::$qb_datasetrel."> 
            <".$resultCubeSpec['ds'].">.";
        $queryGroupByPart = "";
        $queryOrderByPart = "";
        
        $queryComp = new Erfurt_Sparql_SimpleQuery();
        
        //add all dimensions to the query
        foreach($resultCubeSpec['dim'] as $index => $dimension) {
            
            $dimPropertyUri = $resultCubeSpec['dimtypes'][$dimension]['type'];
            $dimQName = "d".$index;
            
            /*if ( false == isset ($resultCubeSpec['dimOptionList'][$dimension]) ) {
                $resultCubeSpec['dimOptionList'][$dimension] = array ();
                $resultCubeSpec['dimOptionList'][$dimension]['order'] = '';
            }*/
            
            //$queryOrderByPart = 'ASC';
            
            $resultCubeSpec['dimOptionList'][$dimension]['order'] = 
					strtoupper($resultCubeSpec['dimOptionList'][$dimension]['order']);
            //only add those dimensions for which more than one element was
            //selected
            if($resultCubeSpec['dimtypes'][$dimension]['elemCount'] != 1) {
                $queryProloguePart.= " ?".$dimQName;
                $queryGroupByPart .= " ?".$dimQName;
                
                $queryOrderByPart .= ($resultCubeSpec['dimOptionList'][$dimension]['order'] != 'NONE' ? 
                    $resultCubeSpec['dimOptionList'][$dimension]['order'].
                    '(?'.$dimQName.') ' : '');
            }
             
            // $dimPropertyUri = http://data.lod2.eu/scoreboard/properties/country
               
            $queryWherePart.= " ?observation <".$dimPropertyUri."> ?".$dimQName.".";
            
            $titleHelper->addResource($dimension);
            
            $internalNameTable['d'][$dimension]['index'] = $index;
            $internalNameTable['d'][$dimension]['qname'] = $dimQName;
            $internalNameTable['d'][$dimension]['uri'] = $dimension;
            $internalNameTable['d'][$dimension]['type'] = $dimPropertyUri;
            
            //add constraints for the dimension element selection in the observations
            if(isset($resultCubeSpec['dimElemList'][$dimension])) {
                
                $dimElemList = DataCube_Query::getComponentElements($resultCubeSpec['ds'], $dimPropertyUri);
                $falseList = array_diff($dimElemList, $resultCubeSpec['dimElemList'][$dimension]);
                
                if(count($falseList)>0) {
                
                    //if the falselist contains less then 80 elements, use NOT 
                    //filter statement
                    if(count($falseList) < 80) {
                    
                        $queryWherePart = substr($queryWherePart,0,strlen($queryWherePart)-1).
                                " FILTER ( NOT(";

                        foreach($falseList as $element) {
                            $elementString = '<'.$element.'>';
                            if(strpos($element, 'http://') === false) 
                                    $elementString = '"'.$element.'"';
                            $queryWherePart.= " ?".$dimQName." = ".$elementString." OR";
                        }

                        $queryWherePart 
                            = substr($queryWherePart, 0, strlen($queryWherePart)-3).")).";
                                        
                    } 
                    //else use the regular filter statement
                    else {
                        
                        $queryWherePart = substr($queryWherePart,0,strlen($queryWherePart)-1).
                                " FILTER ( (";

                        foreach($resultCubeSpec['dimElemList'][$dimension] as $element) {
                            $elementString = '<'.$element.'>';
                            if(strpos($element, 'http://') === false) 
                                    $elementString = '"'.$element.'"';
                            $queryWherePart.= " ?".$dimQName." = ".$elementString." OR";
                        }

                        $queryWherePart 
                            = substr($queryWherePart, 0, strlen($queryWherePart)-3).")).";
                        
                    }
                }
            }
            
            //add element constraints if the dimension elements are paginated
            if(isset($resultCubeSpec['dimLimitList'][$dimension])) {
                
                $dimElemList = $this->getComponentElements($resultCubeSpec['ds'], 
                        $dimPropertyUri, null, $resultCubeSpec['dimLimitList'][$dimension]);
                
                $queryWherePart = substr($queryWherePart,0,strlen($queryWherePart)-1).
                        " FILTER (";
                
                foreach($dimElemList as $element) {
                    $elementString = '<'.$element.'>';
                    if(strpos($element, 'http://') === false) 
                            $elementString = '"'.$element.'"';
                    $queryWherePart.= " ?".$dimQName." = ".$elementString." OR";
                }
                
                $queryWherePart = substr($queryWherePart, 0, strlen($queryWherePart)-3).").";
            }
        }
        
        //add all measures to the query
        foreach($resultCubeSpec['ms'] as $index => $measure) {
            
            $measPropertyUri = $resultCubeSpec['mstypes'][$measure]['type'];
            $measQName = "m".$index;
            
            
            /**************
             * TODO BLOCK *
             **************/
            
            $queryProloguePart .= " ".$resultCubeSpec['measFunctionList'][$measure].
                    "(?".$measQName.") AS ?".$measQName;    
            
            $queryWherePart .= " ?observation <".$measPropertyUri."> ?".$measQName.".";
            
            $queryOrderByPart .= ($resultCubeSpec['measOptionList'][$measure]['order'] != 'NONE' ? 
                    $resultCubeSpec['measOptionList'][$measure]['order'].
                    '(?'.$measQName.') ' : '');
            
            $titleHelper->addResource($measure);
            
            $internalNameTable['m'][$measure]['index'] = $index;
            $internalNameTable['m'][$measure]['qname'] = $measQName;
            $internalNameTable['m'][$measure]['uri'] = $measure;
            $internalNameTable['m'][$measure]['type'] = $measPropertyUri;
        }
        
        foreach($internalNameTable as $type => $compSpec) {
            foreach($compSpec as $uri => $elements) {
                $internalNameTable[$type][$uri]['label'] 
                    = $titleHelper->getTitle($elements['uri']); 
            }
        }
        
        //add group-by- and order-by-statements only if there are things to group and to sort
        $queryWherePart.="}".($queryGroupByPart != "" ? " GROUP BY ".$queryGroupByPart : "")
            .($queryOrderByPart != "" ? " ORDER BY ".$queryOrderByPart : "");
        
        //create and run the query
        $queryObservations = new Erfurt_Sparql_SimpleQuery();
        
        $queryObservations->setProloguePart($queryProloguePart);
        $queryObservations->setWherePart($queryWherePart);
        
        $queryResultObservations = $model->sparqlQuery($queryObservations);
        
        
        $result = array ('observations'=>$queryResultObservations, 
            'nameTable'=>$internalNameTable);

        return $result;
        
    }
	 
}
