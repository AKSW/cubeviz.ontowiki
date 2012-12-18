<?php

/**
 * OntoWiki module – Navigation
 *
 * this is the main navigation module
 *
 * @category   OntoWiki
 * @package    extensions_modules_navigation
 * @author     Konrad Abicht <hello@inspirito.de>
 * @copyright  Copyright (c) 2012, {@link http://aksw.org AKSW}
 * @license    http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 */
class ExamplemodelModule extends OntoWiki_Module
{
    protected $session = null;

    public function init() {
        $this->session = $this->_owApp->session;
	}

    public function getTitle() {
        $title = $this->_privateConfig->toArray(); 
        return 'Examples';
    }
    
    public function shouldShow(){
		// set example knowledge base uri (based on the one in static/data/exampleCube.ttl!)
        $ns = 'http://example.cubeviz.org/datacube/';
        
        $allow = $this->_erfurt->getAc()->getAllowedActions ();
        $allow = ( true == isset ($allow[0]) && 
                   'http://ns.ontowiki.net/SysOnt/RegisterNewUser' != $allow[0] ) || 
                 0 == count($allow)
            ? true
            : false;
        
        // Check if example knowledge base is NOT available yet.
        if (false == $this->_erfurt->getStore()->isModelAvailable ($ns) && true == $allow) {
            return true;
        } else {
            return false;
        }
    }

    /**
     * Returns the content
     */
    public function getContents() {
        
        $this->view->basePath = $this->_config->staticUrlBase . 'extensions/examplemodel/';
        $this->view->createKnowledgebaseLink = $this->_config->staticUrlBase . 'examplemodel/create';

        return $this->render('static/templates/examplemodel/Examplemodel');
    }

    public function layoutType(){
        return 'inline';
    }
    
}


