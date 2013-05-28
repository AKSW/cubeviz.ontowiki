<?php

/**
 * EasyRdf
 *
 * LICENSE
 *
 * Copyright (c) 2013 Nicholas J Humfrey.  All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 * 1. Redistributions of source code must retain the above copyright
 *    notice, this list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the documentation
 *    and/or other materials provided with the distribution.
 * 3. The name of the author 'Nicholas J Humfrey" may be used to endorse or
 *    promote products derived from this software without specific prior
 *    written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS"
 * AND ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE
 * IMPLIED WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE
 * ARE DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE
 * LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR
 * CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF
 * SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS
 * INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN
 * CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE
 * POSSIBILITY OF SUCH DAMAGE.
 *
 * @package    EasyRdf
 * @copyright  Copyright (c) 2013 Nicholas J Humfrey
 * @license    http://www.opensource.org/licenses/bsd-license.php
 * @version    $Id$
 */

/**
 * Functions to compare to graphs with each other
 *
 * @package    EasyRdf
 * @copyright  Copyright (c) 2013 Nicholas J Humfrey
 * @link       http://blog.datagraph.org/2010/03/rdf-isomorphism
 * @license    http://www.opensource.org/licenses/bsd-license.php
 */
class EasyRdf_Isomorphic
{

    /*
     * Returns `true` if $graph1 is isomorphic with $graph2
     */
    public static function isIsomorphic($graph1, $graph2)
    {
        return self::bijectionOf($graph1, $graph2) !== null;
    }

    public static function bijectionOf($graph1, $graph2)
    {
        // Quick check to see if they are at all similar
        if (count($graph1->resources()) !== count($graph2->resources())) {
            return null;
        }

        // Check grounded statements and collect statements with bnodes
        $bnodes1 = array();
        foreach ($graph1->resources() as $resource) {
            if ($resource->isBnode()) {
                array_push($bnodes1, $resource);
            } else {
                foreach ($resource->propertyUris() as $property) {
                    foreach ($resource->all($property) as $value) {
                        if (!$graph2->hasProperty($property, $value)) {
                            // $graph1 has a triple that isn't in $graph2
                            return null;
                        }
                    }
                }
            }
        }
        
        // Collect all the bnodes in the second graph
        $bnodes2 = array();
        foreach ($graph2->resources() as $resource) {
            array_push($bnodes2, $resource);
        
        }

        // ??
        return true;
    }
        
}
