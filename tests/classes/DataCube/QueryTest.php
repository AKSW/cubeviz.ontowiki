<?php

require_once dirname ( __FILE__ ). '/../../bootstrap.php';

class DataCube_QueryTest extends PHPUnit_Framework_TestCase
{
    private $_erfurt;
    private $_model;
    private $_owApp;
    private $_query;
    
    public function setUp ()
    {        
        $this->_erfurt      = Erfurt_App::getInstance ();
        
        $this->_owApp       = new Zend_Application( 'default', _OWROOT . 'application/config/application.ini');
        $this->_owApp->bootstrap();
        
        $logger = OntoWiki::getInstance()->logger;
        
        $this->_model       = new Erfurt_Rdf_Model ('http://data.lod2.eu/scoreboard/');
        $this->_titleHelper = new OntoWiki_Model_TitleHelper ($this->_model);
        
        $this->_query       = new DataCube_Query ($this->_model, $this->_titleHelper);
    }
    
    public function tearDown ()
    {
        Zend_Controller_Front::getInstance()->resetInstance();
        
        $this->_erfurt->reset ();
        
        Zend_Loader_Autoloader::resetInstance();
        $loader = Zend_Loader_Autoloader::getInstance();
        $loader->registerNamespace('DataCube_');
        $loader->registerNamespace('Erfurt_');
        $loader->registerNamespace('OntoWiki_');
        
        OntoWiki_Navigation::reset();
    }
    
    public function testGetDataStructureDefinition()
    {
        $resultDsd = $this->_query->getDataStructureDefinition ();
        
        // Get test data
        $testSparql = 'SELECT ?dsd WHERE {
            ?dsd <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::DataStructureDefinition.'>. 
        }';
        
        $testDsd = $this->_model->sparqlQuery ( $testSparql );
        $testResult = array ();
        foreach ( $testDsd as $entry ) {
            $testResult [] = $entry ['dsd'];
        }
        
