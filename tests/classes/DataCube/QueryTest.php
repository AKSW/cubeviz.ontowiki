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
    }
    
    public function testGetDataStructureDefinition()
    {
        $q = new DataCube_Query ($this->_model, $this->titleHelper);
        $resultDsd = $q->getDataStructureDefinition ();
        
        // Get test data
        $testSparql = 'SELECT ?dsd WHERE {
            ?dsd <http://www.w3.org/1999/02/22-rdf-syntax-ns#type> 
            <http://purl.org/linked-data/cube#DataStructureDefinition>. 
        }';
        
        $testDsd = $this->_model->sparqlQuery ( $testSparql );
        $testResult = array ();
        foreach ( $testDsd as $entry ) {
            $testResult [] = $entry ['dsd'];
        }
        
        $this->assertEquals ($resultDsd, $testResult);
    }
}
