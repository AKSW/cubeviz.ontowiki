<?php
/**
 * This file is part of the {@link http://ontowiki.net OntoWiki} project.
 *
 * @copyright Copyright (c) 2011, {@link http://aksw.org AKSW}
 * @license http://opensource.org/licenses/gpl-license.php GNU General Public License (GPL)
 * @package Extensions
 */

header('Content-Type: application/force-download');
header('Content-Description: Configuration file');
header('Content-Disposition: filename=configuration.cvc');

echo urldecode($_GET['configuration']);
?>
