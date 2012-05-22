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
 * Helper class for the RDF DataCube vocabulary and models based on it. This class
 * provides functions to analyze, complete and query data cubes.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Tom-Michael Hesse <tommichael.hesse@googlemail.com>
 */
class CubeHelper {
    
    /**
     * Holds the uris to the RDF DataCube vocabulary elements
     * @var array The uris for the RDF DataCube vocabulary: 
     * 'elementName' => 'elementUri' 
     */
    private $_uris = array();
    
    /**
     * Holds the patterns for the uris of new instances
     * @var array The uri patterns for new elements uris: 'pattern' => 'content' 
     */
    private $_uriPattern = array();
    
    /**
     * Holds the uri elements which are enabled for the use in patterns to create
     * the uris for new instances in the knowledge base
     * @var array The uri patterns for creating new elements in the cube:
     * 'uriElementName' => boolean
     */
    private $_uriElements = array();
    
    /**
     * Holds the number of new instances to be created using the uri pattern
     * '<COUNTER>'
     * @var int The counter for the number of new instances
     */
    private $_uriCounter = 0;
    
    /**
     * Holds the knowledge base to work with
     * @var Erfurt_Rdf_Model The current knowledge base 
     */
    private $_model = null;
    
    /**
     * Holds the uri of the current knowledge base
     * @var string The uri string of the current knowledge base 
     */
    private $_modelUri = "";
    
    /**
     * Holds the uri of the current knowledge base without an ending slash
     * @var string The uri string of the current knowledge base without the
     * ending slash
     */
    private $_modelUriCutted = "";
    
    /**
     * Initializes the cube helper: Sets all DataCube vocabulary uris, patterns,
     * uri elements and the model for the cube helper object to work with.
     * @param array $uris The uris for the elements of the DataCube vocabulary
     * @param Erfurt_Rdf_Model $model The model to work with
     * @param array $uripattern The uri patterns for new instances to use
     * @param array $urielements The uri elements which are enabled for uri patterns
     */
    public function __construct($uris, $model, $uripattern, $urielements) {
        
        //set all needed information about the cube model, his uris, 
        //the patterns and their elements
        $this->_uris = $uris; 
        
        $this->_uriPattern = $uripattern;
        
        $this->_uriElements = $urielements;
        
        $this->_model = $model;
        
        $this->_modelUri = (string) $this->_model;
        
        //check, if the model uri ends with a slash and cut it
        $this->_modelUriCutted = (strrpos($this->_modelUri, '/', -1) === false ? 
            $this->_modelUri :
            substr($this->_modelUri, 0, strlen($this->_modelUri)-1));
    }
    
    /**
     * Evaluates the given knowledge base for data cube structures: Returns an
     * array with detailed counts of data cube elements specified in the given
     * knowledge base. This function can be used to decide if a given cube
     * model can be used for reading out the data. Otherwise structure instances
     * would have to be created.
     * @return array The result of the analysis of the given knowledge base by
     * returning the results for counts and conditions. Contains:
     * Counts of data structures, data sets, component specifications, unbound
     * dimension properties, measure properties, attribute properties, observations
     * 'counts' => { 'dsd' => int, 'ds' => int, 'cs' => int, 'dp' => int, 'mp' =>
     * int, 'ap' => int, 'obs' => int }
     * Instances of unbound dp, mp, ap, obs and proposals for their new uris 
     * of component specifications
     * 'dp' => { ... => { 'uri' => string, 'name' => string, 'csuri' => string} }
     * 'mp' => { ... => { 'uri' => string, 'name' => string, 'csuri' => string} }
     * 'ap' => { ... => { 'uri' => string, 'name' => string } }
     * 'obs' => { ... => { 'uri' => string} } 
     * Rules representing conditions for evaluating the given structure and their
     * result
     * 'rule' => { 'structureCounts' => boolean, 'propertyCounts' => boolean,
     * 'observationsCount' => boolean, 'completeStructure' => boolean }
     */
    public function analyzeModel() {
        
        //prepare the analyzing queries to the model
        $titleHelper = new OntoWiki_Model_TitleHelper($this->_model);
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
            ?dsd <'.$this->_uris['rdfType'].'> <'.$this->_uris['DataStructureDefinition'].'>.
            ?ds <'.$this->_uris['rdfType'].'> <'.$this->_uris['DataSet'].'>.
            ?cs <'.$this->_uris['rdfType'].'> <'.$this->_uris['ComponentSpecification'].'>.
            OPTIONAL {
            ?ds2 <'.$this->_uris['structure'].'> ?dsd2.
            ?dsd3 <'.$this->_uris['component'].'> ?cs2. 
            FILTER ((?ds2 = ?ds) AND (?cs2 = ?cs))}
            FILTER (BOUND(?dsd2) AND BOUND(?dsd3) AND (?dsd2 = ?dsd3))}');
        
