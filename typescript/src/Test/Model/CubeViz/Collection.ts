/**
 * Test if standard id key is equal to id
 */
cubeViz_tests.push(function(){
    
    var c = new CubeViz_Collection;
    this.assertTrue("id" === c.idKey);    
});

/**
 * Test if id key is set properly
 */
cubeViz_tests.push(function(){
    
    var c = new CubeViz_Collection("cool key");
    this.assertTrue("cool key" === c.idKey);
});

/**
 * Test if add function works
 */
cubeViz_tests.push(function(){
    
    var c = new CubeViz_Collection,
        testObj = {id: "bar"};
        
    this.assertTrue(0 == c._.length);
        
    c.add(testObj);
    
    this.assertTrue(1 == c._.length);
    this.assertTrue(true === _.isEqual(c.get("bar"), testObj));
});

/**
 * Test if add function return undefined, if object was not found
 */
cubeViz_tests.push(function(){
    
    var c = new CubeViz_Collection;
        
    this.assertTrue(true === _.isUndefined(c.get("not there")));
});

/**
 * Test if size function works
 */
cubeViz_tests.push(function(){
    
    var c = new CubeViz_Collection;
        
    this.assertTrue(0 === c.size());
    
    try {
        c.add({foo:"bar"});
        this.assertTrue(false, 
            "Collection add must throw an exception because of invalid object"
        );
    } catch(ex){
        this.assertTrue(0 === c.size());
    }
    
    c.add({id:"bar"});
    
    this.assertTrue(1 === c.size());
});

/**
 * Test if addList adds an array properly
 */
cubeViz_tests.push(function(){
    
    var c = new CubeViz_Collection;
    
    this.assertTrue(0 == c._.length);
    
    c.addList([{id: 1, bar: "foo"}, {id: 2, bar: "bar"}]);
    
    this.assertTrue(2 == c._.length);
    
    try {
        c.addList({
            foo: {notAnId: 1, bar: "foo"}
        });
        this.assertTrue(false, 
            "Collection addList > add must throw an exception because of " +
            "invalid object"
        );
    } catch(ex){
        this.assertTrue(2 === c.size());
    }
});

/**
 * Test if addList adds an object properly
 */
cubeViz_tests.push(function(){
    
    var c = new CubeViz_Collection;
    
    this.assertTrue(0 == c._.length);
    
    c.addList({
        foo: {id: 1, bar: "foo"}, bar: {id: 2, bar: "bar"}, baz: {id: 3, bar: "baz"}
    });
    
    this.assertTrue(3 == c._.length);
    
    try {
        c.addList({
            foo: {notAnId: 1, bar: "foo"}
        });
        this.assertTrue(false, 
            "Collection addList > add must throw an exception because of " +
            "invalid object"
        );
    } catch(ex){
        this.assertTrue(3 === c.size());
    }
});

/**
 * Test if exists works
 */
cubeViz_tests.push(function(){
    
    var c = new CubeViz_Collection;
    
    c.add({id: 1, bar: "foo"});
    
    this.assertTrue(1 == c._.length);
    this.assertTrue(true === c.exists("1"));
    this.assertTrue(false === c.exists("not exists"));
});

/**
 * Test if remove works
 */
cubeViz_tests.push(function(){
    
    var c = new CubeViz_Collection;
    
    this.assertTrue(0 == c._.length);
    
    // Number as id
    c.add({id: 1, bar: "foo"});
    this.assertTrue(1 == c._.length);    
    c.remove("1");    
    this.assertTrue(0 == c._.length);
    
    // String as id
    c.add({id: "bar", bar: "foo"});
    this.assertTrue(1 == c._.length);    
    c.remove("bar");    
    this.assertTrue(0 == c._.length);
});

/**
 * Test if reset works
 */
cubeViz_tests.push(function(){
    
    var c = new CubeViz_Collection ();
    
    this.assertTrue(0 == c._.length);
    
    c.add({id: 1, bar: "foo"});
    
    this.assertTrue(1 == c._.length);
    
    /**
     * Reset with parameter
     */
    c.reset("foobar");
    
    this.assertTrue(0 == c._.length);
    this.assertTrue("foobar" === c.idKey);
    
    /**
     * Resert without parameter: test keeping existing key
     */
    c = new CubeViz_Collection ("foo");
    this.assertTrue("foo" === c.idKey);
    
    c.reset();
    
    this.assertTrue(0 == c._.length);
    this.assertTrue("foo" === c.idKey);
});
