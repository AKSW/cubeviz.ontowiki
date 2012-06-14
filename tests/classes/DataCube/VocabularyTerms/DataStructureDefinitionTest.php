<?php

require_once dirname ( __FILE__ ). '/../../../bootstrap.php';

class DataCube_VocabularyTerms_DataStructureDefinitionTest extends DataCube_TestCase
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
        $dsd = new DataCube_VocabularyTerms_DataStructureDefinition ();
        
        $this->assertEquals ( $dsd ['url'], '' );
        $this->assertEquals ( $dsd ['label'], '' );
        
        
        $dsd = new DataCube_VocabularyTerms_DataStructureDefinition ('', '');
        
        $this->assertEquals ( $dsd ['url'], '' );
        $this->assertEquals ( $dsd ['label'], '' );
        
        
        $dsd = new DataCube_VocabularyTerms_DataStructureDefinition ('foo', 'bar');
        
        $this->assertEquals ( $dsd ['url'], 'foo' );
        $this->assertEquals ( $dsd ['label'], 'bar' );
    }
}