        $queryAllObservationsCount->setProloguePart('SELECT COUNT(DISTINCT(?obs))
            AS ?obsCount');
        $queryAllObservationsCount->setWherePart('WHERE {
            ?obs <'.$this->_uris['rdfType'].'> <'.$this->_uris['Observation'].'>}');
        
        //analyze whether at least one bound dimension component
        $queryAnalyzeDimensionComponents->setProloguePart('SELECT COUNT(?dp) AS ?csdpcount');
        $queryAnalyzeDimensionComponents->setWherePart('WHERE {
            ?cs <'.$this->_uris['rdfType'].'> <'.$this->_uris['ComponentSpecification'].'>.
            OPTIONAL {
            ?dsd <'.$this->_uris['component'].'> ?cs2.
            ?cs2 <'.$this->_uris['dimension'].'> ?dp.
            FILTER (?cs2 = ?cs)
            }
            FILTER (BOUND(?dsd))}');
        
        //analyze whether at least one bound measure component is given
        $queryAnalyzeMeasureComponents->setProloguePart('SELECT COUNT(?mp) AS ?csmpcount');
        $queryAnalyzeMeasureComponents->setWherePart('WHERE {
            ?cs <'.$this->_uris['rdfType'].'> <'.$this->_uris['ComponentSpecification'].'>.
            OPTIONAL {
            ?dsd <'.$this->_uris['component'].'> ?cs2.
            ?cs2 <'.$this->_uris['measure'].'> ?mp.
            FILTER (?cs2 = ?cs)
            }
            FILTER (BOUND(?dsd))}');
        
        //analyze if there are "unbound" ComponentProperties: Dimension (dp), 
        //Measure (mp), Attribute (ap)
        $queryAnalyzeComponentProperties[0] = new Erfurt_Sparql_SimpleQuery();
        $queryAnalyzeComponentProperties[0]->setProloguePart('SELECT DISTINCT(?dp)');
        $queryAnalyzeComponentProperties[0]->setWherePart('WHERE {?dp <'
                .$this->_uris['rdfType'].'> <'.$this->_uris['DimensionProperty'].'>.
            OPTIONAL {?cs <'.$this->_uris['dimension'].'> ?dp2. FILTER (?dp = ?dp2)}
            FILTER (!BOUND(?dp2))}');
        $queryAnalyzeComponentProperties[1] = new Erfurt_Sparql_SimpleQuery();
        $queryAnalyzeComponentProperties[1]->setProloguePart('SELECT DISTINCT(?mp)');
        $queryAnalyzeComponentProperties[1]->setWherePart('WHERE {?mp <'
                .$this->_uris['rdfType'].'> <'.$this->_uris['MeasureProperty'].'>.
            OPTIONAL {?cs <'.$this->_uris['measure'].'> ?mp2. FILTER (?mp = ?mp2)}
            FILTER (!BOUND(?mp2))}');
        $queryAnalyzeComponentProperties[2] = new Erfurt_Sparql_SimpleQuery();
        $queryAnalyzeComponentProperties[2]->setProloguePart('SELECT DISTINCT(?ap)');
        $queryAnalyzeComponentProperties[2]->setWherePart('WHERE {?ap <'
                .$this->_uris['rdfType'].'> <'.$this->_uris['AttributeProperty'].'>.
            OPTIONAL {?cs <'.$this->_uris['attribute'].'> ?ap2. FILTER (?ap = ?ap2)}
            FILTER (!BOUND(?ap2))}');
        
        //analyze if there are "unbound" Observations in the given model
        $queryAnalyzeObservations->setProloguePart('SELECT DISTINCT(?obs)');
        $queryAnalyzeObservations->setWherePart('WHERE {?obs <'.
                $this->_uris['rdfType'].'> <'.$this->_uris['Observation'].'>.
            OPTIONAL {?obs2 <'.$this->_uris['datasetrel'].'> ?ds. FILTER (?obs = ?obs2)}
            FILTER (!BOUND(?obs2))}');
        
        //run the queries and save the result      
        $queryCountsResult = $this->_model->sparqlQuery($queryAnalyzeCounts);
        $queryAllObservationsCountResult 
            = $this->_model->sparqlQuery($queryAllObservationsCount);
        $queryDimensionComponentsResult 
            = $this->_model->sparqlQuery($queryAnalyzeDimensionComponents);
        $queryMeasureComponentsResult
            = $this->_model->sparqlQuery($queryAnalyzeMeasureComponents);
        foreach($queryAnalyzeComponentProperties as $query) {
            $queryComponentPropertiesResult[] = $this->_model->sparqlQuery($query);
        }
        $queryObservationsResult = $this->_model->sparqlQuery($queryAnalyzeObservations);
        
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
        $result['counts']['dp'] = count($result['dp']);
        $result['counts']['mp'] = count($result['mp']);
        $result['counts']['ap'] = count($result['ap']);
        
        //evaluate the "unbound" observations in the model
        foreach($queryObservationsResult as $resultRow) {
            if(isset($resultRow['obs'])) {
                $result['obs'][]['uri'] = $resultRow['obs'];
            }
        }
        $result['counts']['obs'] = count($result['obs']);
        
        //add all titles; the title is not needed for the observations
        //add all uris for the components to be created
        $dp = $result['dp'];
        $mp = $result['mp'];
        $ap = $result['ap'];
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
    
    /**
     * Evaluates the observations in the given model for a data set partition:
     * This function returns a set of data sets grouped by the used components
     * in the unbound observations. The result can be the foundation for creating
     * new data set instances to link the unbound observations to data sets.
     * @return array The set of data set instances to be created to cover all
     * unbound observations:
     * Contains for each new data set instance the uri and name proposal as well
     * as the corresponding new instance of a data structure definition
     * 'ds' => { ... => { 'dsuri' => string, 'dsname' => string, 'dsduri' =>
     * string, 'dsdname' => string} } 
     * Contains the total amount of new data set instances
     * 'count' => { 'ds' => int }
     */
    public function analyzeNeededObservationPartition() {
            
        $result = array();

        //find out whats the maximum number of linked dimension and measure 
        //properties in the observations
        //this is needed to avoid an oversized observation analysis query
        $queryMaxDimensionCount = new Erfurt_Sparql_SimpleQuery();
        $queryMaxDimensionCount->setProloguePart('SELECT DISTINCT(COUNT(?dp)) AS ?dpC');
        $queryMaxDimensionCount->setWherePart('WHERE { ?obs <'.$this->_uris['rdfType'].
                '> <'.$this->_uris['Observation'].'>.
            ?obs ?dp ?dpvalue.
            ?dp <'.$this->_uris['rdfType'].'> <'.$this->_uris['DimensionProperty'].'>.
            OPTIONAL {?cs <'.$this->_uris['dimension'].'> ?dp2. FILTER (?dp2 = ?dp)}
            FILTER (!BOUND(?dp2)) }
            GROUP BY ?obs ORDER BY DESC(?dpC)');

        $queryMaxMeasureCount = new Erfurt_Sparql_SimpleQuery();
        $queryMaxMeasureCount->setProloguePart('SELECT DISTINCT(COUNT(?mp)) AS ?mpC');
        $queryMaxMeasureCount->setWherePart('WHERE { ?obs <'.$this->_uris['rdfType'].
                '> <'.$this->_uris['Observation'].'>.
            ?obs ?mp ?mpvalue.
            ?mp <'.$this->_uris['rdfType'].'> <'.$this->_uris['MeasureProperty'].'>.
            OPTIONAL {?cs <'.$this->_uris['measure'].'> ?mp2. FILTER (?mp2 = ?mp)}
            FILTER (!BOUND(?mp2)) }
            GROUP BY ?obs ORDER BY DESC(?mpC)');

        $queryResultMaxDimension = $this->_model->sparqlQuery($queryMaxDimensionCount);
        $queryResultMaxMeasure = $this->_model->sparqlQuery($queryMaxMeasureCount);
        
        foreach($queryResultMaxDimension as $value) {
            if(isset($value['dpC']))
                $result['partition']['dp'][] = $value['dpC'];
        }
        foreach($queryResultMaxMeasure as $value) {
            if(isset($value['mpC']))
                $result['partition']['mp'][] = $value['mpC'];
        }

        //iterate through all combinations of dimension and measure usage 
        //in the unbound observations
        foreach($result['partition']['dp'] as $countDp) {        
            foreach($result['partition']['mp'] as $countMp) {
                //select all observations with unbound dimension and measure 
                //properties
                $queryProloguePart = 'SELECT COUNT(?obs) AS ?obsC';
                $queryWherePart = 'WHERE {?obs <'.$this->_uris['rdfType'].
                        '> <'.$this->_uris['Observation'].'>.';
                $queryGroupByPart = ' GROUP BY';

                $names = array();

                //add variables for all unbound dimension properties
                for($i = 0; $i < $countDp; $i++) {
                    $names['dp'][$i] = '?dp'.$i;
                    $queryProloguePart .= ' '.$names['dp'][$i];
                    $queryWherePart .= ' ?obs '.$names['dp'][$i].' '.$names['dp'][$i].'value.
                        '.$names['dp'][$i].' <'.$this->_uris['rdfType'].'> <'.
                            $this->_uris['DimensionProperty'].'>.
                        OPTIONAL { ?cs <'.$this->_uris['dimension'].'> '.
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
                        '.$names['mp'][$i].' <'.$this->_uris['rdfType'].'> <'.
                            $this->_uris['MeasureProperty'].'>.
                        OPTIONAL { ?cs <'.$this->_uris['measure'].'> '.
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

                $queryResult = $this->_model->sparqlQuery($queryPartitionAnalysis);

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
        $result['counts']['ds'] = count($result['ds']);
        return $result;
    }
    
    /**
     * Returns the complete analysis data which is needed to create new elements
     * in the cube: The method runs analyzeModel() and 
     * analyzeNeededObservationPartition().
     * @return array The merged data of the analysis and partition results
     */
    public function getCreationAnalysis() {
        
        $analysis = array();
        $partition = array();
        
        $analysis = $this->analyzeModel();
        $partition = $this->analyzeNeededObservationPartition();
        
        $result = array_merge($analysis, $partition);
        
        return $result;
    }
    
    /**
     * Creates the new instances for the cube structure: This method creates new
     * instances of RDF DataCube elements to complete the cube structure of the
     * given knowledge base.
     * @param array $creationTable The instances to be created, this should contain
     * the merged results of analyzeModel() and analyzeNeededObservationPartition().
     */
    public function createStructureElements($creationTable = null) {
       
        if(isset($creationTable)) {
            
            $modelUri = $this->_modelUri;
            
            $resourceList = array();
            
            //step 1: create the component specifications
            foreach($creationTable['dp'] as $dp => $dpset) {
                $resourceList['cs']['dp'][$dpset['uri']] = $creationTable['dp'][$dp]['csuri'];
                //add the type of the component specification
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['cs']['dp'][$dpset['uri']], $this->_uris['rdfType'], 
                        array('value' => $this->_uris['ComponentSpecification'], 'type' => 'uri'), 
                        true);
                //add the dimension property relation
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['cs']['dp'][$dpset['uri']], $this->_uris['dimension'], 
                        array('value' => $dpset['uri'], 'type' => 'uri'), true);
                //add the name of the component specification
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['cs']['dp'][$dpset['uri']], $this->_uris['rdfsLabel'], 
                        array('value' => $creationTable['dp'][$dp]['name'], 'type' => ''), 
                        true);
            }
            
            foreach($creationTable['mp'] as $mp => $mpset) {
                $resourceList['cs']['mp'][$mpset['uri']] = $creationTable['mp'][$mp]['csuri'];
                //add the type of the component specification
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['cs']['mp'][$mpset['uri']], $this->_uris['rdfType'], 
                        array('value' => $this->_uris['ComponentSpecification'], 'type' => 'uri'), 
                        true);
                //add the measure property relation
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['cs']['mp'][$mpset['uri']], $this->_uris['measure'], 
                        array('value' => $mpset['uri'], 'type' => 'uri'), true);
                //add the name of the component specification  
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['cs']['mp'][$mpset['uri']], $this->_uris['rdfsLabel'], 
                        array('value' => $creationTable['mp'][$mp]['name'], 'type' => ''), 
                        true);
            }
            
            //step 2: create the data structures and data sets
            foreach($creationTable['ds'] as $index => $element) {
                
                $resourceList['dsd'][$index] = $element['dsduri'];
                $resourceList['ds'][$index] = $element['dsuri'];
                
                //create the data structure
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['dsd'][$index], $this->_uris['rdfType'], 
                        array('value' => $this->_uris['DataStructureDefinition'], 'type' => 'uri'), 
                        true);
                //set the data structure name
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['dsd'][$index], $this->_uris['rdfsLabel'], 
                        array('value' => $creationTable['ds'][$index]['dsdname'], 'type' => ''), 
                        true);
                //link all components to the structure
                foreach($element as $key => $item) {
                    if(($key != 'obsCount') && ($key != 'dsuri') && ($key != 'dsduri') 
                            && ($key != 'dsname') && ($key != 'dsdname')) {
                        $subKey = substr($key, 0, 2);
                        Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                                $resourceList['dsd'][$index], $this->_uris['component'], 
                                array('value' => $resourceList['cs'][$subKey][$item], 'type' => 'uri'), 
                                true);
                    }
                }
                
