<?php

/**
 * @copyright  Copyright (c) 2013, {@link http://aksw.org AKSW}
 * @license    http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 */
class AnalyzeModule extends OntoWiki_Module
{
    protected $session = null;

    public function init() 
    {
        $this->session = $this->_owApp->session;
        
        $loader = Zend_Loader_Autoloader::getInstance();
        $loader->registerNamespace('CubeViz_');
        $loader->registerNamespace('DataCube_');
        $path = __DIR__;
        set_include_path(
            get_include_path() . PATH_SEPARATOR . 
            $path . DIRECTORY_SEPARATOR . PATH_SEPARATOR .
            $path . DIRECTORY_SEPARATOR .'classes' . DIRECTORY_SEPARATOR . PATH_SEPARATOR
        );
    }

    public function getTitle() 
    {
        return 'Analyze';
    }
    
    /**
     */
    public function shouldShow()
    {
        return isset($this->_owApp->selectedModel);
    }

    /**
     * Returns the content
     */
    public function getContents() 
    {
        $q = new DataCube_Query ( $this->_owApp->selectedModel );
        if (false === $q->containsDataCubeInformation()) {
            return false;
        }
        
        // set paths
        $basePath = $this->view->basePath = $this->_config->staticUrlBase . 'extensions/cubeviz/';
        $baseCssPath = $basePath .'public/css/';
        
        // register variables for the template usage        
        $this->view->staticUrlBase = $this->_config->staticUrlBase;
        $this->view->translate = $this->_owApp->translate;
        
        // include CSS
        $this->view->headLink()
            ->prependStylesheet($baseCssPath.'AnalyzeModule/module.css');
        
        /**
         * fill template with content and give generated HTML back
         */
        return $this->render('public/templates/cubeviz/AnalyzeModule');
    }
}


