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
    public function getcomponentsAction_allParameterOk_cTDimension() 
    {
        // parameter
        $exampleCubeNs = 'http://example.cubeviz.org/datacube/';
        $dsdUrl = 'http://example.cubeviz.org/datacube/dsd';
        $dsUrl = 'http://example.cubeviz.org/datacube/dataset';
        $componentType = 'dimension';
        
        $response = $this->_sendRequest(
            'cubeviz/getcomponents',
            array(
                'modelIri' => $exampleCubeNs,
                'dsdUrl' => $dsdUrl,
                'dsUrl' => $dsUrl,
                'componentType' => $componentType
            )
        );
        
        $contentObj = json_decode($response ['content'], true);
        
        $this->assertEquals(
            array(
                'code' => 200,
                'content' => array(
                
                    // geo
                    'http://example.cubeviz.org/datacube/cs/geo' => array (
                        
                        // type
                        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' 
                            => 'http://purl.org/linked-data/cube#ComponentSpecification',
                        // label
                        'http://www.w3.org/2000/01/rdf-schema#label' 
                            => 'Component Specification of Region',                            
                        'http://purl.org/linked-data/cube#dimension' 
                            => 'http://example.cubeviz.org/datacube/properties/geo',
                        // __cv
                        '__cv_uri' => 'http://example.cubeviz.org/datacube/cs/geo',
                        '__cv_hashedUri' => '2d95f37cca08dba6a9320a7450780724',
                        '__cv_niceLabel' => 'Component Specification of Region',
                        '__cv_elements' => array (
                            array (
                                // type
                                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' 
                                    => 'http://example.cubeviz.org/datacube/properties/geo',
                                // label
                                'http://www.w3.org/2000/01/rdf-schema#label' => 'England',
                                // __cv
                                '__cv_uri' => 'http://example.cubeviz.org/datacube/England',
                                '__cv_hashedUri' => '7f6211b9cbac655173ec6edd5eb6615f',
                                '__cv_niceLabel' => 'England'
                            ),
                            array (
                                // type
                                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' 
                                    => 'http://example.cubeviz.org/datacube/properties/geo',
                                // label
                                'http://www.w3.org/2000/01/rdf-schema#label' => 'Germany',
                                '__cv_uri' => 'http://example.cubeviz.org/datacube/Germany',
                                '__cv_hashedUri' => '9f3f2a208d1095ee3f9fbea57d3dfbc9',
                                '__cv_niceLabel' => 'Germany'
                            )
                        )
                    ),
                    
                    // time
                    'http://example.cubeviz.org/datacube/cs/time' => array (
                        // type
                        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' 
                            => 'http://purl.org/linked-data/cube#ComponentSpecification',
                        // label
                        'http://www.w3.org/2000/01/rdf-schema#label' 
                            => 'Component Specification of Time',
                        'http://purl.org/linked-data/cube#dimension' 
                            => 'http://example.cubeviz.org/datacube/properties/date',
                        // __cv
                        '__cv_uri' => 'http://example.cubeviz.org/datacube/cs/time',
                        '__cv_hashedUri' => '110155d1d0f0317b8691aad901022ab4',
                        '__cv_niceLabel' => 'Component Specification of Time',
                        '__cv_elements' => array(
                            array(
                                // type
                                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' 
                                    => 'http://example.cubeviz.org/datacube/date',
                                // label
                                'http://www.w3.org/2000/01/rdf-schema#label' => '2001',
                                // __cv
                                '__cv_uri' => 'http://example.cubeviz.org/datacube/Y2001',
                                '__cv_hashedUri' => '4078542f31d4f1019a19bb37820b1ecd',
                                '__cv_niceLabel' => '2001'
                            ),
                            array(
                                // type
                                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' 
                                    => 'http://example.cubeviz.org/datacube/date',
                                // label
                                'http://www.w3.org/2000/01/rdf-schema#label' => '2002',
                                // __cv
                                '__cv_uri' => 'http://example.cubeviz.org/datacube/Y2002',
                                '__cv_hashedUri' => '3233b7e9edf0b6be088c861612e70c9c',
                                '__cv_niceLabel' => '2002'
                            )
                        )
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
    public function getcomponentsAction_allParameterOk_cTMeasure() 
    {
        // parameter
        $exampleCubeNs = 'http://example.cubeviz.org/datacube/';
        $dsdUrl = 'http://example.cubeviz.org/datacube/dsd';
        $dsUrl = 'http://example.cubeviz.org/datacube/dataset';
        $componentType = 'measure';
        
        $response = $this->_sendRequest(
            'cubeviz/getcomponents',
            array(
                'modelIri' => $exampleCubeNs,
                'dsdUrl' => $dsdUrl,
                'dsUrl' => $dsUrl,
                'componentType' => $componentType
            )
        );
        
        $contentObj = json_decode($response ['content'], true);
        
        $this->assertEquals(
            array(
                'code' => 200,
                'content' => array(
                    'http://example.cubeviz.org/datacube/cs/value' => array (
                        // type
                        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' 
                            => 'http://purl.org/linked-data/cube#ComponentSpecification',
                        // label
                        'http://www.w3.org/2000/01/rdf-schema#label' 
                            => 'Component Specification of Value',
                        'http://purl.org/linked-data/cube#measure' 
                            => 'http://example.cubeviz.org/datacube/properties/value',
                        // __cv
                        '__cv_uri' => 'http://example.cubeviz.org/datacube/cs/value',
                        '__cv_hashedUri' => 'b73aeaf8c36224ddbfe4baa3680cedb9',
                        '__cv_niceLabel' => 'Component Specification of Value',
                        '__cv_elements' => array ()
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
    public function getcomponentsAction_allParameterOk_ExceptComponentType() 
    {
        // parameter
        $exampleCubeNs = 'http://example.cubeviz.org/datacube/';
        $dsdUrl = 'http://example.cubeviz.org/datacube/dsd';
        $dsUrl = 'http://example.cubeviz.org/datacube/dataset';
        $componentType = '';
        
        $response = $this->_sendRequest(
            'cubeviz/getcomponents',
            array(
                'modelIri' => $exampleCubeNs,
                'dsdUrl' => $dsdUrl,
                'dsUrl' => $dsUrl,
                'componentType' => $componentType
            )
        );
        
        $contentObj = json_decode($response ['content'], true);
        
        $this->assertEquals(
            array(
                'code' => 400,
                'content' => '',
                'message' => 'componentType was wheter component nor measure'
            ),
            $contentObj
        );
    }
    
    /**
     * @test
     */
    public function getcomponentsAction_allParameterOk_ExceptDsdUrl() 
    {
        // parameter
        $exampleCubeNs = 'http://example.cubeviz.org/datacube/';
        $dsdUrl = '';
        $dsUrl = 'http://example.cubeviz.org/datacube/dataset';
        $componentType = 'dimension';
        
        $response = $this->_sendRequest(
            'cubeviz/getcomponents',
            array(
                'modelIri' => $exampleCubeNs,
                'dsdUrl' => $dsdUrl,
                'dsUrl' => $dsUrl,
                'componentType' => $componentType
            )
        );
        
        $contentObj = json_decode($response ['content'], true);
        
        $this->assertEquals(
            array(
                'code' => 400,
                'content' => '',
                'message' => 'dsdUrl is not valid'
            ),
            $contentObj
        );
    }
    
    /**
     * @test
     */
    public function getcomponentsAction_allParameterOk_ExceptDsUrl() 
    {
        // parameter
        $exampleCubeNs = 'http://example.cubeviz.org/datacube/';
        $dsdUrl = 'http://example.cubeviz.org/datacube/dsd';
        $dsUrl = '';
        $componentType = 'dimension';
        
        $response = $this->_sendRequest(
            'cubeviz/getcomponents',
            array(
                'modelIri' => $exampleCubeNs,
                'dsdUrl' => $dsdUrl,
                'dsUrl' => $dsUrl,
                'componentType' => $componentType
            )
        );
        
        $contentObj = json_decode($response ['content'], true);
        
        $this->assertEquals(
            array(
                'code' => 400,
                'content' => '',
                'message' => 'dsUrl is not valid'
            ),
            $contentObj
        );
    }
    
    /**
     * @test
     */
    public function getcomponentsAction_allParameterOk_ExceptModelIri() 
    {
        // parameter
        $exampleCubeNs = '';
        $dsdUrl = 'http://example.cubeviz.org/datacube/dsd';
        $dsUrl = 'http://example.cubeviz.org/datacube/dataset';
        $componentType = 'dimension';
        
        $response = $this->_sendRequest(
            'cubeviz/getcomponents',
            array(
                'modelIri' => $exampleCubeNs,
                'dsdUrl' => $dsdUrl,
                'dsUrl' => $dsUrl,
                'componentType' => $componentType
            )
        );
        
        $contentObj = json_decode($response ['content'], true);
        
        $this->assertEquals(
            array(
                'code' => 404,
                'content' => '',
                'message' => 'Model not available'
            ),
            $contentObj
        );
    }
    
    /**
     * @test
     */
    public function getdatasetsAction_noParameter() 
    {
        $response = $this->_sendRequest(
            'cubeviz/getdatasets'
        );
        
        $contentObj = json_decode($response ['content'], true);
               
        $this->assertEquals(
            array( 
                'code' => 404, 
                'content' => '',
                'message' => 'Model not available'
            ),
            $contentObj
        );
    }    
    
    /**
     * @test
     */
    public function getdatasetsAction_parameterDsdUrlIsEmpty() 
    {
        $dsdUrl = '';
        
        $response = $this->_sendRequest(
            'cubeviz/getdatasets',
            array (
                'dsdUrl' => ''
            )
        );
               
        $contentObj = json_decode($response ['content'], true);
               
        $this->assertEquals(
            array( 
                'code' => 404, 
                'content' => '',
                'message' => 'Model not available'
            ),
            $contentObj
        );
    }
    
    /**
     * @test
     */
    public function getdatasetsAction_parameterMIsEmpty() 
    {
        $modelIri = '';

        $response = $this->_sendRequest(
            'cubeviz/getdatasets',
            array (
                'modelIri' => $modelIri
            )
        );
               
        $contentObj = json_decode($response ['content'], true);
               
        $this->assertEquals(
            array( 
                'code' => 404, 
                'content' => '',
                'message' => 'Model not available'
            ),
            $contentObj
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
    public function getdatasetsAction_parameterMAndDsdUrlSet_incompleteLabel() 
    {        
        // parameter
        $exampleCubeNs = 'http://example.cubeviz.org/datacube/';
        $dsdUrl = 'http://example.cubeviz.org/datacube/dsd2';
        
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
            array(
                array(
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' => 'http://purl.org/linked-data/cube#DataSet',
                    'http://purl.org/linked-data/cube#structure' => 'http://example.cubeviz.org/datacube/dsd2',
                    '__cv_uri' => 'http://example.cubeviz.org/datacube/dataset3',
                    '__cv_hashedUri' => '948537c3569848a89fced018d8b681cc',
                    '__cv_niceLabel' => 'dataset3'
                ),
                array (
                    'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' => 'http://purl.org/linked-data/cube#DataSet',
                    'http://www.w3.org/2000/01/rdf-schema#label' => 'Just another DataSet',
                    'http://www.w3.org/2000/01/rdf-schema#comment' => 'Represents a collection of observations and conforming to some common dimensional structure.',
                    'http://purl.org/linked-data/cube#structure' => 'http://example.cubeviz.org/datacube/dsd2',
                    '__cv_uri' => 'http://example.cubeviz.org/datacube/dataset2',
                    '__cv_hashedUri' => '661751d3a3a63a1d289bcde7f6f090ab',
                    '__cv_niceLabel' => 'Just another DataSet'
                )
            )
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
                
                    // Data structure definition 1
                    array (
                        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' => 'http://purl.org/linked-data/cube#DataStructureDefinition',
                        'http://www.w3.org/2000/01/rdf-schema#label' => 'A Data Structure Definition',
                        'http://www.w3.org/2000/01/rdf-schema#comment' => 'Defines the structure of a DataSet or slice.',
                        'http://purl.org/linked-data/cube#component' => 'http://example.cubeviz.org/datacube/cs/value',
                        '__cv_uri' => 'http://example.cubeviz.org/datacube/dsd',
                        '__cv_hashedUri' => 'ccc69b81ccb6634fa314789da32c3532',
                        '__cv_niceLabel' => 'A Data Structure Definition'
                    ),
                    
                    // Data structure definition 2
                    array (
                        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' => 'http://purl.org/linked-data/cube#DataStructureDefinition',
                        'http://www.w3.org/2000/01/rdf-schema#comment' => 'Defines the structure of a DataSet or slice.',
                        'http://purl.org/linked-data/cube#component' => 'http://example.cubeviz.org/datacube/cs/value',
                        '__cv_uri' => 'http://example.cubeviz.org/datacube/dsd2',
                        '__cv_hashedUri' => 'bdf75ba82957df40b05acf2470d652f2',
                        '__cv_niceLabel' => 'dsd2'
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
     * @tes
     */
    public function getobservationsAction_parameterMAndDataHashSet() 
    {
        /**
         * Create an example file 
         */
        $content = json_encode(array(
        
            // data structure definition
            'selectedDSD' => array(
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' => 'http://purl.org/linked-data/cube#DataStructureDefinition',
                'http://www.w3.org/2000/01/rdf-schema#label' => 'A Data Structure Definition',
                'http://www.w3.org/2000/01/rdf-schema#comment' => 'Defines the structure of a DataSet or slice.',
                'http://purl.org/linked-data/cube#component' => 'http://example.cubeviz.org/datacube/dsd/value',
                '__cv_uri' => 'http://example.cubeviz.org/datacube/dsd',
                '__cv_hashedUri' => 'ccc69b81ccb6634fa314789da32c3532',
                '__cv_niceLabel' => 'A Data Structure Definition'
            ),
            
            // data set
            'selectedDS' => array(
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' => 'http://purl.org/linked-data/cube#DataSet',
                'http://www.w3.org/2000/01/rdf-schema#label' => 'A DataSet',
                'http://www.w3.org/2000/01/rdf-schema#comment' => 'Represents a collection of observations and conforming to some common dimensional structure.',
                'http://purl.org/linked-data/cube#structure' => 'http://example.cubeviz.org/datacube/dsd',
                '__cv_uri' => 'http://example.cubeviz.org/datacube/dataset',
                '__cv_hashedUri' => '26d71f183a23bf96058200d78e080f77',
                '__cv_niceLabel' => 'A DataSet'
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
                                '__cv_hashedUri' => '9f3f2a208d1095ee3f9fbea57d3dfbc9',
                                '__cv_niceLabel' => 'Germany'
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
                                '__cv_hashedUri' => '4078542f31d4f1019a19bb37820b1ecd',
                                '__cv_niceLabel' => '2001'
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
        
        echo"<pre>"; var_dump($response); echo "</pre>";
        
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
                        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' => 'http://purl.org/linked-data/cube#Observation',
                        'http://www.w3.org/2000/01/rdf-schema#label' => 'Germany in 2001',
                        'http://purl.org/linked-data/cube#dataSet' => 'http://example.cubeviz.org/datacube/dataset',
                        'http://example.cubeviz.org/datacube/geo' => 'http://example.cubeviz.org/datacube/Germany',
                        'http://example.cubeviz.org/datacube/date' => 'http://example.cubeviz.org/datacube/Y2001',
                        'http://example.cubeviz.org/datacube/unit' => 'whatever it is about',
                        'http://example.cubeviz.org/datacube/value' => '1500',
                        '__cv_uri' => 'http://example.cubeviz.org/datacube/obs1',
                        '__cv_hashedUri' => '3b41580103283d741b03642365e0ac8a',
                        '__cv_niceLabel' => 'Germany in 2001'
                    )
                ),
                'message' => ''
            )
        );
    }
    
    /**
     * @test
     */
    public function getobservationsAction_parameterMAndDataHashSet_incompleteData() 
    {
        /**
         * Create an example file 
         */
        $content = json_encode(array(
        
            // data structure definition
            'selectedDSD' => array (
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' => 'http://purl.org/linked-data/cube#DataStructureDefinition',
                'http://www.w3.org/2000/01/rdf-schema#comment' => 'Defines the structure of a DataSet or slice.',
                'http://purl.org/linked-data/cube#component' => 'http://example.cubeviz.org/datacube/dsd/value',
                '__cv_uri' => 'http://example.cubeviz.org/datacube/dsd2',
                '__cv_hashedUri' => 'bdf75ba82957df40b05acf2470d652f2',
                '__cv_niceLabel' => 'dsd2'
            ),
            
            // data set
            'selectedDS' => array(
                'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' => 'http://purl.org/linked-data/cube#DataSet',
                'http://purl.org/linked-data/cube#structure' => 'http://example.cubeviz.org/datacube/dsd2',
                '__cv_uri' => 'http://example.cubeviz.org/datacube/dataset3',
                '__cv_hashedUri' => '948537c3569848a89fced018d8b681cc',
                '__cv_niceLabel' => 'dataset3'
            ),
            
            // selected component dimensions
            'selectedComponents' => array(
                'dimensions' => array(
                
                    // dimension 1
                    '1422b39f63e05706b4a1cfc57639c52a' => array(
                        // type
                        'http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type' => 
                            'http://purl.org/linked-data/cube#DimensionProperty',
                        // label
                        'http://www.w3.org/2000/01/rdf-schema#label' => 'Region',
                        // __cv
                        '__cv_uri' => 'http://example.cubeviz.org/datacube/properties/geo',
                        '__cv_hashedUri' => '1422b39f63e05706b4a1cfc57639c52a',
                        '__cv_niceLabel' => 'Region',
                        '__cv_elements' => array(
                            // Germany
                            'http://example.cubeviz.org/datacube/Germany' => array (
                                'http://www.w3.org/2000/01/rdf-schema#label' => 'Germany',
                                'http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type' => 
                                    'http://example.cubeviz.org/datacube/Region',
                                '__cv_uri' => 'http://example.cubeviz.org/datacube/Germany',
                                '__cv_hashedUri' => '9f3f2a208d1095ee3f9fbea57d3dfbc9',
                                '__cv_niceLabel' => 'Germany'
                            )
                        )
                    ),
                    
                    // dimension 2 
                    '9913723788d7d46c5980720c3d83f06e' => array (
                        // type
                        'http:\/\/www.w3.org\/1999\/02\/22-rdf-syntax-ns#type' => 
                            'http://purl.org/linked-data/cube#DimensionProperty',
                        // label
                        'http://www.w3.org/2000/01/rdf-schema#label' => 'Date',
                        // __cv
                        '__cv_uri' => 'http://example.cubeviz.org/datacube/properties/date',
                        '__cv_hashedUri' => '9913723788d7d46c5980720c3d83f06e',
                        '__cv_niceLabel' => 'Date',
                        '__cv_elements' => array(
                            // 2003
                            'http://example.cubeviz.org/datacube/Y2003' => array (
                                'http://www.w3.org/2000/01/rdf-schema#label' => '2003',
                                '__cv_uri' => 'http://example.cubeviz.org/datacube/Y2003',
                                '__cv_hashedUri' => 'b0d4881c0053358c1db4c2fa474c7122',
                                '__cv_niceLabel' => 'Y2003'
                            ),
                            // 2004
                            'http://example.cubeviz.org/datacube/Y2004' => array (
                                '__cv_uri' => 'http://example.cubeviz.org/datacube/Y2004',
                                '__cv_hashedUri' => '878fa2cf65ef1962c06e4c01a546913a',
                                '__cv_niceLabel' => 'Y2004'
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
                        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' => 'http://purl.org/linked-data/cube#Observation',
                        'http://www.w3.org/2000/01/rdf-schema#label' => 'Germany in 2003',
                        'http://purl.org/linked-data/cube#dataSet' => 'http://example.cubeviz.org/datacube/dataset3',
                        'http://example.cubeviz.org/datacube/properties/geo' => 'http://example.cubeviz.org/datacube/Germany',
                        'http://example.cubeviz.org/datacube/properties/date' => 'http://example.cubeviz.org/datacube/Y2003',
                        'http://example.cubeviz.org/datacube/properties/unit' => 'whatever it is about',
                        'http://example.cubeviz.org/datacube/properties/value' => '1998',
                        '__cv_uri' => 'http://example.cubeviz.org/datacube/obs7',
                        '__cv_hashedUri' => '74bfba9e3c96c952d00b4fe38d767b34',
                        '__cv_niceLabel' => 'Germany in 2003'
                    ),
                    array (
                        'http://www.w3.org/1999/02/22-rdf-syntax-ns#type' => 'http://purl.org/linked-data/cube#Observation',
                        'http://purl.org/linked-data/cube#dataSet' => 'http://example.cubeviz.org/datacube/dataset3',
                        'http://example.cubeviz.org/datacube/properties/geo' => 'http://example.cubeviz.org/datacube/Germany',
                        'http://example.cubeviz.org/datacube/properties/date' => 'http://example.cubeviz.org/datacube/Y2004',
                        'http://example.cubeviz.org/datacube/properties/unit' => 'whatever it is about',
                        'http://example.cubeviz.org/datacube/properties/value' => '2500',
                        '__cv_uri' => 'http://example.cubeviz.org/datacube/obs8',
                        '__cv_hashedUri' => '604aff1eb1ef76ae194bdbc1d1e11ae0',
                        '__cv_niceLabel' => 'obs8'
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
