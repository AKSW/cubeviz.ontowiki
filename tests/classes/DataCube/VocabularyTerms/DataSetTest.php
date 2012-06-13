<?php

require_once dirname ( __FILE__ ). '/../../../bootstrap.php';

class DataCube_VocabularyTerms_DataSetTest extends DataCube_TestCase
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
        $ds = new DataCube_VocabularyTerms_DataSet ();
        
        $this->assertEquals ( $ds ['uri'], '' );
        $this->assertEquals ( $ds ['label'], '' );
        
        
        $ds = new DataCube_VocabularyTerms_DataSet ('', '');
        
        $this->assertEquals ( $ds ['uri'], '' );
        $this->assertEquals ( $ds ['label'], '' );
        
        
        $ds = new DataCube_VocabularyTerms_DataSet ('foo', 'bar');
        
        $this->assertEquals ( $ds ['uri'], 'foo' );
        $this->assertEquals ( $ds ['label'], 'bar' );
    }
}