                //create the data set
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['ds'][$index], $this->_uris['rdfType'], 
                        array('value' => $this->_uris['DataSet'], 'type' => 'uri'), 
                        true);
                //set the data set name
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['ds'][$index], $this->_uris['rdfsLabel'], 
                        array('value' => $creationTable['ds'][$index]['dsname'], 'type' => ''), 
                        true);
                //link the data set to the data structure
                Erfurt_App::getInstance()->getStore()->addStatement($modelUri, 
                        $resourceList['ds'][$index], $this->_uris['structure'], 
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
                    = $this->_model->sparqlQuery($queryAffectedObservations);
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
    }
    
    /**
     * Returns all existing data structure definitions in the given knowledge 
     * base.
     * @param OntoWiki_Model_TitleHelper $titleHelper The title helper to add
     * the uris of the data structures for further use
     * @return array The uris of all data structures in the given knowledge base:
     * ... => 'dataStructureUri' 
     */
    public function getDataStructureDefinition($titleHelper = null) {
        
        //get the required initializations
        $queryDSD = new Erfurt_Sparql_SimpleQuery();
        $result = array();

        //get all indicators in the cube by the DataStructureDefinitions
        $queryDSD->setProloguePart('SELECT ?dsd');
        $queryDSD->setWherePart('WHERE {?dsd <'.$this->_uris['rdfType'].'> 
            <'.$this->_uris['DataStructureDefinition'].'>}');

        $queryResultDSD = $this->_model->sparqlQuery($queryDSD);

        foreach($queryResultDSD as $dsd) {

            if(isset($dsd['dsd'])) {
                $result[] = $dsd['dsd'];
                if(isset($titleHelper)) $titleHelper->addResource($dsd['dsd']);
            }
        }
        
        return $result;
    }
    
    /**
     * Returns all existing data sets in the given knowledge base for a given
     * data structure definition.
     * @param string $dataStructure The uri of the data structure to which all
     * data sets returned should be linked
     * @param OntoWiki_Model_TitleHelper $titleHelper The title helper to add
     * the uris of the data sets for further use
     * @return array The uris of all data sets in the given knowledge base for
     * the given data structure definition:
     * ... => 'dataSetUri' 
     */
    public function getDataSets($dataStructure, $titleHelper = null) {
        
        //get the required initializations
        $queryDS = new Erfurt_Sparql_SimpleQuery();
        $result = array();

        //get all data sets in the cube for the given DataStructureDefinition
        $queryDS->setProloguePart('SELECT ?ds');
        $queryDS->setWherePart('WHERE {?ds <'.$this->_uris['rdfType'].'> 
            <'.$this->_uris['DataSet'].'>.
            ?ds <'.$this->_uris['structure'].'> <'.$dataStructure.'>.}');

        $queryResultDS = $this->_model->sparqlQuery($queryDS);

        foreach($queryResultDS as $ds) {

            if(isset($ds['ds'])) {
                $result[] = $ds['ds'];
                if(isset($titleHelper)) $titleHelper->addResource($ds['ds']);
            }
        }
        
        return $result;
    }
    
    /**
     * Returns all components used in data structure and their element count in
     * a specific data set.
     * @param string $dsdUri The uri of the data structure for which the components
     * shall be found
     * @param string $dsUri The uri of the data set for which the elements of
     * the component shall be found
     * @param string $type The type of the components which shall be found
     * @param OntoWiki_Model_TitleHelper $titleHelper The title helper where the
     * found instances shall be added
     * @return array The found components:
     * 'componentUri' => { 'uri' => string, 'type' => string, 'elemCount' => int,
     * 'order' => int} 
     */
    public function getComponents($dsdUri, $dsUri, $type, $titleHelper = null) {
        
        $result = array();
        //var_dump($type); 
        //search for the components specified by the parameters
        $queryComp = new Erfurt_Sparql_SimpleQuery();
        $queryComp->setProloguePart('SELECT ?comp ?comptype ?order');
        $queryComp->setWherePart('WHERE {<'.$dsdUri.'> <'.$this->_uris['component'].'> ?comp.                
                                    ?comp <'.$this->_uris['rdfType'].'> 
                                        <'.$this->_uris['ComponentSpecification'].'>.
                                    ?comp <'.$this->_uris[$type].'> ?comptype.
                                    OPTIONAL {?comp <'.$this->_uris['order'].'> ?order.}}
                                  ORDER BY ASC(?order)');

        $queryresultComp = $this->_model->sparqlQuery($queryComp);

        //iterate through all found results
        foreach($queryresultComp as $comp) {
            if(isset($comp['comp'])) {
                //add the component properties to the result set
                $result[$comp['comp']]['uri'] = $comp['comp'];
                $result[$comp['comp']]['md5'] = md5($comp['comp']);
                $result[$comp['comp']]['type'] = $comp['comptype'];
                if($type == 'dimension') {
                    $result[$comp['comp']]['elemCount'] 
                        = $this->getComponentElementCount($dsUri, $comp['comptype']);
                }
                $result[$comp['comp']]['order'] 
                    = (isset($comp['order']) ? $comp['order'] : -1);
                if(isset($titleHelper)) $titleHelper->addResource($comp['comp']);
            }
        }
        
        return $result;
    }
    
    /**
     * Returns an allocation of the chart x- and z-Axis evaluated by the order
     * (higher = smaller order value = x) and element count (greater = x) 
     * of the dimensions.
     * @param array $dimensions The dimensions to evaluate:
     * ... => 'dimensionUri'
     * @param array $dimTable The dimension table of all dimensions in the given
     * knowledge base; uses the result of getComponents()
     * @return array The allocation proposal:
     * 'dimensionUri' => ('x' XOR 'z') 
     */
    public function getAxisAllocation($dimensions, $dimTable) {
        
        $allocation = array();
        $maximumRank = array('order' => 999, 'count' => 0, 'dimension' => '');
        
        foreach($dimensions as $dimension) {
            $order = $dimTable[$dimension]['order'];
            $count = $dimTable[$dimension]['elemCount'];                
            if(($order != -1 && $order < $maximumRank['order'])
                    || ($order == -1 && $count > $maximumRank['count'])) {
                $maximumRank['dimension'] = $dimension;
                $maximumRank['order'] = $order;
                $maximumRank['count'] = $count;
            }
        }
        
        foreach($dimensions as $dimension) {
            $allocation[$dimension] 
                = ($maximumRank['dimension'] == $dimension ? 'x' : 'z');
            if($dimTable[$dimension]['elemCount'] == 1)
                $allocation[$dimension] = '-';
        }
        
        return $allocation;
    }
    
    /**
     * Returns all observations fitting the given specification of dimensions,
     * measures, pagination limits and excluded elements.
     * @param array $resultCubeSpec The specification for the observations which
     * form the result cube of the query:
     * 'ds' => 'dataSetUri'
     * 'dim' => { ... => 'dimensionUri' }
     * 'dimtypes' => result of getComponents()
     * 'ms' => { ... => 'measureUri' }
     * 'mstypes' => result of getComponents()
     * 'dimElemList' => { 'dimensionUri' => { ... => 'excludedElementUri' } }
     * 'dimLimitList' => { 'dimensionUri' => { 'limit' => int, 'offset' => int } }
     * 'dimOptionList' => { 'dimensionUri' => { 'order' => string } }
     * 'measFunctionList' => { 'measureUri' => string }
     * 'measOptionList' => { 'measureUri' => { 'order' => string, 'round' => boolean } }  
     * @return array All observations fitting the specification of the result:
     * 'observations' => queryResult
     * 'nameTable' => { 
     * 'd' => { 'dimensionUri' => { 'index' => int, 'qname' =>
     * string, 'uri' => string, 'type' => 'propertyUri', 'label' => string} },
     * 'm' => { 'measureUri' => { 'index' => int, 'qname' => string, 'uri' => string,
     * 'type' => 'propertyUri', 'label' => string} } 
     * } 
     */
    public function getResultObservations($resultCubeSpec) {
		
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
        
        $titleHelper = new OntoWiki_Model_TitleHelper($this->_model);
        
        $queryProloguePart = "SELECT";
        $queryWherePart = "WHERE { ?observation <".$this->_uris['rdfType']."> 
            <".$this->_uris['Observation'].">.";
        $queryWherePart .= " ?observation <".$this->_uris['datasetrel']."> 
            <".$resultCubeSpec['ds'].">.";
        $queryGroupByPart = "";
        $queryOrderByPart = "";
        
        $queryComp = new Erfurt_Sparql_SimpleQuery();
        
        //add all dimensions to the query
        foreach($resultCubeSpec['dim'] as $index => $dimension) {
            
            $dimPropertyUri = $resultCubeSpec['dimtypes'][$dimension]['type'];
            $dimQName = "d".$index;
            
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
                
                $dimElemList = $this->getComponentElements($resultCubeSpec['ds'], $dimPropertyUri);
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
        
        $queryResultObservations = $this->_model->sparqlQuery($queryObservations);
        
        $result = array ('observations'=>$queryResultObservations, 
            'nameTable'=>$internalNameTable);

        return $result;
        
    }
    
    /**
     * Returns a layouted set of result observation data by splitting the 
     * dimension and measure data to seperated arrays and rounding the values if
     * set so.
     * @param array $resultObservations The query result for the observations
     * @param array $measOptionList The measure options list, because the rounding
     * has to be done in PHP due to the lack of a round function in SPARQL 1.0
     * 'measureUri' => { 'order' => string, 'round' => boolean }
     * @return array The result observation data layouted to two arrays:
     * The indices in both arrays belonging to each other, so the entry x in the
     * dimensions array indicates all dimension elements for which the array entry
     * x in the measure array contains all measure values
     * 'dimensionData' => { ... => { 'qname' => 'dimensionElementUri' } }
     * 'measureData' => { ... => { 'qname' => 'measureValue' } }
     */
    public function layoutObservationData($resultObservations, $measOptionList) {
        
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
                                ENT_QUOTES | ENT_HTML401);
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
     * Returns all elements of a dimension or measure component. If a title helper
     * is given, the resources will be added.
     * @param string $dataSet The data set which has to be used
     * @param string $componentProperty The property uri of the component for which 
     * the elements should be gathered
     * @param OntoWiki_Model_TitleHelper $titleHelper The title helper for the 
     * names of the elements
     * @param array $limits The limits for the gathering of elements, indicated
     * by an array with the indices 'limit' and 'offset'
     * @return array The elements which are linked to the given component 
     */
    public function getComponentElements($dataSet, $componentProperty, $titleHelper = null, $limits = array()) {
        
        $result = array();
        $wherePart = "";
                
        $queryComponentElements = new Erfurt_Sparql_SimpleQuery();
        $queryComponentElements->setProloguePart('SELECT DISTINCT(?element)');
        
        $wherePart = 'WHERE {?observation <'.$this->_uris['rdfType'].'> <'.$this->_uris['Observation'].'>.
            ?observation <'.$this->_uris['datasetrel'].'> <'.$dataSet.'>.
            ?observation <'.$componentProperty.'> ?element.} ORDER BY ASC(?element)';
        
        if(count($limits)>0) {
            $wherePart .= ' LIMIT '.$limits['limit'].' OFFSET '.$limits['offset'];
        }
        
        $queryComponentElements->setWherePart($wherePart);
        
        $queryResultElements = $this->_model->sparqlQuery($queryComponentElements);

        foreach($queryResultElements as $element) {
            if(isset($element['element'])) {
                $result[] = $element['element'];
                if(isset($titleHelper)) 
                    $titleHelper->addResource($element['element']);
            }
        }
        
        return $result;
    }
    
    /**
     * Returns the element count of the number of elements linked to the given component
     * represented by its component property.
     * @param string $dataSet The data set uri for which the elements should be counted
     * @param string $componentProperty The component property uri for which the elements should be gathered
     * @return int The number of elements belonging to the given property
     */
    public function getComponentElementCount($dataSet, $componentProperty) {
        
        $result = 0;
                
        $queryComponentElementCount = new Erfurt_Sparql_SimpleQuery();
        $queryComponentElementCount->setProloguePart('SELECT COUNT(DISTINCT(?element)) 
            AS ?elemCount');
        $queryComponentElementCount->setWherePart('WHERE {?observation 
            <'.$this->_uris['rdfType'].'> <'.$this->_uris['Observation'].'>.
            ?observation <'.$this->_uris['datasetrel'].'> <'.$dataSet.'>.
            ?observation <'.$componentProperty.'> ?element.}');
        
        $queryResultElementCount 
            = $this->_model->sparqlQuery($queryComponentElementCount);

        $countRow = current($queryResultElementCount);
        $result = (int) $countRow['elemCount'];
        
        return $result;
    }
    
    /**
     * Returns all available function codes and names for aggregation functions
     * that can be used in the component.
     * @return array The aggregate functions available and their name strings
     * 'functionCode' => 'functionName' 
     */
    public function provideAggregationFunctions() {
        
        //the sparql 1.0 aggregation functions are listed here for use with 
        //the measure values
        $aggregationFunctions = array('SUM' => 'sum', 
                                      'AVG' => 'average', 
                                      'MIN' => 'minimum', 
                                      'MAX' => 'maximum');
        
        return $aggregationFunctions;  
    }
    
    /**
     * Sets the uri patterns for the helper to use while creating uris for new
     * instances in the knowledge base.
     * @param array $uriPattern A list of the uri patterns to set:
     * 'patternName' => 'patternContent' 
     */
    public function setUriPattern($uriPattern) {
        $this->_uriPattern = $uriPattern;
    }
    
    /**
     * Returns all enabled uri elements which can be used in uri patterns for
     * new instances.
     * @return array The list of enabled uri elements for uri patterns:
     * 'elementName' => boolean 
     */
    public function provideUriElementDescriptions() {
        
        $result = array();
        
        if(isset($this->_uriElements['MODEL']))
                $result['MODEL'] = true;
        if(isset($this->_uriElements['MD5']))
                $result['MD5'] = true;
        if(isset($this->_uriElements['COUNTER']))
                $result['COUNTER'] = true;
        return $result;
    }
    
    /**
     * Returns an uri for a new instance of a cube element.
     * @param string $identifier The uri of an associated instance that can be
     * used to create a unique hash, i.e. the dimension property for component
     * specifications
     * @param string $type The type of the associated instance for which the 
     * uri has to be created, can be 'dp' for dimension property, 'mp' for measure
     * property, 'ds' for data set, 'dsd' for data structure definition
     * @return string The created uri string 
     */
    private function _createURI($identifier, $type) {
        
        $time = time();
        $result = '';
        $md5 = '';

        switch($type) {
            case 'dp':
                $result = $this->_uriPattern['ComponentSpecification'];
                if(isset($this->_uriElements['MODEL']))
                        $result = str_replace('<MODEL>', $this->_modelUriCutted, $result);
                if(isset($this->_uriElements['MD5'])) {
                    $md5 = md5($identifier.'dimension'.$time);
                    $result = str_replace('<MD5>', $md5, $result);
                }   
                break;
            case 'mp':
                $result = $this->_uriPattern['ComponentSpecification'];
                if(isset($this->_uriElements['MODEL']))
                        $result = str_replace('<MODEL>', $this->_modelUriCutted, $result);
                if(isset($this->_uriElements['MD5'])) {
                    $md5 = md5($identifier.'measure'.$time);
                    $result = str_replace('<MD5>', $md5, $result);
                }
                break;
            case 'ds':
                $result = $this->_uriPattern['DataSet'];
                if(isset($this->_uriElements['MODEL']))
                        $result = str_replace('<MODEL>', $this->_modelUriCutted, $result);
                if(isset($this->_uriElements['MD5'])) {
                    $md5 = md5($identifier.'dataset'.$time);
                    $result = str_replace('<MD5>', $md5, $result);
                }
                break;
            case 'dsd':
                $result = $this->_uriPattern['DataStructureDefinition'];
                if(isset($this->_uriElements['MODEL']))
                        $result = str_replace('<MODEL>', $this->_modelUriCutted, $result);
                if(isset($this->_uriElements['MD5'])) {
                    $md5 = md5($identifier.'datastructuredefinition'.$time);
                    $result = str_replace('<MD5>', $md5, $result);
                }
                break;
        }

        if(isset($this->_uriElements['COUNTER'])) {
            if(strpos($result, '<COUNTER>') !== false) {
                $result = str_replace('<COUNTER>', $this->_uriCounter, $result);
                $this->_uriCounter++;
            }
        }
        
        return $result;
    }
    
}
?>
