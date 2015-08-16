(function(exports) {
    'use strict';

    var MIN_GALLOP = 8;

    var countRun = exports.countRun = function(array, startIndex) {
        var arrayLength = array.length;

        // if last index return 1 as run length
        if (startIndex === (arrayLength-1)) {
            return 1;
        }

        var firstElement = array[startIndex];
        var secondElement = array[startIndex + 1];
        var i;

        if (firstElement <= secondElement) {
            // non decreasing run a0 <= a1 <= a2 <= ...
            
            for (i = startIndex + 2; i < arrayLength; i += 1) {
               if (array[i-1] > array[i]) {
                    break;
               }
            }
            
            return (i - startIndex);
        }
        else {
            // firstElement < secondElement
            // decreasing run a0 > a1 > a2 > ...
            
            for (i = startIndex + 2; i < arrayLength; i += 1) {
                if (array[i-1] <= array[i]) {
                    break;
                }
            }
            
            // return negative value for decreasing run
            return -(i - startIndex);
        }
    };

    // reversed array in range [startIndex, endIndex)
    var reverse = exports.reverse = function(array, startIndex, endIndex) {
        if (startIndex + 1 >= endIndex) {
            return;
        }

        endIndex -= 1;

        while (startIndex < endIndex) {
            var tmp = array[startIndex];
            array[startIndex] = array[endIndex];
            array[endIndex] = tmp;

            startIndex += 1;
            endIndex -= 1;
        }

        return array;
    };

    var mergeComputeMinrun = exports.mergeComputeMinrun = function(arraySize) {
        if (arraySize < 64) {
            return arraySize;
        }

        var firstSixBits = arraySize
            .toString(2)
            .substring(0, 6);

        // add 1 if any of other bits than first six is set
        var addOne = arraySize
            .toString(2)
            .indexOf('1', 6) != (-1);

        return parseInt(firstSixBits, 2) + (addOne ? 1 : 0);  
    };

    // binary search borrowed from google closure library
    // https://github.com/google/closure-library/blob/master/closure/goog/array/array.js
    // I changed it so that if finds *last* element equal to @element
    //
    // array must be sorted: a0 <= a1 <= a2 ...
    // search in array segment [start...end)
    var binarySearch = exports.binarySearch = function(array, start, end, element) {
      var left = start;  // inclusive
      var right = end;  // exclusive
      var found = false;

      while (left < right) {
        var middle = (left + right) >> 1;
        
        if (element >= array[middle]) {
            left = middle + 1;
            
            if (!found) {
                found = (element === array[middle]);
            }
        }
        else {
            right = middle;
        }
      }
      // left is the index if found, or the insertion point otherwise.
      // ~left is a shorthand for -left - 1.
      return found ? (left-1) : ~left;
    };

    var testBinarySearch = exports.testBinarySearch = function() {
        var randomArray = [];
        for (var i = 0; i < 50000; i += 1) {
            randomArray.push(Math.random());
        }

        randomArray.sort();

        for (var i = 0; i < 10000; i += 1) {
            var index = Math.floor(Math.random() * randomArray.length);
            var bsIndex = binarySearch(randomArray, 0, randomArray.length, randomArray[index]);
            var expectedIndex = randomArray.lastIndexOf(randomArray[index]);

            if (expectedIndex != bsIndex) {
                throw new Error('test not passes');
            }
        }

        console.log('test OK');
    };

    // minrun is in range [startIndex, endIndex) and should be expanded to minrunSize if possible
    // minrun must be sorted: a0 <= a1 <= a2 ...
    var expandMinrun = exports.expandMinrun = function(array, startIndex, endIndex, desiredMinrunSize) {
        var arrayLength = array.length;
    
        var minrunSize = endIndex - startIndex;
        
        var elementsToAdd = 
            Math.min(arrayLength, endIndex + (desiredMinrunSize - minrunSize))
            - endIndex;

        // perform binary stable insertion sort to expand minrun
            
        for (var i = 0; i < elementsToAdd; i += 1) {
            var insertAt = binarySearch(array, startIndex, endIndex, array[endIndex]);
            
            var currentIndex = endIndex, 
                element = array[endIndex];

            if (insertAt >= 0) {
                // array already contain element equal to array[endIndex] at position insertAt,
                // perform insertion sort - array[endIndex] should end at position insertAt+1
                while (currentIndex > (insertAt+1)) {
                    array[currentIndex] = array[currentIndex-1];
                    currentIndex -= 1;
                }

                array[currentIndex] = element;
            }
            else {
                // array doesn't contain array[endIndex], insertAt = -insertPosition-1
                insertAt = -insertAt - 1;

                while (currentIndex > insertAt) {
                    array[currentIndex] = array[currentIndex-1];
                    currentIndex -= 1;
                }

                array[currentIndex] = element;
            }

            endIndex += 1;
        }

        return { startIndex: startIndex, endIndex: endIndex, array: array };
    };

    exports.randomIntegerArray = function(n) {
        var a = [];

        n = n || 100;
        for (var i = 0; i < n; i += 1) {
            a.push(Math.floor(1024 * Math.random()));
        }

        return a;
    };

    var mergeCollapse = exports.mergeCollapse = function(stack) {
        // stack : [ ... | A | B | C ]
        
        var needsRepeat = true;
        while (needsRepeat) {
            needsRepeat = false;

            var sl = stack.length;

            // A > B + C
            var invariant1 = (sl < 3 || (stack[sl-3].count > stack[sl-2].count + stack[sl-1].count));
            if (!invariant1) {
                // todo: marge - merge smaller of A or C with B (ties favor C)
                
                needsRepeat = true;
            }

            sl = stack.length;

            // B > C
            var invariant2 = (sl < 2 || (stack[sl-2].count > stack[sl-1].count));
            if (!invariant2) {
                // todo: merge
                
                needsRepeat = true;
            }
        }
    }; 

    exports.timsort = function(array) {
        var arrayLength = array.length;
        
        var DESIRED_MINRUN_SIZE = mergeComputeMinrun(arrayLength);
        console.log('DESIRED_MINRUN_SIZE = ', DESIRED_MINRUN_SIZE);
        
        var runsStack = [];

        var startIndex = 0;
        while (startIndex < arrayLength) {
            var count = countRun(array, startIndex);

            // minruns should be in a0 <= a1 <= a2 ... order
            if (count < 0) {
                // must reverse minrun
                count = -count;
                reverse(array, startIndex, startIndex + count);
            }

            // expand minrun if necessary
            if (count < DESIRED_MINRUN_SIZE) {
                var tmp = expandMinrun(array, startIndex, startIndex + count, DESIRED_MINRUN_SIZE);
                count = tmp.endIndex - tmp.startIndex;
            }

            startIndex += count;

            runsStack.push({ startIndex: startIndex, count: count });
            mergeCollapse(runsStack);
        }

        return array;
    };

}(window.timsort = {}));
