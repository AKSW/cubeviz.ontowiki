<?php

require_once dirname ( __FILE__ ). '/../../../bootstrap.php';

class DataCube_VocabularyTerms_DataSetFactoryTest extends DataCube_TestCase
{    
    public function setUp ()
    {        
        parent::setUp();
    }
    
    public function tearDown ()
    {
        parent::tearDown();
    }
    
    public function testConstructor()
    {
        $dsf = new DataCube_VocabularyTerms_DataSetFactory ();
        
        $this->assertEquals ( $dsf ['dataSets'], array () );
    }
    
    public function testInitFromArray()
    {
        
    }
}
