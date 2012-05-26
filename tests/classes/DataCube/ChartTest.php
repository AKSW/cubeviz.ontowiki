<?php

require dirname ( __FILE__ ). '/../../bootstrap.php';

class DataCube_ChartTest extends PHPUnit_Framework_TestCase
{
    private $_erfurt;
    
    public function setUp ()
    {        
    }
    
    public function tearDown ()
    {
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
