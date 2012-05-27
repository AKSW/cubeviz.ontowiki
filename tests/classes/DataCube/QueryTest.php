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
        
        $this->_owApp       = new Zend_Application( 'default', _OW . 'application/config/application.ini');
        $this->_owApp->bootstrap();
        
        $this->_model       = new Erfurt_Rdf_Model ('http://data.lod2.eu/scoreboard/');
        $this->_titleHelper = new OntoWiki_Model_TitleHelper ($this->_model);
        
        $this->_query       = new DataCube_Query ($this->_model, $this->titleHelper);
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
}
