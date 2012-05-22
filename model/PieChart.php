<?php
/**
 * This file is part of the {@link http://ontowiki.net OntoWiki} project.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @package Extensions
 */

/**
 * The superclass-file providing the chart class skeleton for this class file
 */
require_once 'Chart.php';

/**
 * Pie chart model class for the ChartView component. This class adapts the
 * parameters of the default chart model to the pie chart.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Tom-Michael Hesse <tommichael.hesse@googlemail.com>
 */
class PieChart extends Chart {
    
    /**
     * Holds the type of the chart represented as a name string
     * @var string The type of the chart as string
     * @see Chart::$_type 
     */
    protected static $_type = 'pie';
    
    /**
     * Holds the limits as numbers of dimensions and measures of the chart for 
     * which the chart model can be applied
     * @var array The limits of the chart: 'minDimension' => int, 
     * 'maxDimension' => int, 'minMeasure' => int, 'maxMeasure' => int
     * @see Chart::$_limits
     */
    protected static $_limits = array('minDimension' => 1, 'maxDimension' => 1,
        'minMeasure' => 1, 'maxMeasure' => 1);

}

?>
