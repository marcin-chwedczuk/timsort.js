(function(exports) {
    'use strict';

    var MIN_GALLOP = 8;

    var countRun = exports.countRun = function(array, cmp, startIndex) {
        var arrayLength = array.length;

        // if last index return 1 as run length
        if (startIndex === (arrayLength-1)) {
            return 1;
        }

        var firstElement = array[startIndex];
        var secondElement = array[startIndex + 1];
        var i;

        if (cmp(firstElement, secondElement) <= 0) {
            // non decreasing run a0 <= a1 <= a2 <= ...
            
            for (i = startIndex + 2; i < arrayLength; i += 1) {
               if (cmp(array[i-1], array[i]) > 0) {
                    break;
               }
            }
            
            return (i - startIndex);
        }
        else {
            // firstElement < secondElement
            // decreasing run a0 > a1 > a2 > ...
            
            for (i = startIndex + 2; i < arrayLength; i += 1) {
                if (cmp(array[i-1], array[i]) <= 0) {
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
    var binarySearch = exports.binarySearch = function(array, cmp, start, end, element) {
      var left = start;  // inclusive
      var right = end;  // exclusive
      var found = false;

      while (left < right) {
        var middle = (left + right) >> 1;
        
        var cmpResult = cmp(element, array[middle]);
        if (cmpResult >= 0) {
            left = middle + 1;
            
            if (!found) {
                found = (cmpResult === 0);
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

    var binarySearchFindFirst = exports.binarySearchFindFirst = function(array, cmp, start, end, element) {
      var left = start;  // inclusive
      var right = end;  // exclusive
      var found;

      while (left < right) {
        var middle = (left + right) >> 1;
        
        var cmpResult = cmp(element, array[middle]);
        if (cmpResult > 0) {
          left = middle + 1;
        } 
        else {
          right = middle;
          // We are looking for the lowest index so we can't return immediately.
          found = (cmpResult === 0);
        }
      }
      // left is the index if found, or the insertion point otherwise.
      // ~left is a shorthand for -left - 1.
      return found ? left : ~left;
    };

    // minrun is in range [startIndex, endIndex) and should be expanded to minrunSize if possible
    // minrun must be sorted: a0 <= a1 <= a2 ...
    var expandMinrun = exports.expandMinrun = function(array, cmp, startIndex, endIndex, desiredMinrunSize) {
        var arrayLength = array.length;
   
        var minrunSize = endIndex - startIndex;
        
        var elementsToAdd = 
            Math.min(arrayLength, endIndex + (desiredMinrunSize - minrunSize))
            - endIndex;

        // perform binary stable insertion sort to expand minrun
            
        for (var i = 0; i < elementsToAdd; i += 1) {
            var insertAt = binarySearch(array, cmp, startIndex, endIndex, array[endIndex]);
            
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

        return { startIndex: startIndex, endIndex: endIndex };
    };

    var arrayCopy = exports.arrayCopy = function(source, from, to, dest, destFrom) {
        for (var i = from; i < to; i += 1) {
            dest[destFrom++] = source[i];
        }

        return dest;
    }

    var gallopSearchFindFirst = exports.gallopSearchFindFirst = function(array, cmp, start, end, element) {
        var i = 0, p = 1;

        if (cmp(element, array[start]) < 0) {
            return (-start - 1);
        }

        while ((start + i) < end) {
            if (cmp(element, array[start + i]) <= 0) {
                return binarySearchFindFirst(array, cmp, start + i - (p >> 1), start + i + 1, element);
            }

            i += p;
            p *= 2;
        }

        if (cmp(element, array[end - 1]) <= 0) {
            return binarySearchFindFirst(array, cmp, start + i - (p >> 1), end, element);
        }
        else {
            return (-end - 1);
        }
    };

    var gallopSearchFindLast = exports.gallopSearchFindLast = function(array, cmp, start, end, element) {
        var i = 0, p = 1;

        var last = end - 1;

        if (cmp(element, array[last]) > 0) {
            return (-end - 1);
        }

        while ((last - i) >= start) {
            if (cmp(element, array[last - i]) >= 0) {
                return binarySearch(array, cmp, last - i, last - i + (p >> 1) + 1, element);
            }

            i += p;
            p *= 2;
        }

        if (cmp(element, array[start]) >= 0) {
            return binarySearch(array, cmp, start, last - i + (p >> 1) + 1, element);
        }
        else {
            return (-start - 1);
        }
    };

    var mergeLow = exports.mergeLow = function(array, cmp, left, right, mergeArea) {
        var leftEnd = left.startIndex + left.count;

        var R0 = array[right.startIndex], L0 = null;

        // elements in left <= R[0] are already in proper positions
        var leftStart = binarySearch(
            array, cmp,
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

                var index = gallopSearchFindFirst(array, cmp, rightStart, rightEnd, L0);
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
                index = gallopSearchFindLast(mergeArea, cmp, maStart, maStart + leftCount, R0);
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
                
                if (cmp(mergeArea[maStart], array[rightStart]) <= 0) {
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
        };
    };

    // merge left with mergeArea and put to right from top to bottom
    var mergeHigh = exports.mergeHigh = function(array, cmp, left, right, mergeArea) {
        var L_END = array[left.startIndex + left.count - 1];
        var R_END;

        var rightStart = right.startIndex;
        var rightEnd = right.startIndex + right.count;

        var index = binarySearchFindFirst(array, cmp, rightStart, rightEnd, L_END);
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
            if (Math.abs(gallopCounter) > MIN_GALLOP) {
                // galloping mode
                
                // ----------------------------------------------
                // Part I: Search L_END in B then copy (L_END...B] and L_END
                // if B contains L_END we must include it
                
                L_END = array[leftLast];

                var index = gallopSearchFindFirst(
                    mergeArea, cmp, maLast+1-rightCount, maLast+1, L_END);

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
                    array, cmp, leftLast+1-leftCount, leftLast+1, R_END);
                
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
                if (cmp(mergeArea[maLast], array[leftLast]) >= 0) {
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
        };
    };

    // elements in left run are <= than element in right run
    var mergeRuns = exports.mergeRuns = function(array, cmp, left, right, mergeArea) {
        if (left.count < right.count) {
            return mergeLow(array, cmp, left, right, mergeArea);
        }
        else {
            return mergeHigh(array, cmp, left, right, mergeArea);
        }
    };

    var mergeCollapse = exports.mergeCollapse = function(array, cmp, stack, mergeArea) {
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
                    M = mergeRuns(array, cmp, A, B, mergeArea);
                    stack.push(M);
                    stack.push(C);
                }
                else {
                    M = mergeRuns(array, cmp, B, C, mergeArea);
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

                M = mergeRuns(array, cmp, B, C, mergeArea);
                stack.push(M);

                needsRepeat = true;
            }
        }
    }; 

    var DEFAULT_COMPARE = function(a, b) {
        if (a < b) {
            return -1;
        }
        else if (a === b) {
            return 0;
        }
        else {
            return 1;
        }
    };

    exports.timsort = function(array, cmp) {
        cmp = cmp || DEFAULT_COMPARE;

        var arrayLength = array.length;
        
        var DESIRED_MINRUN_SIZE = mergeComputeMinrun(arrayLength);
        
        var runsStack = [];
        var mergeArea = [];

        var startIndex = 0;
        while (startIndex < arrayLength) {
            var count = countRun(array, cmp, startIndex);

            // minruns should be in a0 <= a1 <= a2 ... order
            if (count < 0) {
                // must reverse minrun
                count = -count;
                reverse(array, startIndex, startIndex + count);
            }

            // expand minrun if necessary
            if (count < DESIRED_MINRUN_SIZE) {
                var tmp = expandMinrun(array, cmp, startIndex, startIndex + count, DESIRED_MINRUN_SIZE);
                count = tmp.endIndex - tmp.startIndex;
            }

            runsStack.push({ startIndex: startIndex, count: count });
            mergeCollapse(array, cmp, runsStack, mergeArea);

            startIndex += count;
        }

        // collapse stack
        while (runsStack.length > 1) {
            var C = runsStack.pop(),
                B = runsStack.pop();

            var M = mergeRuns(array, cmp, B, C, mergeArea);
            runsStack.push(M);
        }

        return array;
    };

}(window.timsort = {}));
