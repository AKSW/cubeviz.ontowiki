<?php

class DataCube_TestCase extends PHPUnit_Framework_TestCase
{
    protected $_erfurt;
    protected $_model;
    protected $_owApp;
    protected $_query;
    
    public function setUp ()
    {        
        $this->_erfurt      = Erfurt_App::getInstance ();
        
        $this->_owApp       = new Zend_Application( 'default', _OWROOT . 'application/config/application.ini');
        $this->_owApp->bootstrap();
        
        $this->_model       = new Erfurt_Rdf_Model ('http://data.lod2.eu/scoreboard/');
        
        $writer = new Zend_Log_Writer_Stream(dirname(__FILE__).'/../../../../logs/ontowiki.log');
        
        OntoWiki::getInstance()->logger = new Zend_Log($writer);
        
        $this->_query       = new DataCube_Query ($this->_model);
    }
    
    public function tearDown ()
    {
        Zend_Controller_Front::getInstance()->resetInstance();
        
        Zend_Loader_Autoloader::resetInstance();
        $loader = Zend_Loader_Autoloader::getInstance();
        $loader->registerNamespace('DataCube_');
        $loader->registerNamespace('Erfurt_');
        $loader->registerNamespace('OntoWiki_');
    }
    
    public function setUpTestEnvironment () 
    {
        // here create a test environment
        // e.g. create model, fill it, ...
    }
    
    public function shutDownTestEnvironment () 
    {
        // here delete the test environment
        // e.g. delete model
    }
}
