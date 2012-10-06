<?php

require_once dirname ( __FILE__ ). '/../../bootstrap.php';

class DataCube_ChartTest extends DataCube_TestCase
{    
    public function setUp ()
    {        
        parent::setUp();
    }
    
    public function tearDown ()
    {
        parent::tearDown();
    }
    
    public function testGetAvailableChartTypes()
    {
        $chart = new DataCube_Chart ();
        
        $availableChartTypes = $chart->getAvailableChartTypes ();
        
        $testChartTypes = array (
            'pie'
        );
        
        $this->assertEquals ($availableChartTypes, $testChartTypes);
    }
}
