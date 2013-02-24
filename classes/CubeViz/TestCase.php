<?php

abstract class CubeViz_TestCase extends PHPUnit_Framework_TestCase
{
    protected $_erfurt;
    protected $_model;
    protected $_owApp;
    protected $_query;
    
    public static $exampleCubeNs = "http://example.cubeviz.org/datacube/";
    
    public function setUp ()
    {        
        $this->_erfurt      = Erfurt_App::getInstance ();
        
        $this->_owApp       = new Zend_Application( 'default', _OWROOT . 'application/config/application.ini');
        $this->_owApp->bootstrap();
        
        $this->_model       = new Erfurt_Rdf_Model ('http://data.lod2.eu/scoreboard/');
        
        $writer = new Zend_Log_Writer_Stream(dirname(__FILE__).'/../../../../logs/ontowiki.log');
        
        OntoWiki::getInstance()->logger = new Zend_Log($writer);
        
        $this->_query       = new DataCube_Query ($this->_model);
        
        CubeViz_TestCase::createExampleCube();
    }
    
    public function tearDown ()
    {
        Zend_Controller_Front::getInstance()->resetInstance();
        
        Zend_Loader_Autoloader::resetInstance();
        $loader = Zend_Loader_Autoloader::getInstance();
        $loader->registerNamespace('DataCube_');
        $loader->registerNamespace('Erfurt_');
        $loader->registerNamespace('OntoWiki_');
        
        CubeViz_TestCase::removeExampleCube();
        CubeViz_TestCase::removeDataHashedFiles();
    }

    /**
     *
     */
    public static function createExampleCube() 
    {
        CubeViz_TestCase::removeExampleCube();
        
        // set file related stuff
        $ttl = file_get_contents ( __DIR__ .'/../../assets/exampleCube.ttl' );
        
        // authenticate in Erfurt
        $backend = Erfurt_App::getInstance ()->getConfig()->store->backend;
        $username = Erfurt_App::getInstance ()->getConfig()->store->{$backend}->username;
        $password = Erfurt_App::getInstance ()->getConfig()->store->{$backend}->password;
                
        Erfurt_App::getInstance ()->authenticate($username, $password);
        
        // try to create new model
        $m = Erfurt_App::getInstance ()->getStore()->getNewModel(
            CubeViz_TestCase::$exampleCubeNs
        );
        
        // import given file content
        Erfurt_App::getInstance ()->getStore()->importRdf (
            CubeViz_TestCase::$exampleCubeNs, 
            $ttl, 
            'ttl',
            Erfurt_Syntax_RdfParser::LOCATOR_DATASTRING
        );
    }
    
    /**
     *
     */
    public static function removeExampleCube() 
    {
        if(true == Erfurt_App::getInstance ()->getStore()->isModelAvailable(
            CubeViz_TestCase::$exampleCubeNs)){
            Erfurt_App::getInstance ()->getStore()->deleteModel (
                CubeViz_TestCase::$exampleCubeNs
            );
        }
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
    
    /**
     *
     */
    public static function writeDataToDataHashedFile($content, $dataHash) 
    {
        $filePath = Erfurt_App::getInstance ()->getCacheDir() . $dataHash;
        
        // can't open the file: throw exception
        if(false === ($fh = fopen($filePath, 'w'))) {
            throw new CubeViz_Exception ('No write permissions for '. $filePath);
            return;
        }

        // write all parameters line by line
        fwrite($fh, $content);
        chmod ($filePath, 0755);
        fclose($fh);
    }
}
