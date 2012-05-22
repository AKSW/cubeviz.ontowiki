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

/**
 * The file providing the simple sparql query class
 */
require_once 'Erfurt/Sparql/SimpleQuery.php';

/**
 * This class provide interface for querying the Data Cube
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Ivan Ermilov <
 */
class CubeQuery {
	
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
		$queryDSD->setWherePart('WHERE {?dsd <'.CubeQuery::$rdfType.'> <'.CubeQuery::$qb_DataStructureDefinition.'>}');
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
        $queryDS->setWherePart('WHERE {?ds <'.CubeQuery::$rdfType.'> 
            <'.CubeQuery::$qb_DataSet.'>.
            ?ds <'.CubeQuery::$qb_structure.'> <'.$dsUri.'>.}');

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
        $queryComp->setWherePart('WHERE {<'.$dsdUri.'> <'.CubeQuery::$qb_component.'> ?comp.                
                                    ?comp <'.CubeQuery::$rdfType.'> 
                                        <'.CubeQuery::$qb_ComponentSpecification.'>.
                                    ?comp <'.CubeQuery::$$typeVarName.'> ?comptype.
                                    OPTIONAL {?comp <'.CubeQuery::$qb_order.'> ?order.}}
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
                        = CubeQuery::getComponentElementCount($dsUri, $comp['comptype']);
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
        
        $wherePart = 'WHERE {?observation <'.CubeQuery::$rdfType.'> <'.CubeQuery::$qb_Observation.'>.
            ?observation <'.CubeQuery::$qb_datasetrel.'> <'.$dsUri.'>.
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
            <'.CubeQuery::$rdfType.'> <'.CubeQuery::$qb_Observation.'>.
            ?observation <'.CubeQuery::$qb_datasetrel.'> <'.$dsUri.'>.
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
        $queryWherePart = "WHERE { ?observation <".CubeQuery::$rdfType."> 
            <".CubeQuery::$qb_Observation.">.";
        $queryWherePart .= " ?observation <".CubeQuery::$qb_datasetrel."> 
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
                
                $dimElemList = CubeQuery::getComponentElements($resultCubeSpec['ds'], $dimPropertyUri);
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
    
