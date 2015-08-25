(function(exports) {
    'use strict';
    
    var NUMERIC_COMPARE = exports.NUMERIC_COMPARE = function(a, b) {
        return (a - b);
    };

    var getRandomSortedArray = exports.getRandomSortedArray = function(size) {
        var randomArray = [];

        for (var i = 0; i < size; i += 1) {
            randomArray.push(Math.random());
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
    };

}(window.testUtils = {}));
