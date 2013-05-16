<?php

/**
 * 
 */
class CubevizHelper extends OntoWiki_Component_Helper 
{
    /**
     *
     */
    public function __construct() 
    {
        $owApp      = OntoWiki::getInstance();
        $translate  = $owApp->translate;
        $url        = new OntoWiki_Url(array('controller' => 'cubeviz', 'action' => 'analyze'), array());
        $extrasMenu = OntoWiki_Menu_Registry::getInstance()->getMenu('application')->getSubMenu('Extras');
        $extrasMenu->setEntry($translate->_('ApplicationExtrasMenu_Label'), (string) $url);
    }
}
