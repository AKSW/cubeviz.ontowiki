<?php

class CubeVizControllerTest extends OntoWiki_Test_ControllerTestCase
{
    public function setUp()
    {
        $this->_extensionName = 'cubeviz';

        $this->setUpExtensionUnitTest();
        
        // create example cube
        $this->_sendRequest('cubeviz/createexamplecube');
    }
    
    /**
     *
     */
    public function tearDown() 
    {
        // create example cube
        $this->_sendRequest('cubeviz/removeexamplecube');
        
        parent::tearDown();
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
            array( 
                'code' => 404, 
                'content' => '',
                'message' => 'Model not available'
            ),
            $result
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
            array( 
                'code' => 404, 
                'content' => '',
                'message' => 'Model not available'
            ),
            $result
        );
    }
    
    /**
     * @test
     */
    public function getdatasetsAction_parameterMIsEmpty() 
    {
        $modelIri = '';
        
        $this->request
             ->setPost(array('modelIri' => $modelIri));
        
        $this->dispatch('/cubeviz/getdatasets');
        
        $result = json_decode($this->response->getBody(), true);
        
        $this->assertEquals(
             array( 
                'code' => 404, 
                'content' => '',
                'message' => 'Model not available'
            ),
            $result
        );
    }
    
    /**
     * @test
     */
    public function getdatasetsAction_parameterMAndDsdUrlSet() 
    {        
        // parameter
        $exampleCubeNs = 'http://example.cubeviz.org/datacube/';
        $dsdUrl = 'http://example.cubeviz.org/datacube/dsd';
        
        $response = $this->_sendRequest(
            'cubeviz/getdatasets',
            array(
                'modelIri' => $exampleCubeNs,
                'dsdUrl' => $dsdUrl
            )
        );
        
        $contentObj = json_decode($response ['content'], true);
        
        $this->assertEquals( 200, $response['code']); 
        $this->assertEquals(
            $contentObj ['content'], 
            array(array(
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' => 'http://purl.org/linked-data/cube#DataSet',
                'http://www.w3.org/2000/01/rdf-schema#label' => 'A DataSet',
                'http://www.w3.org/2000/01/rdf-schema#comment' => 'Represents a collection of observations and conforming to some common dimensional structure.',
                'http://purl.org/linked-data/cube#structure' => 'http://example.cubeviz.org/datacube/dsd',
                '__cv_uri' => 'http://example.cubeviz.org/datacube/dataset',
                '__cv_hashedUri' => '26d71f183a23bf96058200d78e080f77',
                '__cv_niceLabel' => 'A DataSet'
            ))
        );
    }
    
    /**
     * @test
     */
    public function getdatastructuredefinitionsAction_parameterMIsEmpty() 
    {     
        $response = $this->_sendRequest(
            'cubeviz/getdatastructuredefinitions',
            array(
                'modelIri' => ''
            )
        );
        
        $contentObj = json_decode($response['content'], true);
        
        $this->assertEquals(
            404,
            $response['code']
        );
        
        $this->assertEquals(
            "Model not available",
            $contentObj['message']
        );
    }
    
    /**
     * @test
     */
    public function getdatastructuredefinitionsAction_parameterMNotSet() 
    {
        $response = $this->_sendRequest(
            'cubeviz/getdatastructuredefinitions'
        );
        
        $contentObj = json_decode($response['content'], true);
        
        $this->assertEquals(
            404,
            $response['code']
        );
        
        $this->assertEquals(
            "Model not available",
            $contentObj['message']
        );
    }
    
    /**
     * @test
     */
    public function getdatastructuredefinitionsAction_parameterMSet() 
    {        
        // parameter
        $exampleCubeNs = 'http://example.cubeviz.org/datacube/';
        
        $response = $this->_sendRequest(
            'cubeviz/getdatastructuredefinitions',
            array(
                'modelIri' => $exampleCubeNs
            )
        );
        
        $contentObj = json_decode($response ['content'], true);
        
        $this->assertEquals( 200, $response['code']); 

        $this->assertEquals(
            array(
                'code' => 200,
                'content' => array(
                    array(
                        "http://www.w3.org/1999/02/22-rdf-syntax-ns#type" => "http://purl.org/linked-data/cube#DataStructureDefinition",
                        "http://www.w3.org/2000/01/rdf-schema#label" => "A Data Structure Definition",
                        "http://www.w3.org/2000/01/rdf-schema#comment" => "Defines the structure of a DataSet or slice.",
                        "http://purl.org/linked-data/cube#component" => "http://example.cubeviz.org/datacube/dsd/value",
                        "__cv_uri" => "http://example.cubeviz.org/datacube/dsd",
                        "__cv_hashedUri" => "ccc69b81ccb6634fa314789da32c3532",
                        "__cv_niceLabel" => "A Data Structure Definition"
                    )
                ),
                'message' => ''
            ),
            $contentObj
        );
    }
    
    /**
     * @test
     */
    public function getobservationsAction_noParameter() 
    {
        $response = $this->_sendRequest(
            'cubeviz/getobservations'
        );
        
        $contentObj = json_decode($response['content'], true);
        
        $this->assertEquals(
            404,
            $response['code']
        );
        
        $this->assertEquals(
            'Model not available',
            $contentObj['message']
        );
    }
    
    /**
     * @test
     */
    public function getobservationsAction_parameterDataHashIsEmpty() 
    {
        $exampleCubeNs = 'http://example.cubeviz.org/datacube/';
        
        $response = $this->_sendRequest(
            'cubeviz/getobservations',
            array( 
                'modelIri' => $exampleCubeNs,
                'cv_dataHash' => ''
            )
        );
        
        $contentObj = json_decode($response['content'], true);
        
        $this->assertEquals(
            404,
            $response['code']
        );
        
        $this->assertEquals(
            'Data hash is not valid',
            $contentObj['message']
        );
    }
    
    /**
     * @test
     */
    public function getobservationsAction_parameterMIsEmpty() 
    {
        $response = $this->_sendRequest(
            'cubeviz/getobservations',
            array( 
                'modelIri' => ''
            )
        );
        
        $contentObj = json_decode($response['content'], true);
        
        $this->assertEquals(
            404,
            $response['code']
        );
        
        $this->assertEquals(
            'Model not available',
            $contentObj['message']
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
        
        // create hashed file
        $this->_writeDataToDataHashedFile($content, $dataHash);
        
        /**
         * send request
         */
        $exampleCubeNs = 'http://example.cubeviz.org/datacube/';
        
        $response = $this->_sendRequest(
            'cubeviz/getobservations',
            array( 
                'modelIri' => $exampleCubeNs,
                'cv_dataHash' => $dataHash
            )
        );
        
        # echo"<pre>"; var_dump($response); echo "</pre>";
        
        $contentObj = json_decode($response['content'], true);
        
        $this->assertEquals (
            200,
            $response['code']
        );
        
        $this->assertEquals(
            $contentObj,
            array( 
                'code' => 200,
                'content' => array(
                    array(
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
                ),
                'message' => ''
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
    
    /**
     * Based on code from http://codular.com/curl-with-php
     */
    protected function _sendRequest($urlPart, $postFields = array())
    {
        $url = OntoWiki::getInstance()->getConfig()->get('session')->get('identifier') . $urlPart;

        // Get cURL resource
        $curl = curl_init();
        
        // Set some options - we are passing in a useragent too here
        curl_setopt_array($curl, array(
            CURLOPT_RETURNTRANSFER => 1,
            CURLOPT_URL => $url,
            CURLOPT_POSTFIELDS => $postFields
        ));
        
        // Send the request & save response to $resp
        $content = curl_exec($curl);
        
        // if errors appeared
        if(false == $content){
            $message = curl_error($curl); 
            $code = curl_errno($curl);
            $content = null;
        } else {
            
            // check if $content is JSON, use it to set $code
            $contentObj = json_decode($content, true);
            
            if(json_last_error() == JSON_ERROR_NONE) {
                $code = $contentObj['code'];
            } else {
                $code = 200;
            }
            
            $message = null;
        }
        
        // Close request to clear up some resources
        curl_close($curl);
        
        return array ('code' => $code, 'message' => $message, 'content' => $content);
    }
    
    /**
     * 
     */
    public function _writeDataToDataHashedFile($content, $dataHash) 
    {
        $filePath = Erfurt_App::getInstance ()->getCacheDir() . $dataHash;
        file_put_contents($filePath, $content);
    }
}