    /*
    static public function analyzeModel($model) {
        
        //prepare the analyzing queries to the model
        $titleHelper = new OntoWiki_Model_TitleHelper($model);
        $queryAnalyzeCounts = new Erfurt_Sparql_SimpleQuery();
        $queryAllObservationsCount = new Erfurt_Sparql_SimpleQuery();
        $queryAnalyzeDimensionComponents = new Erfurt_Sparql_SimpleQuery();
        $queryAnalyzeMeasureComponents = new Erfurt_Sparql_SimpleQuery();
        $queryAnalyzeComponentProperties = array();
        $queryAnalyzeObservations = new Erfurt_Sparql_SimpleQuery();
        $queryCountsResult = null;
        $queryAllObservationsCountResult = null;
        $queryDimensionComponentsResult = null;
        $queryMeasureComponentsResult = null;
        $queryComponentPropertiesResult = array();
        $queryObservationsResult = null;
        
        $result = array();
        
        //analyze the counts of linked DataStructures (dsd), DataSets (ds) and 
        //ComponentSpecifications (cs)
        $queryAnalyzeCounts->setProloguePart('SELECT COUNT(DISTINCT(?dsd)) AS 
            ?dsdCount COUNT(DISTINCT(?ds)) AS ?dsCount COUNT(DISTINCT(?cs)) AS ?csCount');
        $queryAnalyzeCounts->setWherePart('WHERE {
            ?dsd <'.CubeQuery::$rdfType.'> <'.CubeQuery::$qb_DataStructureDefinition.'>.
            ?ds <'.CubeQuery::$rdfType.'> <'.CubeQuery::$qb_DataSet.'>.
            ?cs <'.CubeQuery::$rdfType.'> <'.CubeQuery::$qb_ComponentSpecification.'>.
            OPTIONAL {
            ?ds2 <'.CubeQuery::$qb_structure.'> ?dsd2.
            ?dsd3 <'.CubeQuery::$qb_component.'> ?cs2. 
            FILTER ((?ds2 = ?ds) AND (?cs2 = ?cs))}
            FILTER (BOUND(?dsd2) AND BOUND(?dsd3) AND (?dsd2 = ?dsd3))}');
        
        $queryAllObservationsCount->setProloguePart('SELECT COUNT(DISTINCT(?obs))
            AS ?obsCount');
        $queryAllObservationsCount->setWherePart('WHERE {
            ?obs <'.CubeQuery::$rdfType.'> <'.CubeQuery::$qb_Observation.'>}');
        
        //analyze whether at least one bound dimension component
        $queryAnalyzeDimensionComponents->setProloguePart('SELECT COUNT(?dp) AS ?csdpcount');
        $queryAnalyzeDimensionComponents->setWherePart('WHERE {
            ?cs <'.CubeQuery::$rdfType.'> <'.CubeQuery::$qb_ComponentSpecification.'>.
            OPTIONAL {
            ?dsd <'.CubeQuery::$qb_component.'> ?cs2.
            ?cs2 <'.CubeQuery::$qb_dimension.'> ?dp.
            FILTER (?cs2 = ?cs)
            }
            FILTER (BOUND(?dsd))}');
        
        //analyze whether at least one bound measure component is given
        $queryAnalyzeMeasureComponents->setProloguePart('SELECT COUNT(?mp) AS ?csmpcount');
        $queryAnalyzeMeasureComponents->setWherePart('WHERE {
            ?cs <'.CubeQuery::$rdfType.'> <'.CubeQuery::$qb_ComponentSpecification.'>.
            OPTIONAL {
            ?dsd <'.CubeQuery::$qb_component.'> ?cs2.
            ?cs2 <'.CubeQuery::$qb_measure.'> ?mp.
            FILTER (?cs2 = ?cs)
            }
            FILTER (BOUND(?dsd))}');
        
        //analyze if there are "unbound" ComponentProperties: Dimension (dp), 
        //Measure (mp), Attribute (ap)
        $queryAnalyzeComponentProperties[0] = new Erfurt_Sparql_SimpleQuery();
        $queryAnalyzeComponentProperties[0]->setProloguePart('SELECT DISTINCT(?dp)');
        $queryAnalyzeComponentProperties[0]->setWherePart('WHERE {?dp <'
                .CubeQuery::$rdfType.'> <'.CubeQuery::$qb_DimensionProperty.'>.
            OPTIONAL {?cs <'.CubeQuery::$qb_dimension.'> ?dp2. FILTER (?dp = ?dp2)}
            FILTER (!BOUND(?dp2))}');
        $queryAnalyzeComponentProperties[1] = new Erfurt_Sparql_SimpleQuery();
        $queryAnalyzeComponentProperties[1]->setProloguePart('SELECT DISTINCT(?mp)');
        $queryAnalyzeComponentProperties[1]->setWherePart('WHERE {?mp <'
                .CubeQuery::$rdfType.'> <'.CubeQuery::$qb_MeasureProperty.'>.
            OPTIONAL {?cs <'.CubeQuery::$qb_measure.'> ?mp2. FILTER (?mp = ?mp2)}
            FILTER (!BOUND(?mp2))}');
        $queryAnalyzeComponentProperties[2] = new Erfurt_Sparql_SimpleQuery();
        $queryAnalyzeComponentProperties[2]->setProloguePart('SELECT DISTINCT(?ap)');
        $queryAnalyzeComponentProperties[2]->setWherePart('WHERE {?ap <'
                .CubeQuery::$rdfType.'> <'.CubeQuery::$qb_AttributeProperty.'>.
            OPTIONAL {?cs <'.CubeQuery::$qb_attribute.'> ?ap2. FILTER (?ap = ?ap2)}
            FILTER (!BOUND(?ap2))}');
        
        //analyze if there are "unbound" Observations in the given model
        $queryAnalyzeObservations->setProloguePart('SELECT DISTINCT(?obs)');
        $queryAnalyzeObservations->setWherePart('WHERE {?obs <'.
                CubeQuery::$rdfType.'> <'.CubeQuery::$qb_Observation.'>.
            OPTIONAL {?obs2 <'.CubeQuery::$qb_datasetrel.'> ?ds. FILTER (?obs = ?obs2)}
            FILTER (!BOUND(?obs2))}');
        
        //run the queries and save the result      
        $queryCountsResult = $model->sparqlQuery($queryAnalyzeCounts);
        $queryAllObservationsCountResult 
            = $model->sparqlQuery($queryAllObservationsCount);
        $queryDimensionComponentsResult 
            = $model->sparqlQuery($queryAnalyzeDimensionComponents);
        $queryMeasureComponentsResult
            = $model->sparqlQuery($queryAnalyzeMeasureComponents);
        foreach($queryAnalyzeComponentProperties as $query) {
            $queryComponentPropertiesResult[] = $model->sparqlQuery($query);
        }
        $queryObservationsResult = $model->sparqlQuery($queryAnalyzeObservations);
        
        //evaluate the counts of the cube parts
        foreach($queryCountsResult as $resultRow) {
            if(isset($resultRow['dsdCount'])) 
                $result['counts']['dsd'] = (int) $resultRow['dsdCount'];
            if(isset($resultRow['dsCount'])) 
                $result['counts']['ds'] = (int) $resultRow['dsCount'];
            if(isset($resultRow['csCount'])) 
                $result['counts']['cs'] = (int) $resultRow['csCount'];
        }
        
        $resultRow = current($queryAllObservationsCountResult);
        if(isset($resultRow['obsCount']))
            $result['counts']['allobs'] = (int) $resultRow['obsCount'];
        
        //evaluate the bound components
        $resultRow = current($queryDimensionComponentsResult);
        if(isset($resultRow['csdpcount']))
            $result['counts']['csdp'] = (int) $resultRow['csdpcount'];
        $resultRow = current($queryMeasureComponentsResult);
        if(isset($resultRow['csmpcount']))
            $result['counts']['csmp'] = (int) $resultRow['csmpcount'];
        
        //evaluate the "unbound" properties in the model
        foreach($queryComponentPropertiesResult as $queryResult) {
            foreach($queryResult as $resultRow) {
                if(isset($resultRow['dp'])) {
                    $result['dp'][]['uri'] = $resultRow['dp'];
                    $titleHelper->addResource($resultRow['dp']);
                }
                if(isset($resultRow['mp'])) {
                    $result['mp'][]['uri'] = $resultRow['mp'];
                    $titleHelper->addResource($resultRow['mp']);
                }
                if(isset($resultRow['ap'])) {
                    $result['ap'][]['uri'] = $resultRow['ap'];
                    $titleHelper->addResource($resultRow['ap']);
                }
            }
        }
        $result['counts']['dp'] = true == isset ( $result['dp'] ) ? count($result['dp']) : 0;
        $result['counts']['mp'] = true == isset ( $result['mp'] ) ? count($result['mp']) : 0;
        $result['counts']['ap'] = true == isset ( $result['ap'] ) ? count($result['ap']) : 0;
        
        //evaluate the "unbound" observations in the model
        foreach($queryObservationsResult as $resultRow) {
            if(isset($resultRow['obs'])) {
                $result['obs'][]['uri'] = $resultRow['obs'];
            }
        }
        $result['counts']['obs'] = true == isset ( $result['obs'] ) ? count($result['obs']) : 0;
        
        //add all titles; the title is not needed for the observations
        //add all uris for the components to be created
        $dp = true == isset ( $result['dp'] ) ? $result['dp'] : array ();
        $mp = true == isset ( $result['mp'] ) ? $result['mp'] : array ();
        $ap = true == isset ( $result['ap'] ) ? $result['ap'] : array ();
        
        foreach($dp as $index => $dpset) {
            $result['dp'][$index]['name'] = $titleHelper->getTitle($dpset['uri']);
            $result['dp'][$index]['csuri'] = $this->_createURI($dpset['uri'], 'dp');
        }
        foreach($mp as $index => $mpset) {
            $result['mp'][$index]['name'] = $titleHelper->getTitle($mpset['uri']);
            $result['mp'][$index]['csuri'] = $this->_createURI($mpset['uri'], 'mp');
        }
        foreach($ap as $index => $apset) {
            $result['ap'][$index]['name'] = $titleHelper->getTitle($apset['uri']);
        }
        
        //RULE 1: if no elements are given at all no further processing can be done
        if($result['counts']['dsd'] == 0 && $result['counts']['ds'] == 0
                && $result['counts']['cs'] == 0 && $result['counts']['allobs'] == 0)
            $result['rule']['noProcessing'] = true;
        else $result['rule']['noProcessing'] = false;
        
        //RULE 2: if no structure elements for the unbound dimension and component
        //properties and the unbound observations are given, create them
        if($result['counts']['dsd'] == 0 && $result['counts']['ds'] == 0
                && $result['counts']['cs'] == 0 && $result['counts']['allobs'] > 0
                && $result['counts']['dp'] > 0 && $result['counts']['mp'] > 0)
            $result['rule']['completionNeeded'] = true;
        else $result['rule']['completionNeeded'] = false;
        
        //RULE 3: if all element counts are greater than 0 some structure 
        //of the cube is given
        if($result['counts']['dsd'] > 0 && $result['counts']['ds'] > 0 
                && $result['counts']['csdp'] > 0 && $result['counts']['csmp'] > 0)
            $result['rule']['structureGiven'] = true;
        else $result['rule']['structureGiven'] = false;       
        
        //RULE 4: the structure is complete if there are no unbound elements
        //and a structure is given
        if($result['rule']['structureGiven'] && $result['counts']['dp'] == 0
                && $result['counts']['mp'] == 0
                && $result['counts']['obs'] == 0)
            $result['rule']['completeStructure'] = true;
        else $result['rule']['completeStructure'] = false;
        
        return $result;
    }
    
    static public function analyzeNeededObservationPartition($model) {
            
        $result = array();

        //find out whats the maximum number of linked dimension and measure 
        //properties in the observations
        //this is needed to avoid an oversized observation analysis query
        $queryMaxDimensionCount = new Erfurt_Sparql_SimpleQuery();
        $queryMaxDimensionCount->setProloguePart('SELECT DISTINCT(COUNT(?dp)) AS ?dpC');
        $queryMaxDimensionCount->setWherePart('WHERE { ?obs <'.CubeQuery::$rdfType.
                '> <'.CubeQuery::$qb_Observation.'>.
            ?obs ?dp ?dpvalue.
            ?dp <'.CubeQuery::$rdfType.'> <'.CubeQuery::$qb_DimensionProperty.'>.
            OPTIONAL {?cs <'.CubeQuery::$qb_dimension.'> ?dp2. FILTER (?dp2 = ?dp)}
            FILTER (!BOUND(?dp2)) }
            GROUP BY ?obs ORDER BY DESC(?dpC)');

        $queryMaxMeasureCount = new Erfurt_Sparql_SimpleQuery();
        $queryMaxMeasureCount->setProloguePart('SELECT DISTINCT(COUNT(?mp)) AS ?mpC');
        $queryMaxMeasureCount->setWherePart('WHERE { ?obs <'.CubeQuery::$rdfType.
                '> <'.CubeQuery::$qb_Observation.'>.
            ?obs ?mp ?mpvalue.
            ?mp <'.CubeQuery::$rdfType.'> <'.CubeQuery::$qb_MeasureProperty.'>.
            OPTIONAL {?cs <'.CubeQuery::$qb_measure.'> ?mp2. FILTER (?mp2 = ?mp)}
            FILTER (!BOUND(?mp2)) }
            GROUP BY ?obs ORDER BY DESC(?mpC)');

        $queryResultMaxDimension = $model->sparqlQuery($queryMaxDimensionCount);
        $queryResultMaxMeasure = $model->sparqlQuery($queryMaxMeasureCount);
        
        foreach($queryResultMaxDimension as $value) {
            if(isset($value['dpC']))
                $result['partition']['dp'][] = $value['dpC'];
        }
        foreach($queryResultMaxMeasure as $value) {
            if(isset($value['mpC']))
                $result['partition']['mp'][] = $value['mpC'];
        }

        $result['partition']['dp'] = true == isset ( $result['partition']['dp'] ) 
            ? $result['partition']['dp']
            : array ();

        //iterate through all combinations of dimension and measure usage 
        //in the unbound observations
        foreach($result['partition']['dp'] as $countDp) {        
            foreach($result['partition']['mp'] as $countMp) {
                //select all observations with unbound dimension and measure 
                //properties
                $queryProloguePart = 'SELECT COUNT(?obs) AS ?obsC';
                $queryWherePart = 'WHERE {?obs <'.CubeQuery::rdfType.
                        '> <'.CubeQuery::$qb_Observation.'>.';
                $queryGroupByPart = ' GROUP BY';

                $names = array();

                //add variables for all unbound dimension properties
                for($i = 0; $i < $countDp; $i++) {
                    $names['dp'][$i] = '?dp'.$i;
                    $queryProloguePart .= ' '.$names['dp'][$i];
                    $queryWherePart .= ' ?obs '.$names['dp'][$i].' '.$names['dp'][$i].'value.
                        '.$names['dp'][$i].' <'.CubeQuery::$rdfType.'> <'.
                            CubeQuery::$qb_DimensionProperty.'>.
                        OPTIONAL { ?cs <'.CubeQuery::$qb_dimension.'> '.
                            $names['dp'][$i].'Check FILTER ('.
                            $names['dp'][$i].'Check = '.$names['dp'][$i].')}
                        FILTER (!BOUND('.$names['dp'][$i].'Check))';
                    $queryGroupByPart .= ' '.$names['dp'][$i];
                }

                //add variables for all unbound measure properties
                for($i = 0; $i < $countMp; $i++) {
                    $names['mp'][$i] = '?mp'.$i;
                    $queryProloguePart .= ' '.$names['mp'][$i];
                    $queryWherePart .= ' ?obs '.$names['mp'][$i].' '.$names['mp'][$i].'value.
                        '.$names['mp'][$i].' <'.CubeQuery::$rdfType.'> <'.
                            CubeQuery::$qb_MeasureProperty.'>.
                        OPTIONAL { ?cs <'.CubeQuery::$qb_measure.'> '.
                            $names['mp'][$i].'Check FILTER ('.
                            $names['mp'][$i].'Check = '.$names['mp'][$i].')}
                        FILTER (!BOUND('.$names['mp'][$i].'Check))';
                    $queryGroupByPart .= ' '.$names['mp'][$i];
                }

                //add filters to avoid doubled dimensions
                for($i = 0; $i < $countDp; $i++) {
                    for($j = $i+1; $j < $countDp; $j++) {
                        $queryWherePart .= 
                            ' FILTER ('.$names['dp'][$i].' != '.$names['dp'][$j].')';
                    }
                }

                //add filters to avoid doubled measures
                for($i = 0; $i < $countMp; $i++) {
                    for($j = $i+1; $j < $countMp; $j++) {
                        $queryWherePart .= 
                            ' FILTER ('.$names['mp'][$i].' != '.$names['mp'][$j].')';
                    }
                }

                $queryWherePart .= "}".$queryGroupByPart;

                $queryPartitionAnalysis = new Erfurt_Sparql_SimpleQuery();
                $queryPartitionAnalysis->setProloguePart($queryProloguePart);
                $queryPartitionAnalysis->setWherePart($queryWherePart);

                $queryResult = $model->sparqlQuery($queryPartitionAnalysis);

                //layout the results
                foreach($queryResult as $resultRow) {
                    if(isset($resultRow['obsC'])) {

                        $temp = array();

                        foreach($resultRow as $index => $element) {

                            if($index == 'obsC') {
                                $temp['obsCount'] = $element;
                            }
                            else {
                                $temp[$index] = $element;
                            }
                        }

                        $selected = true;
                        foreach($result['ds'] as $ds) {

                            $diff = array_diff($temp, $ds);
                            if(empty($diff)) {
                                $selected = false;
                            }
                        }
                        if($selected) {
                            $tempID = implode('', $temp);
                            $temp['dsuri'] = $this->_createURI($tempID, 'ds');
                            $temp['dsduri'] = $this->_createURI($tempID, 'dsd');
                            $temp['dsname'] = 'DataSet'.count($result['ds']);
                            $temp['dsdname'] = 'DataStructure'.count($result['ds']);
                            $result['ds'][] = $temp;
                        }
                    }
                }
            }
        }
        //count the total amount of new datasets
        $result['counts']['ds'] = true == isset ( $result['ds'] ) ? count($result['ds']) : 0;
        return $result;
    }
    
	static public function createStructureElements($creationTable = null, $model) {
		
        if(isset($creationTable)) {
            
            $modelUri = (string) $model;
            
            $resourceList = array();
            
            $creationTable['dp'] = true == isset ( $creationTable['dp'] ) 
                ? $creationTable['dp'] : array ();
            
            //step 1: create the component specifications
            foreach($creationTable['dp'] as $dp => $dpset) {
                $resourceList['cs']['dp'][$dpset['uri']] = $creationTable['dp'][$dp]['csuri'];
                //add the type of the component specification
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['cs']['dp'][$dpset['uri']], CubeQuery::$rdfType, 
                        array('value' => CubeQuery::$qb_ComponentSpecification, 'type' => 'uri'), 
                        true);
                //add the dimension property relation
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['cs']['dp'][$dpset['uri']], CubeQuery::$qb_dimension, 
                        array('value' => $dpset['uri'], 'type' => 'uri'), true);
                //add the name of the component specification
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['cs']['dp'][$dpset['uri']], CubeQuery::$rdfsLabel, 
                        array('value' => $creationTable['dp'][$dp]['name'], 'type' => ''), 
                        true);
            }
            
            $creationTable['mp'] = true == isset ( $creationTable['mp'] ) 
                ? $creationTable['mp'] : array ();
            
            foreach($creationTable['mp'] as $mp => $mpset) {
                $resourceList['cs']['mp'][$mpset['uri']] = $creationTable['mp'][$mp]['csuri'];
                //add the type of the component specification
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['cs']['mp'][$mpset['uri']], CubeQuery::$rdfType, 
                        array('value' => CubeQuery::$qb_ComponentSpecification, 'type' => 'uri'), 
                        true);
                //add the measure property relation
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['cs']['mp'][$mpset['uri']], CubeQuery::$qb_measure, 
                        array('value' => $mpset['uri'], 'type' => 'uri'), true);
                //add the name of the component specification  
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['cs']['mp'][$mpset['uri']], CubeQuery::$rdfsLabel, 
                        array('value' => $creationTable['mp'][$mp]['name'], 'type' => ''), 
                        true);
            }
            
            
            $creationTable['ds'] = true == isset ( $creationTable['ds'] ) 
                ? $creationTable['ds'] : array ();
            
            //step 2: create the data structures and data sets
            foreach($creationTable['ds'] as $index => $element) {
                
                $resourceList['dsd'][$index] = $element['dsduri'];
                $resourceList['ds'][$index] = $element['dsuri'];
                
                //create the data structure
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['dsd'][$index], CubeQuery::$rdfType, 
                        array('value' => CubeQuery::$qb_DataStructureDefinition, 'type' => 'uri'), 
                        true);
                //set the data structure name
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['dsd'][$index], CubeQuery::$rdfsLabel, 
                        array('value' => $creationTable['ds'][$index]['dsdname'], 'type' => ''), 
                        true);
                //link all components to the structure
                foreach($element as $key => $item) {
                    if(($key != 'obsCount') && ($key != 'dsuri') && ($key != 'dsduri') 
                            && ($key != 'dsname') && ($key != 'dsdname')) {
                        $subKey = substr($key, 0, 2);
                        Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                                $resourceList['dsd'][$index], CubeQuery::$qb_component, 
                                array('value' => $resourceList['cs'][$subKey][$item], 'type' => 'uri'), 
                                true);
                    }
                }
                
                //create the data set
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['ds'][$index], CubeQuery::$rdfType, 
                        array('value' => CubeQuery::$qb_DataSet, 'type' => 'uri'), 
                        true);
                //set the data set name
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['ds'][$index], CubeQuery::$rdfsLabel, 
                        array('value' => $creationTable['ds'][$index]['dsname'], 'type' => ''), 
                        true);
                //link the data set to the data structure
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['ds'][$index], CubeQuery::$qb_structure, 
                        array('value' => $resourceList['dsd'][$index], 'type' => 'uri'), 
                        true);
            
                //step 3: update all observations which are structered by this 
                //data structure and data set
                $queryAffectedObservations = new Erfurt_Sparql_SimpleQuery();
                $queryAffectedObservations->setProloguePart('SELECT DISTINCT(?obs)');
                $queryWherePart = 'WHERE {';
                $i = 0;
                //find all appropriate observations
                foreach($element as $key => $item) {
                    if(($key != 'obsCount') && ($key != 'dsuri') 
                            && ($key != 'dsduri') && ($key != 'dsname') 
                            && ($key != 'dsdname')) {
                       $queryWherePart .= '?obs <'.$item.'> ?itemValue'.$i.'. ';
                       $i++;
                    }
                }
                $queryWherePart .= '}';
                $queryAffectedObservations->setWherePart($queryWherePart);
                
                $queryResultObservations 
                    = $model->sparqlQuery($queryAffectedObservations);
                //link all found observations to the data set
                foreach($queryResultObservations as $resultRow) {
                    if(isset($resultRow['obs'])) {
                        Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                                $resultRow['obs'], $this->_uris['datasetrel'], 
                                array('value' => $resourceList['ds'][$index], 'type' => 'uri'), 
                                true);
                    }
                }
            }
        }
    }*/
	 
}
