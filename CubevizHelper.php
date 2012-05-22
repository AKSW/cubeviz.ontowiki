<?php
/**
 * This file is part of the {@link http://ontowiki.net OntoWiki} project.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @package Extensions
 */

/**
 * The superclass-file providing the class skeleton for this class file
 */
require_once 'OntoWiki/Component/Helper.php';

/**
 * Helper for the Chartview component
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Tom-Michael Hesse <tommichael.hesse@googlemail.com>
 */
class CubevizHelper extends Ontowiki_Component_Helper
{

    /**
     * Initializes the helper and creates the tab for the ChartView component.
     */
    public function init() {

        $owApp = OntoWiki::getInstance();

        //register ChartView if a model has been selected
        if($owApp->selectedModel != null) {
            
            OntoWiki_Navigation::register('cubeviz', array(
                'controller'=>'cubeviz',
                'action'=>'analyze',
                'name'=>'CubeViz',
                'priority'=>30));
        }
    }
}