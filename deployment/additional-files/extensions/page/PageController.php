<?php

require_once 'OntoWiki/Controller/Component.php';

/**
 * Controller for OntoWiki
 *
 * @category   OntoWiki
 * @package    OntoWiki_extensions_components_page
 * @author     Sebastian Dietzold <dietzold@informatik.uni-leipzig.de>
 * @copyright  Copyright (c) 2008, {@link http://aksw.org AKSW}
 * @license    http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @version    $Id$
 */
class PageController extends OntoWiki_Controller_Component
{
    /**
     * Default action. Forwards to get action.
     */
    public function __call($action, $params)
    {
        $owN = new OntoWiki_Navigation ();
        $owN->disableNavigation();
        
        $_REQUEST ['urlBase'] = $this->_config->staticUrlBase;
        $_REQUEST ['urlImages'] = $this->_config->staticUrlBase .'extensions/page/page/images/';
        
        // set example knowledge base uri (based on the one in static/data/exampleCube.ttl!)
        $ns = 'http://example.cubeviz.org/datacube/';
        $_REQUEST ['exampleCubeExists'] = $this->_erfurt->getStore()->isModelAvailable ($ns);
        
        $_REQUEST ['allow'] = $this->_erfurt->getAc()->getAllowedActions ();
        $_REQUEST ['allow'] = ( true == isset ($_REQUEST ['allow'][0]) && 
                   'http://ns.ontowiki.net/SysOnt/RegisterNewUser' != $_REQUEST ['allow'][0] ) || 
                 0 == count($_REQUEST ['allow'])
            ? true
            : false;

        $this->render(str_replace  ( 'Action', '', $action));
    }

}

