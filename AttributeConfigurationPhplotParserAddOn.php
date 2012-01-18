<?php
/**
 * This file is part of the {@link http://ontowiki.net OntoWiki} project.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @package Extensions
 */

/**
 * The superclass-file containing the class skeleton for this AddOn
 */
require_once 'ParserAddOn.php';

/**
 * The external library file used by this addon to manipulate the output graphics
 */
require_once 'libraries/phplot/phplot.php';

/**
 * One addon for the PHPlot parser that provides some options that can be adapted
 * with effects on the PHPlot chart object. This addon mainly works on the PHP
 * side because PHPlot is a PHP library. The browser is only used for presenting
 * the input form.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @category OntoWiki
 * @package Extensions
 * @subpackage Cubeviz
 * @author Tom-Michael Hesse <tommichael.hesse@googlemail.com>
 */
class AttributeConfigurationPhplotParserAddOn extends ParserAddOn {
    
    /**
     * Returns the HTML output of the addon to be plugged into the div containers
     * created in the corresponding parser object.
     * @return string The HTML code as a string 
     * @see ParserAddOn::retrieveHTMLOutput()
     */
    public function retrieveHTMLOutput() {
        
        $i = 0;
        
        $submitUri = new OntoWiki_Url(array('controller' => 'chartview', 'action' => 'analyze'));
        
        $htmlPart = '<form name="formAttributeConfiguration" action="'.$submitUri.'" method="POST">';
        
        foreach($_POST as $key => $value) {
            if(is_array($value)) {
                foreach($_POST[$key] as $arrayValue) {
                    $htmlPart .= '<input type="hidden" name="'.$key.'[]" value="'.$arrayValue.'" />';
                }
            } else {
                $htmlPart .= '<input type="hidden" name="'.$key.'" value="'.$value.'" />';
            }
        }
        
        $htmlPart .= '<ol class="bullets-none separated">';
        
        $htmlPart .= '<li class="'.($i % 2 == 0 ? 'even' : 'odd').'"><table border="0"><tr><td>
                        <b>'.
                $this->_translate->_('addon AttributeConfigurationPhplotParserAddOn title chart title').
                '</b>
                        &nbsp;&nbsp;&nbsp;'.
                $this->_translate->_('addon AttributeConfigurationPhplotParserAddOn text chart title').
                ':&nbsp;
                        <input name="attributeConfigurationPhplotParserAddOnTitle" size="15" value="'.
                $this->_chartObject->title_txt.'" />'.
                        (($this->_chartType == 'bar' || $this->_chartType == 'line') ?
                        '&nbsp;&nbsp;&nbsp;'.
                        $this->_translate->_('addon AttributeConfigurationPhplotParserAddOn text x title').
                        ':&nbsp;
                        <input name="attributeConfigurationPhplotParserAddOnXTitle" size="15" value="'.
                        $this->_chartObject->x_title_txt.'" />
                        &nbsp;&nbsp;&nbsp;'.
                        $this->_translate->_('addon AttributeConfigurationPhplotParserAddOn text y title').
                        ':&nbsp;
                        <input name="attributeConfigurationPhplotParserAddOnYTitle" size="15" value="'.
                        $this->_chartObject->y_title_txt.'" />':'').'
                        </td></tr></table></li>';
        $i++;
        
        $htmlPart .= '<li class="'.($i % 2 == 0 ? 'even' : 'odd').'"><table border="0"><tr><td>
                        <b>'.
                $this->_translate->_('addon AttributeConfigurationPhplotParserAddOn title submit changes').
                '</b>
                        &nbsp;&nbsp;&nbsp;<input type="submit" style="background:#fefefe;
                        padding-left:1em;padding-right:1em;" 
                        value="'.
                $this->_translate->_('addon AttributeConfigurationPhplotParserAddOn button submit').'" />
                        &nbsp;&nbsp;&nbsp;<input type="reset" style="background:#fefefe;
                        padding-left:1em;padding-right:1em;" 
                        value="'.
                $this->_translate->_('addon AttributeConfigurationPhplotParserAddOn button reset').'" />
                        </td></tr></table></li>';
        $i++;
        
        $htmlPart .='</ol></form>';
        
        return $htmlPart;
    }
    
    /**
     * Returns the manipulated PHPlot object representing the chart.
     * @return PHPlot The chart object with the user changes via the addon 
     */
    public function retrieveAdaptedContainer() {
        
        if(isset($_POST['attributeConfigurationPhplotParserAddOnTitle'])) {
            $this->_chartObject->setTitle($_POST['attributeConfigurationPhplotParserAddOnTitle']);
        }
        
        if(isset($_POST['attributeConfigurationPhplotParserAddOnXTitle'])) {
            $this->_chartObject->setXTitle($_POST['attributeConfigurationPhplotParserAddOnXTitle']);
        }
        
        if(isset($_POST['attributeConfigurationPhplotParserAddOnYTitle'])) {
            $this->_chartObject->setYTitle($_POST['attributeConfigurationPhplotParserAddOnYTitle']);
        }
        
        return $this->_chartObject;
    }
}

?>
