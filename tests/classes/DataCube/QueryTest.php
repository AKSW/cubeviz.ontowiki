<?php

require dirname ( __FILE__ ). '/../../bootstrap.php';

class DataCube_QueryTest extends PHPUnit_Framework_TestCase
{
    private $_erfurt;
    private $_model;
    private $_owApp;
    
    public function setUp ()
    {        
        $this->_erfurt      = Erfurt_App::getInstance ();
        
        $this->_owApp       = new Zend_Application( 'default', _OW . 'application/config/application.ini');
        $this->_owApp->bootstrap();
        
        $this->_model       = new Erfurt_Rdf_Model ('http://data.lod2.eu/scoreboard/');
        $this->_titleHelper = new OntoWiki_Model_TitleHelper ($this->_model);
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
        $query = new DataCube_Query ($this->_model, $this->titleHelper);
        $resultDsd = $query->getDataStructureDefinition ();
        
        // Get test data
        $testSparql = 'SELECT ?dsd WHERE {
            ?dsd <'.DataCube_UriOf::RdfType.'> <'.DataCube_UriOf::DataStructureDefinition.'>. 
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
        $query = new DataCube_Query ($this->_model, $this->titleHelper);
        $resultDsd = $query->getDataStructureDefinition ();
        
        if (0 == count($resultDsd)) return;
        
        $dsUri = $resultDsd [0];
        
        $resultDs = $query->getDataSets ($dsUri);
        
        // Get test data
        $testSparql = 'SELECT ?ds WHERE {
            ?ds <'.DataCube_UriOf::RdfType.'> <'.DataCube_UriOf::DataSet.'>.
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
        $query = new DataCube_Query ($this->_model, $this->titleHelper);
        $dsd = $query->getDataStructureDefinition ();
        if (0 == count($dsd)) return;
        
        $dsd = $dsd [0];
        
        $ds = $query->getDataSets ($dsd); 
        if ( 0 == count($ds)) return;
        
        $ds = $ds[0];
        $componentType = DataCube_UriOf::Dimension;
        
        $resultComponents = $query->getComponents ($dsd, $ds, $componentType);
        
        // Get test data
        $testSparql = 'SELECT ?comp ?comptype ?order WHERE {
            <'.$dsd.'> <'.DataCube_UriOf::Component.'> ?comp.                
            ?comp <'.DataCube_UriOf::RdfType.'> <'.DataCube_UriOf::ComponentSpecification.'>.
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
}
