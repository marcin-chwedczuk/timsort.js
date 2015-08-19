(function(exports) {
    'use strict';

    var MIN_GALLOP = 0;

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

    var binarySearchFindFirst = exports.binarySearchFindFirst = function(array, start, end, element) {
      var left = start;  // inclusive
      var right = end;  // exclusive
      var found;

      while (left < right) {
        var middle = (left + right) >> 1;
        
        if (element > array[middle]) {
          left = middle + 1;
        } else {
          right = middle;
          // We are looking for the lowest index so we can't return immediately.
          found = (element === array[middle]);
        }
      }
      // left is the index if found, or the insertion point otherwise.
      // ~left is a shorthand for -left - 1.
      return found ? left : ~left;
    };

    var NUMERIC_COMPARE = function(a, b) {
        return (a - b);
    };

    var getRandomSortedArray = exports.getRandomSortedArray = function(size) {
        var randomArray = [];

        for (var i = 0; i < size; i += 1) {
            randomArray.push(Math.random());
        }

        randomArray.sort(NUMERIC_COMPARE);
        assertSorted(randomArray);

        return randomArray;
    };

    var testBinarySearch = exports.testBinarySearch = function() {
        var randomArray = getRandomSortedArray(50000);
        
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

    var arrayCopy = exports.arrayCopy = function(source, from, to, dest, destFrom) {
        for (var i = from; i < to; i += 1) {
            dest[destFrom++] = source[i];
        }

        return dest;
    }

    var gallopSearchFindFirst = exports.gallopSearchFindFirst = function(array, start, end, element) {
        var i = 0, p = 1;

        if (element < array[start]) {
            return (-start - 1);
        }

        while ((start + i) < end) {
            if (element <= array[start + i]) {
                return binarySearchFindFirst(array, start + i - (p >> 1), start + i + 1, element);
            }

            i += p;
            p *= 2;
        }

        if (element <= array[end - 1]) {
            return binarySearchFindFirst(array, start + i - (p >> 1), end, element);
        }
        else {
            return (-end - 1);
        }
    };

    var gallopSearchFindLast = exports.gallopSearchFindLast = function(array, start, end, element) {
        var i = 0, p = 1;

        var last = end - 1;

        if (element > array[last]) {
            return (-end - 1);
        }

        while ((last - i) >= start) {
            if (element >= array[last - i]) {
                return binarySearch(array, last - i, last - i + (p >> 1) + 1, element);
            }

            i += p;
            p *= 2;
        }

        if (element >= array[start]) {
            return binarySearch(array, start, last - i + (p >> 1) + 1, element);
        }
        else {
            return (-start - 1);
        }
    };

    var getRandomSortedArrayWithRepetitions = function(size) {
        var a = getRandomSortedArray(size >> 1);

        for (var i = a.length; i < size; i += 1) {
            a[i] = a[Math.floor(i * Math.random())];
        }

        a.sort(NUMERIC_COMPARE);

        return a;
    };

    exports.testGallop = function() {
        var a = getRandomSortedArrayWithRepetitions(25000);

        for (var i = 0; i < 5000; i += 1) {
            var ri = Math.floor(Math.random() * a.length);

            var firstIndex = a.indexOf(a[ri]);
            var lastIndex = a.lastIndexOf(a[ri]);

            if (gallopSearchFindLast(a, 0, a.length, a[ri]) != lastIndex) {
                throw new Error('gallop last failed');
            }

            if (gallopSearchFindFirst(a, 0, a.length, a[ri]) != firstIndex) {
                throw new Error('gallop first failed');
            }
        }

        console.log('test ok');
    };

    var mergeLow = exports.mergeLow = function(array, left, right, mergeArea) {
        var leftEnd = left.startIndex + left.count;

        var R0 = array[right.startIndex], L0 = null;

        // elements in left <= R[0] are already in proper positions
        var leftStart = binarySearch(
            array,
            left.startIndex,
            leftEnd,
            R0);

        // i < leftStart -> left::array[i] is in proper positions
        if (leftStart >= 0) {
            leftStart += 1;
        }
        else {
            leftStart = -leftStart - 1;
        }

        var leftCount = leftEnd - leftStart;
        arrayCopy(array, leftStart, leftEnd, mergeArea, 0);

        var rightStart = right.startIndex;
        var rightEnd = right.startIndex + right.count;
        var rightCount = right.count;

        var maStart = 0;
        var gallopCounter = 0;

        // perform merge
        while (leftCount && rightCount) {
            if (Math.abs(gallopCounter) > MIN_GALLOP) {
                // galloping mode
                
                // -----------------------------------------------------------
                // Part I: Search L0 in B then copy [B..L0) and L0
                // if B contains element === L0, we must skip it (sort must be stable)
                L0 = mergeArea[maStart];

                var index = gallopSearchFindFirst(array, rightStart, rightEnd, L0);
                if (index < 0) {
                    index = -index - 1;
                }
 
                // we don't include element at index
                // to preserve sort stabilness
                var count = index - rightStart;

                // copy elements
                rightCount -= count;
                gallopCounter = count;

                while (count) {
                    array[leftStart++] = array[rightStart++];
                    count -= 1;
                }

                leftCount -= 1;
                array[leftStart++] = mergeArea[maStart++];

                // ------------------------------------------------------------
                // Part II: Search R0 in A then copy [A..R0) and R0
                
                if (!rightCount) {
                    break;
                }

                R0 = array[rightStart];

                // in this case we also copy elements equal to R0
                index = gallopSearchFindLast(mergeArea, maStart, maStart + leftCount, R0);
                if (index < 0) {
                    index = -index - 1;
                }

                count = index - maStart;

                // copy elements 
                leftCount -= count;
                gallopCounter = Math.max(count, gallopCounter);

                while (count) {
                    array[leftStart++] = mergeArea[maStart++];
                    count -= 1;
                }

                rightCount -= 1;
                array[leftStart++] = array[rightStart++];
            }
            else {
                // normal mode
                
                if (mergeArea[maStart] <= array[rightStart]) {
                    array[leftStart++] = mergeArea[maStart];
                    maStart += 1;
                    leftCount -= 1;
                    gallopCounter = (gallopCounter > 0 ? gallopCounter+1 : 1);
                }
                else {
                    array[leftStart++] = array[rightStart];
                    rightStart += 1;
                    rightCount -= 1;
                    gallopCounter = (gallopCounter < 0 ? gallopCounter-1 : -1);
                }
            }
        }

        while (leftCount) {
            array[leftStart++] = mergeArea[maStart++];
            leftCount -= 1;
        }

        while (rightCount) {
            array[leftStart++] = array[rightStart++];
            rightCount -= 1;
        }

        return {
            startIndex: left.startIndex,
            count: left.count + right.count
            // , __array__: array
        };
    };

    var assertSorted = function(array) {
        for (var i = 1; i < array.length; i += 1) {
            if (array[i-1] > array[i]) {
                throw new Error('array not sorted (for i: ' + i + ')');
            }
        }

        console.log('OK!');
    };

    exports.testMergeLo = function() {
        var left = getRandomSortedArray(13720);
        var right = getRandomSortedArray(15837);

        var array = left.concat(right);

        console.log('merge start');

        mergeLow(array, { startIndex:0, count:left.length }, { startIndex: left.length, count: right.length }, []);

        console.log('assert start');
        assertSorted(array);
    };

    // merge left with mergeArea and put to right from top to bottom
    var mergeHigh = exports.mergeHigh = function(array, left, right, mergeArea) {
        var L_END = array[left.startIndex + left.count - 1];
        var R_END;

        var rightStart = right.startIndex;
        var rightEnd = right.startIndex + right.count;

        var index = binarySearchFindFirst(array, rightStart, rightEnd, L_END);
        if (index >= 0) {
            rightEnd = index;
        }
        else {
            rightEnd = -index - 1;
        }

        arrayCopy(array, rightStart, rightEnd, mergeArea, 0);
        
        var rightCount = rightEnd - rightStart;
        var maLast = rightCount - 1;
        
        var leftCount = left.count;
        var leftLast = left.startIndex + left.count - 1;
        var gallopCounter = 0;
        
        while (rightCount && leftCount) {
            if (Math.abs(gallopCounter)) {
                // galloping mode
                
                // ----------------------------------------------
                // Part I: Search L_END in B then copy (L_END...B] and L_END
                // if B contains L_END we must include it
                
                L_END = array[leftLast];

                var index = gallopSearchFindFirst(
                    mergeArea, maLast+1-rightCount, maLast+1, L_END);

                // copy [index maLast+1)
                if (index < 0) {
                    index = -index - 1;
                }

                var count = maLast+1 - index;

                rightCount -= count;
                gallopCounter = count;

                while (count) {
                    array[--rightEnd] = mergeArea[maLast--];
                    count -= 1;
                }

                leftCount -= 1;
                array[--rightEnd] = array[leftLast--];

                // ----------------------------------------------
                // Part II: Search R_END in A then copy (R_END .. A)
                if (!rightCount) {
                    break;
                }

                R_END = mergeArea[maLast];

                index = gallopSearchFindLast(
                    array, leftLast+1-leftCount, leftLast+1, R_END);
                
                if (index < 0) {
                    index = -index - 1;   
                }

                count = leftLast+1 - index;

                leftCount -= count;
                gallopCounter = Math.max(count, gallopCounter);

                while (count) {
                    array[--rightEnd] = array[leftLast--];
                    count -= 1;
                }

                rightCount -= 1;
                array[--rightEnd] = mergeArea[maLast--];
            }
            else {
                if (mergeArea[maLast] >= array[leftLast]) {
                    array[--rightEnd] = mergeArea[maLast];
                    maLast -= 1;
                    rightCount -= 1;
                    gallopCounter = (gallopCounter > 0 ? gallopCounter+1 : 1);
                }
                else {
                    array[--rightEnd] = array[leftLast];
                    leftLast -= 1;
                    leftCount -= 1;
                    gallopCounter = (gallopCounter < 0 ? gallopCounter-1 : -1);
                }
            }
        }

        while (rightCount) {
            array[--rightEnd] = mergeArea[maLast--];
            rightCount -= 1;
        }

        while (leftCount) {
            array[--rightEnd] = array[leftLast--];
            leftCount -= 1;
        }

        return {
            startIndex: left.startIndex,
            count: left.count + right.count
            , __array__: array
        };
    };

    exports.testMergeHi = function() {
        var left = getRandomSortedArray(23720);
        var right = getRandomSortedArray(15837);

        var array = left.concat(right);

        console.log('merge start');

        mergeHigh(array, { startIndex:0, count:left.length }, { startIndex: left.length, count: right.length }, []);

        console.log('assert start');
        assertSorted(array);
    };

    exports.mergeHi = function(left, right) {
        return mergeHigh(left.concat(right), { startIndex:0, count:left.length }, { startIndex:left.length, count:right.length }, []).__array__;
    };

    // elements in left run are <= than element in right run
    var mergeRuns = exports.mergeRuns = function(array, left, right, mergeArea) {
        if (left.count < right.count) {
            return mergoLow(array, left, right, mergeArea);
        }
        else {
            return mergeHigh(array, left, right, mergeArea);
        }
    };

    var mergeCollapse = exports.mergeCollapse = function(array, stack, mergeArea) {
        // stack : [ ... | A | B | C ]
        var A, B, C, M;

        var needsRepeat = true;
        while (needsRepeat) {
            needsRepeat = false;

            var sl = stack.length;

            // A > B + C
            var invariant1 = (sl < 3 || (stack[sl-3].count > stack[sl-2].count + stack[sl-1].count));
            if (!invariant1) {
                C = stack.pop();
                B = stack.pop();
                A = stack.pop();

                // merge smaller of A or C with B (ties favor C)
                if (A.count < C.count) {
                    M = mergeRuns(array, A, B, mergeArea);
                    stack.push(M);
                    stack.push(C);
                }
                else {
                    M = mergeRuns(array, B, C, mergeArea);
                    stack.push(A);
                    stack.push(M);
                }
                
                needsRepeat = true;
            }

            sl = stack.length;

            // B > C
            var invariant2 = (sl < 2 || (stack[sl-2].count > stack[sl-1].count));
            if (!invariant2) {
                // merge B and C
                C = stack.pop();
                B = stack.pop();

                M = mergeRuns(array, B, C, mergeArea);
                stack.push(M);

                needsRepeat = true;
            }
        }
    }; 

    exports.timsort = function(array) {
        var arrayLength = array.length;
        
        var DESIRED_MINRUN_SIZE = mergeComputeMinrun(arrayLength);
        console.log('DESIRED_MINRUN_SIZE = ', DESIRED_MINRUN_SIZE);
        
        var runsStack = [];
        var mergeArea = [];

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

            runsStack.push({ startIndex: startIndex, count: count });
            mergeCollapse(array, runsStack, mergeArea);

            startIndex += count;
        }

        return array;
    };

}(window.timsort = {}));