        $this->assertEquals ($resultDsd, $testResult);
    }
    
    public function testGetDataSets()
    {
        $resultDsd = $this->_query->getDataStructureDefinition ();
        
        if (0 == count($resultDsd)) return;
        
        $dsUri = $resultDsd [0];
        
        $resultDs = $this->_query->getDataSets ($dsUri);
        
        // Get test data
        $testSparql = 'SELECT ?ds WHERE {
            ?ds <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::DataSet.'>.
            ?ds <'.DataCube_UriOf::Structure.'> <'.$dsUri.'>.
        };';
        
        $testDsd = $this->_model->sparqlQuery ( $testSparql );
        $testResult = array ();
        foreach ( $testDsd as $entry ) {
            $testResult [] = $entry ['ds'];
        }
        
        $this->assertEquals ($resultDs, $testResult);
    }
    
    public function testGetComponents()
    {
        $dsd = $this->_query->getDataStructureDefinition ();
        if (0 == count($dsd)) return;
        
        $dsd = $dsd [0];
        
        $ds = $this->_query->getDataSets ($dsd); 
        if ( 0 == count($ds)) return;
        
        $ds = $ds[0];
        $componentType = DataCube_UriOf::Dimension;
        
        $resultComponents = $this->_query->getComponents ($dsd, $ds, $componentType);
        
        // Get test data
        $testSparql = 'SELECT ?comp ?comptype ?order WHERE {
            <'.$dsd.'> <'.DataCube_UriOf::Component.'> ?comp.                
            ?comp <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::ComponentSpecification.'>.
            ?comp <'.$componentType.'> ?comptype.
            
            OPTIONAL {?comp <'.DataCube_UriOf::Order.'> ?order.}
        }
        ORDER BY ASC(?order);';
        
        $queryresultComp = $this->_model->sparqlQuery($testSparql);
        
        $testResult = array();
        
        //iterate through all found results
        foreach($queryresultComp as $comp) {
            if(false == empty($comp['comp'])) {
				//add the component properties to the result set
                $testResult[$comp['comp']]['uri'] = $comp['comp'];
                $testResult[$comp['comp']]['md5'] = md5($comp['comp']);
                $testResult[$comp['comp']]['type'] = $comp['comptype'];
                if($componentType == 'dimension'){
                    $testResult[$comp['comp']]['elementCount'] 
                        = DataCube_Query::getComponentElementCount($dsUri, $comp['comptype']);
                }
                $testResult[$comp['comp']]['order'] = isset($comp['order']) 
                    ? $comp['order'] : -1;
            }
        }
        
        $this->assertEquals ( $resultComponents, $testResult );
    }
    
    public function testGetDimensionProperties ()
    {
        $result = $this->_query->getDimensionProperties ();
        
        $testSparql = 'SELECT DISTINCT ?propertyUri ?rdfsLabel WHERE {
            ?propertyUri ?p <'. DataCube_UriOf::DimensionProperty.'>.
            OPTIONAL { ?propertyUri <http://www.w3.org/2000/01/rdf-schema#label> ?rdfsLabel}
        };';
        
        $testResult = $this->_model->sparqlQuery($testSparql);
        
        $this->assertEquals ( $result, $testResult );
    }
    
    public function testGetMeasureProperties()
    {
        $result = $this->_query->getMeasureProperties ();
        
        $testSparql = 'SELECT DISTINCT ?propertyUri ?rdfsLabel WHERE {
            ?propertyUri ?p <'. DataCube_UriOf::MeasureProperty.'>.
            OPTIONAL { ?propertyUri <http://www.w3.org/2000/01/rdf-schema#label> ?rdfsLabel}
        };';
        
        $testResult = $this->_model->sparqlQuery($testSparql);
        
        $this->assertEquals ( $result, $testResult );
    }
    
    public function testGetComponentElements()
    {   
        $dsd = $this->_query->getDataStructureDefinition ();
        $dsd = $dsd [0];
        
        $ds = $this->_query->getDataSets ($dsd);         
        $ds = $ds[0];
        
        $componentProperty = $this->_query->getDimensionProperties ();
        $componentProperty = $componentProperty [0] ['propertyUri'];
        
        // case 1        
        $result = $this->_query->getComponentElements ( $ds, $componentProperty );
        
        $testSparql = 'SELECT DISTINCT ?element WHERE {
            ?observation <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::Observation.'>.
            ?observation <'.DataCube_UriOf::DataSetRelation.'> <'.$ds.'>.
            ?observation <'.$componentProperty.'> ?element.
        } 
        ORDER BY ASC(?element)';
        
        $queryResultElements = $this->_model->sparqlQuery($testSparql);
		
        $testResult = array();
        
		foreach($queryResultElements as $key => $element) {
            if(false == empty ($element['element'])) {
				$testResult[$key] = $element['element'];
			}
        }
        
        $this->assertEquals ( $result, $testResult );
        
        
        // case 2
        $result = $this->_query->getComponentElements ( $ds, $componentProperty, 0, 0 );
                
        $testSparql = 'SELECT DISTINCT ?element WHERE {
            ?observation <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::Observation.'>.
            ?observation <'.DataCube_UriOf::DataSetRelation.'> <'.$ds.'>.
            ?observation <'.$componentProperty.'> ?element.
        } 
        ORDER BY ASC(?element)';
        
        $queryResultElements = $this->_model->sparqlQuery($testSparql);
		
        $testResult = array();
        
		foreach($queryResultElements as $key => $element) {
            if(false == empty ($element['element'])) {
				$testResult[$key] = $element['element'];
			}
        }
        
        $this->assertEquals ( $result, $testResult );
        
        
        // case 3
        $result = $this->_query->getComponentElements ( $ds, $componentProperty, 5, 0 );
                
        $testSparql = 'SELECT DISTINCT ?element WHERE {
            ?observation <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::Observation.'>.
            ?observation <'.DataCube_UriOf::DataSetRelation.'> <'.$ds.'>.
            ?observation <'.$componentProperty.'> ?element.
        } 
        ORDER BY ASC(?element) 
        LIMIT 5 
        OFFSET 0';
        
        $queryResultElements = $this->_model->sparqlQuery($testSparql);
		
        $testResult = array();
        
		foreach($queryResultElements as $key => $element) {
            if(false == empty ($element['element'])) {
				$testResult[$key] = $element['element'];
			}
        }
        
        $this->assertEquals ( $result, $testResult );
        
        
        // case 4
        $result = $this->_query->getComponentElements ( $ds, $componentProperty, 1, 3 );
                
        $testSparql = 'SELECT DISTINCT ?element WHERE {
            ?observation <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::Observation.'>.
            ?observation <'.DataCube_UriOf::DataSetRelation.'> <'.$ds.'>.
            ?observation <'.$componentProperty.'> ?element.
        } 
        ORDER BY ASC(?element) 
        LIMIT 1 
        OFFSET 3';
        
        $queryResultElements = $this->_model->sparqlQuery($testSparql);
		
        $testResult = array();
        
		foreach($queryResultElements as $key => $element) {
            if(false == empty ($element['element'])) {
				$testResult[$key] = $element['element'];
			}
        }
        
        $this->assertEquals ( $result, $testResult );
    }
    
    public function testGetComponentElementCount()
    {   
        $dsd = $this->_query->getDataStructureDefinition ();
        $dsd = $dsd [0];
        
        $ds = $this->_query->getDataSets ($dsd);         
        $ds = $ds[0];
        
        $componentProperty = $this->_query->getDimensionProperties ();
        $componentProperty = $componentProperty [0] ['propertyUri'];
     
        $result = $this->_query->getComponentElementCount ( $ds, $componentProperty );
        
        $testSparql = 'SELECT DISTINCT ?element WHERE {
            ?observation <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> <'.DataCube_UriOf::Observation.'>.
            ?observation <'.DataCube_UriOf::DataSetRelation.'> <'.$ds.'>.
            ?observation <'.$componentProperty.'> ?element.
        } 
        ORDER BY ASC(?element)';
        
        $queryResultElements = $this->_model->sparqlQuery($testSparql);
		
        $testResult = array();
        
		foreach($queryResultElements as $key => $element) {
            if(false == empty ($element['element'])) {
				$testResult[$key] = $element['element'];
			}
        }
        
        $this->assertEquals ( $result, count ( $testResult ) );
    }
    
    public function testGetResultObservations()
    {   
        $dsUri = 'http://data.lod2.eu/scoreboard/DS_6b611b19ff2a0b58057966f04dd1ddcb';
        
        $dimensions = array ( 
            'http://data.lod2.eu/scoreboard/CS_6446b89c16157a57572faf63ae3abe39',
            'http://data.lod2.eu/scoreboard/CS_f50ed29d32cfe1eee6d686359c96f3c5'
        );
    
        $dimensionElements = array (
            'http://data.lod2.eu/scoreboard/CS_6446b89c16157a57572faf63ae3abe39' => array (
                'Austria', 'Latvia', 'Slovenia'
            ), 
            'http://data.lod2.eu/scoreboard/CS_f50ed29d32cfe1eee6d686359c96f3c5' => array (
                'http://data.lod2.eu/scoreboard/indicators/e_adesucu_ENT_ALL_XFIN_ent',
                'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent',
                'http://data.lod2.eu/scoreboard/indicators/e_crman_ENT_ALL_XFIN_ent',
                'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent',
                'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent'
            )
        );
        
        $dimensionTypes = array (
            'http://data.lod2.eu/scoreboard/CS_6446b89c16157a57572faf63ae3abe39' => array (
                'uri'       => 'http://data.lod2.eu/scoreboard/CS_6446b89c16157a57572faf63ae3abe39',
                'type'      => 'http://data.lod2.eu/scoreboard/properties/country',
                'elemCount' => 32,
                'order'     => -1
            ),
            'http://data.lod2.eu/scoreboard/CS_f50ed29d32cfe1eee6d686359c96f3c5' => array (
                'uri'       => 'http://data.lod2.eu/scoreboard/CS_f50ed29d32cfe1eee6d686359c96f3c5',
                'type'      => 'http://data.lod2.eu/scoreboard/properties/indicator',
                'elemCount' => 67,
                'order'     => 1
            )
        );
        
        $dimensionOptions = array (
            'http://data.lod2.eu/scoreboard/CS_6446b89c16157a57572faf63ae3abe39' => array (
                'order' => 'NONE'
            ), 
            'http://data.lod2.eu/scoreboard/CS_f50ed29d32cfe1eee6d686359c96f3c5' => array (
                'order' => 'NONE'
            ) 
        );
    
        $measures = array (
            'http://data.lod2.eu/scoreboard/CS_96a30f4c16b4bcbfba54658ec7a99046'
        );
        
        $measureTypes = array (
            'http://data.lod2.eu/scoreboard/CS_96a30f4c16b4bcbfba54658ec7a99046' => array (
                'uri'   => 'http://data.lod2.eu/scoreboard/CS_96a30f4c16b4bcbfba54658ec7a99046',
                'type'  => 'http://data.lod2.eu/scoreboard/properties/value',
                'order' => '-1'
            )
        );
           
        $measureAggregationMethods = array (
            'http://data.lod2.eu/scoreboard/CS_96a30f4c16b4bcbfba54658ec7a99046' => 'sum'
        );
        
        $measureOptions = array (
            'http://data.lod2.eu/scoreboard/CS_96a30f4c16b4bcbfba54658ec7a99046' => array ( 
                'order' => 'NONE'
            )
        );
        
        $result = $this->_query->getResultObservations (
            $dsUri, 
            $dimensions, $dimensionElements, $dimensionTypes, $dimensionOptions, 
            $measures, $measureTypes, $measureAggregationMethods, $measureOptions
        );
        
        // construct test result
        $testResult = array ( 
        
            'nameTable' => array (
                'd' => array (
                    'http://data.lod2.eu/scoreboard/CS_6446b89c16157a57572faf63ae3abe39' => array (
                        'index' => 0,
                        'qname' => 'd0',
                        'uri'   => 'http://data.lod2.eu/scoreboard/CS_6446b89c16157a57572faf63ae3abe39',
                        'type'  => 'http://data.lod2.eu/scoreboard/properties/country',
                        'label' => 'country'
                    ),
                    'http://data.lod2.eu/scoreboard/CS_f50ed29d32cfe1eee6d686359c96f3c5' => array (
                        'index' => 1,
                        'qname' => 'd1',
                        'uri'   => 'http://data.lod2.eu/scoreboard/CS_f50ed29d32cfe1eee6d686359c96f3c5',
                        'type'  => 'http://data.lod2.eu/scoreboard/properties/indicator',
                        'label' => 'indicator'
                    )
                )
            ),
        
            'observations' => array (
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_broad_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_ebuy_ENT_SM_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_crman_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_crman_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_crman_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_crman_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_crman_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_crman_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_crman_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_crman_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_crman_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_adesucu_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_adesucu_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_adesucu_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_adesucu_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_adesucu_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_adesucu_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Austria', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_adesucu_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Latvia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_adesucu_ENT_ALL_XFIN_ent' ), 
                array ( 'd0' => 'Slovenia', 'd1' => 'http://data.lod2.eu/scoreboard/indicators/e_adesucu_ENT_ALL_XFIN_ent' )
            )
        );
        
        $this->assertEquals ( $result, $testResult );
    }
}
