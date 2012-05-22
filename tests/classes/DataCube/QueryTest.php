<?php

require dirname ( __FILE__ ). '/../../bootstrap.php';

class DataCube_QueryTest extends PHPUnit_Framework_TestCase
{
    private $_erfurt;
    private $_model;
    private $_owApp;
    
    public function setUp ()
    {
        $this->_erfurt = Erfurt_App::getInstance ();
        $this->_model = new Erfurt_Rdf_Model ('http://data.lod2.eu/scoreboard/');
        $this->_owApp = new Zend_Application(
            'default', _OW . 'application/config/application.ini'
        );
        $this->_owApp->bootstrap();
    }
    
    public function tearDown ()
    {
    }
    
    public function testGeneral()
    {
        $th = new OntoWiki_Model_TitleHelper ($this->_model);
        $dsd = DataCube_Query::getDataStructureDefinition ($th);
        $ds = DataCube_Query::getDataSets ( $dsd [0], $th );
        $co = DataCube_Query::getComponents ( $dsd [0], $ds [0], 'dimension', $th );
        
        var_dump ( $dsd );
        var_dump ( $ds );
        var_dump ( $co );
    }
}
