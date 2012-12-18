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
class StaticlinksModule extends OntoWiki_Module
{
    protected $session = null;

    public function init() {
        $this->session = $this->_owApp->session;
	}

    public function getTitle() {
        $title = $this->_privateConfig->toArray(); 
        return 'Main navigation';
    }
    
    public function shouldShow(){
		return true;
    }

    /**
     * Returns the content
     */
    public function getContents() {

		$this->view->basePath = $this->_config->staticUrlBase . 'extensions/staticlinks/';
        
        $this->view->links = array ();
        $config = $this->_privateConfig->toArray();

        $this->view->ulClass = 'with-images' == $config ['LinkConfiguration']['ul'] ? 'staticlinks-withImages' : 'staticlinks-plain';
        
        foreach ( $config as $key => $entry ) {
            if ( false !== strpos ( $key, 'Link_' ) ) {
                if ( false === strpos ( $entry ['href'], 'http://' ) ) {
                    $entry ['href'] = $this->_config->staticUrlBase .'page/'. $entry ['href'];
                }
                $this->view->links [] = $entry;
            }
        }
        
        return $this->render('static/templates/StaticLinksModule');
    }

    public function layoutType(){
        return 'inline';
    }
    
}


