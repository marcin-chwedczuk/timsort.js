(function(exports) {
    'use strict';
    
    var NUMERIC_COMPARE = exports.NUMERIC_COMPARE = function(a, b) {
        return (a - b);
    };

    var getRandomArray = exports.getRandomArray = function(size) {
        var randomArray = [];

        for (var i = 0; i < size; i += 1) {
            randomArray.push(Math.random());
        }

        return randomArray;
    };

    var getRandomSortedArray = exports.getRandomSortedArray = function(size) {
        var randomArray = getRandomArray(size);

        randomArray.sort(NUMERIC_COMPARE);

        return randomArray;
    };

    var getRandomSortedArrayWithRepetitions = 
        exports.getRandomSortedArrayWithRepetitions = function(size)
    {
        var randomArray = [];

        for (var i = 0; i < Math.ceil(size / 2); i += 1) {
            randomArray.push(Math.random());
        }

        while (randomArray.length < size) {
            var repetition = 
                randomArray[Math.floor(randomArray.length * Math.random())];
            randomArray.push(repetition);
        }

        randomArray.sort(NUMERIC_COMPARE);
        return randomArray;
    };

    var getRandomIndex = exports.getRandomIndex = function(array) {
        var randomIndex = Math.floor(Math.random() * array.length);
        return randomIndex;
    };

    var assertArrayIsSorted = exports.assertArrayIsSorted = function(array) {
        if (array.length < 2) {
            return;
        }

        var sorted = true;

        for (var i = 1; i < array.length; i += 1) {
            if (array[i-1] > array[i]) {
                sorted = false;
                break;
            }
        }

        if (!sorted) {
            // fail test
            expect(true).toBe(false, 'array is not sorted in ascending order');
        }
        else {
            // disable warning about no expectations
            expect(true).toBe(true); 
        }
    };

    var randomIntegerArray = exports.randomIntegerArray = function(size) {
        var array = [];

        for (var i = 0; i < size; i += 1) {
            var randomInteger = Math.floor(1024 * Math.random());
            array.push(randomInteger);
        }

        return array;
    };


}(window.testUtils = {}));
