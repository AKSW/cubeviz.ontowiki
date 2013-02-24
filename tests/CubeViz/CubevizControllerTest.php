<?php

require_once __DIR__ . '/../Bootstrap.php';

class CubeVizControllerTest extends Zend_Test_PHPUnit_ControllerTestCase
{
    public function setUp ()
    {        
        Zend_Controller_Action_HelperBroker::addHelper(new Zend_Layout_Controller_Action_Helper_Layout);
        
        $this->_erfurt      = Erfurt_App::getInstance ();
        
        $this->_owApp       = new Zend_Application( 'default', _OWROOT . 'application/config/application.ini');
        $this->_owApp->bootstrap();
        
        $this->_model       = new Erfurt_Rdf_Model ('http://data.lod2.eu/scoreboard/');
        
        $writer = new Zend_Log_Writer_Stream(dirname(__FILE__).'/../../../../logs/ontowiki.log');
        
        OntoWiki::getInstance()->logger = new Zend_Log($writer);
        
        $this->_query       = new DataCube_Query ($this->_model);
        
        CubeViz_TestCase::createExampleCube();
        
        OntoWiki::getInstance()->getNavigation()->reset();
        OntoWiki::getInstance()->getNavigation()->disableNavigation();
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
        
        OntoWiki::getInstance()->getNavigation()->reset();
        OntoWiki::getInstance()->getNavigation()->disableNavigation();
    }
    
    /**
     * @test
     */
    public function getdatasetsAction_noParameter() 
    {
        $this->request
             ->setPost(array());
        
        $this->dispatch('/cubeviz/getdatasets');
        
        $result = json_decode($this->response->getBody(), true);
        
        $this->assertEquals(
            $result, "Model  not available or dsdUrl  is invalid"
        );
    }    
    
    /**
     * @test
     */
    public function getdatasetsAction_parameterDsdUrlIsEmpty() 
    {
        $dsdUrl = '';
        
        $this->request
             ->setPost(array('dsdUrl' => $dsdUrl));
        
        $this->dispatch('/cubeviz/getdatasets');
        
        $result = json_decode($this->response->getBody(), true);
        
        $this->assertEquals(
            $result, "Model  not available or dsdUrl  is invalid"
        );
    }
    
    /**
     * @test
     */
    public function getdatasetsAction_parameterMIsEmpty() 
    {
        $m = '';
        
        $this->request
             ->setPost(array('m' => $m));
        
        $this->dispatch('/cubeviz/getdatasets');
        
        $result = json_decode($this->response->getBody(), true);
        
        $this->assertEquals(
            $result, "Model  not available or dsdUrl  is invalid"
        );
    }
    
    /**
     * @test
     */
    public function getdatasetsAction_parameterMAndDsdUrlSet() 
    {
        $m = CubeViz_TestCase::$exampleCubeNs;
        $dsdUrl = 'http://example.cubeviz.org/datacube/dsd';
        
        $this->request
             ->setPost(array('m' => $m, 'dsdUrl' => $dsdUrl));
        
        $this->dispatch('/cubeviz/getdatasets');
        
        $result = json_decode($this->response->getBody(), true);
        
        $this->assertEquals(
            $result, 
            array(array(
                'url' => 'http://example.cubeviz.org/datacube/dataset',
                'hashedUrl' => '26d71f183a23bf96058200d78e080f77',
                'label' => 'A DataSet'
            ))
        );
    }
    
    /**
     * @test
     */
    public function getdatastructuredefinitionsAction_parameterMIsEmpty() 
    {
        $m = '';
        
        $this->request
             ->setPost(array('m' => $m));
        
        $this->dispatch('/cubeviz/getdatastructuredefinitions');
        
        $this->assertTrue(
            "Model  not available or you are not authorized" 
            == json_decode ($this->response->getBody())
        );
    }
    
    /**
     * @test
     */
    public function getdatastructuredefinitionsAction_parameterMNotSet() 
    {
        $this->request
             ->setPost(array());
        
        $this->dispatch('/cubeviz/getdatastructuredefinitions');
        
        $this->assertTrue(
            "Model  not available or you are not authorized" 
            == json_decode ($this->response->getBody())
        );
    }
    
    /**
     * @test
     */
    public function getdatastructuredefinitionsAction_parameterMSet() 
    {
        $m = CubeViz_TestCase::$exampleCubeNs;
        
        $this->request
             ->setPost(array('m' => $m));
        
        $this->dispatch('/cubeviz/getdatastructuredefinitions');
        
        $result = json_decode($this->response->getBody(), true);
        
        $this->assertEquals(
            $result,
            array(array(
                'url' => 'http://example.cubeviz.org/datacube/dsd',
                'hashedUrl' => 'ccc69b81ccb6634fa314789da32c3532',
                'label' => 'A Data Structure Definition'
            ))
        );
    }
    
    /**
     * @test
     */
    public function getobservationsAction_noParameter() 
    {
        $this->request
             ->setPost(array());
        
        $this->dispatch('/cubeviz/getobservations');
        
        $result = json_decode($this->response->getBody());
        
        $this->assertEquals(
            $result, "Model  not available or cv_dataHash  is invalid"
        );
    }
    
    /**
     * @test
     */
    public function getobservationsAction_parameterDataHashIsEmpty() 
    {
        $cv_dataHash = '';
        
        $this->request
             ->setPost(array('cv_dataHash' => $cv_dataHash));
        
        $this->dispatch('/cubeviz/getobservations');
        
        $result = json_decode($this->response->getBody());
        
        $this->assertEquals(
            $result, "Model  not available or cv_dataHash  is invalid"
        );
    }
    
    /**
     * @test
     */
    public function getobservationsAction_parameterMIsEmpty() 
    {
        $m = '';
        
        $this->request
             ->setPost(array('m' => $m));
        
        $this->dispatch('/cubeviz/getobservations');
        
        $result = json_decode($this->response->getBody());
        
        $this->assertEquals(
            $result, "Model  not available or cv_dataHash  is invalid"
        );
    }
    
    /**
     * @test
     */
    public function getobservationsAction_parameterMAndDataHashSet() 
    {
        /**
         * Create an example file 
         */
        $content = json_encode(array(
            // DSD
            'selectedDSD' => array(
                'label' => 'A Data Structure Definition',
                'url' => 'http://example.cubeviz.org/datacube/dsd'
            ),
            
            // DS
            'selectedDS' => array(
                'label' => 'A DataSet',
                'url' => 'http://example.cubeviz.org/datacube/dataset'
            ),
            
            // selected component dimensions
            'selectedComponents' => array(
                'dimensions' => array(
                    // dimension 1
                    '1422b39f63e05706b4a1cfc57639c52a' => array(
                        'label' => 'Region',
                        'typeUrl' => 'http://example.cubeviz.org/datacube/geo',
                        'elements' => array(
                            'http://example.cubeviz.org/datacube/Germany' => array (
                                'http://www.w3.org/2000/01/rdf-schema#label' => 'Germany',
                                '__cv_uri' => 'http://example.cubeviz.org/datacube/Germany',
                                '__cv_hashedUri' => '9f3f2a208d1095ee3f9fbea57d3dfbc9'
                            )
                        )
                    
                    // dimension 2
                    ), 
                    '9913723788d7d46c5980720c3d83f06e' => array (
                        'label' => 'Date',
                        'typeUrl' => 'http://example.cubeviz.org/datacube/date',
                        'elements' => array(
                            'http://example.cubeviz.org/datacube/Y2001' => array (
                                'http://www.w3.org/2000/01/rdf-schema#label' => '2001',
                                '__cv_uri' => 'http://example.cubeviz.org/datacube/Y2001',
                                '__cv_hashedUri' => '4078542f31d4f1019a19bb37820b1ecd'
                            )
                        )
                    )
                )
            ),
            
            // to have a really new file
            'hash' => time()
        ));
        $contentHash = md5($content);
        
        $dataHash = 'cv_dataHash-'. $contentHash;
        
        CubeViz_TestCase::writeDataToDataHashedFile($content, $dataHash);
        
        /**
         * Read created example file
         */
        $m = 'http://example.cubeviz.org/datacube/';
        $dataHash = 'cv_dataHash-'. $contentHash;
        
        $this->request
             ->setPost(array('m' => $m, 'cv_dataHash' => $dataHash));
        
        $this->dispatch('/cubeviz/getobservations');
        
        $result = json_decode($this->response->getBody(), true);
        
        $this->assertEquals(
            $result,
            array( 
                0 => array (
                    "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" => array(
                        array (
                                "type" => "uri",
                                "value" => "http://purl.org/linked-data/cube#Observation",
                                "label" => "Observation"
                            )
                    
                    ),
                    "http://www.w3.org/2000/01/rdf-schema#label" => array(
                        array(
                                "type" => "literal",
                                "value" => "Germany in 2001"
                        )
                    ),
                    "http://purl.org/linked-data/cube#dataSet" => array(
                        array (
                            "type" => "uri",
                            "value" => "http://example.cubeviz.org/datacube/dataset",
                            "label" => "A DataSet"
                        )
                    ),
                    "http://example.cubeviz.org/datacube/geo" => array(
                        array(
                            "type" => "uri",
                            "value" => "http://example.cubeviz.org/datacube/Germany",
                            "label" => "Germany"
                        )
                    ),
                    "http://example.cubeviz.org/datacube/date" => array(
                        array(
                            "type" => "uri",
                            "value" => "http://example.cubeviz.org/datacube/Y2001",
                            "label" => "2001"
                        )
                    ),
                    "http://example.cubeviz.org/datacube/unit" => array(
                        array(
                            "type" => "literal",
                            "value" => "whatever it is about"
                        )
                    ),
                    "http://example.cubeviz.org/datacube/value" => array(
                        array(
                            "type" => "literal",
                            "value" => 1500,
                            "datatype" => "http://www.w3.org/2001/XMLSchema#float"
                        )
                    ),
                    "observationUri" => array(
                         array (
                            "type" => "uri",
                            "value" => "http://example.cubeviz.org/datacube/obs1"
                        )
                    )
                )
            )
        );
    }
    
    /**
     * @test
     */
    public function indexAction_noErrorIfNoModel() 
    {
        $this->dispatch('/cubeviz/');
    }
}
