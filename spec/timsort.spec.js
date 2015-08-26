
describe('timsort', function() {
    var CMP = testUtils.NUMERIC_COMPARE;

    describe('countRun', function() {
        it('returns one when start index points to last array element', function() {
            expect(timsort.countRun([1,2,3], CMP, 2))
                .toBe(1);
        });

        it('returns number of elements in non decreasing run', function() {
            expect(timsort.countRun([5,8,1,2,3,3,4,5,2,1], CMP, 2))
                .toBe(6);
        });

        it('returns number of elements in decreasing run as negative number', 
           function() {
               expect(timsort.countRun([4,6,3,2,1,4,5], CMP, 2))
                .toBe(-3);
        });

        it('accepts startIndex equal zero', function() {
            expect(timsort.countRun([1,2,3,4,5,3], CMP, 0))
                .toBe(5);
        });

        it('allows run to end at array end', function() {
            expect(timsort.countRun([1,2,3,4,5], CMP, 2))
                .toBe(3);

            expect(timsort.countRun([5,4,3,2,1], CMP, 2))
                .toBe(-3);
        });
    });

    describe('reverse', function() {
        it('reverses empty array', function() {
            var array = [1,2,3,4,5];
            var unchangedCopy = [].concat(array);

            timsort.reverse(array, 0, 0);
            expect(array).toEqual(unchangedCopy);

            timsort.reverse(array, 5, 5);
            expect(array).toEqual(unchangedCopy);

            timsort.reverse(array, 2, 2);
            expect(array).toEqual(unchangedCopy);
        });

        it('reverses one element array', function() {
            var array = [666];

            timsort.reverse(array, 0, 1);

            expect(array).toEqual([666]);
        });

        it('reverses two element array', function() {
            var array = [1,2,3,4,5,6];

            timsort.reverse(array, 2, 4);

            expect(array).toEqual([1,2,4,3,5,6]);
        });

        it('can reverse entire array', function() {
            var arrayOdd = [1,2,3,4,5];
            var arrayEven = [1,2,3,4];

            timsort.reverse(arrayOdd, 0, arrayOdd.length);
            timsort.reverse(arrayEven, 0, arrayEven.length);

            expect(arrayOdd).toEqual([5,4,3,2,1]);
            expect(arrayEven).toEqual([4,3,2,1]);
        });

        it('can reverse part of array', function() {
            var array = [1,2,3,4,5,6,7,8,9];

            timsort.reverse(array, 2, 6);

            expect(array).toEqual([1,2,6,5,4,3,7,8,9]);
        });
    });

    describe('mergeComputeMinrun', function() {
        it('returns array length for small array sizes', function() {
            expect(timsort.mergeComputeMinrun(11))
                .toBe(11);

            expect(timsort.mergeComputeMinrun(32))
                .toBe(32);

            expect(timsort.mergeComputeMinrun(63))
                .toBe(63);
        });

        it('returns number that divides array to number of chunks equal to or ' + 
           'slighty less than some power of 2', function() {

            expect(timsort.mergeComputeMinrun(1024))
                .toBe(32);

            expect(timsort.mergeComputeMinrun(Math.pow(2, 17)))
                .toBe(32);

            expect(timsort.mergeComputeMinrun(63*128))
                .toBe(63);

            expect(timsort.mergeComputeMinrun(1023))
                .toBe(64);

            expect(timsort.mergeComputeMinrun(84372))
                .toBe(42);
        });
    });

    describe('binarySearch - find last', function() {
        it('returns index of last element equal to searched element', function() {
            var array = [1,2,3,4,5,6,7];

            expect(timsort.binarySearch(array, CMP, 0, array.length, 3))
                .toBe(2);

            array = [1,2,3,3,3,4,5];

            expect(timsort.binarySearch(array, CMP, 0, array.length, 3))
                .toBe(4);

            expect(timsort.binarySearch(array, CMP, 0, array.length, 1))
                .toBe(0);

            expect(timsort.binarySearch(array, CMP, 0, array.length, 5))
                .toBe(6);

            expect(timsort.binarySearch(array, CMP, 0, array.length, 2))
                .toBe(1);

            expect(timsort.binarySearch(array, CMP, 0, array.length, 4))
                .toBe(5);
        });

        it('returns -index-1 where index is place where element should be inserted ' +
           'when element is not part of the array', function() {
        
            array = [1,2,3,4,5,6,7,8];

            expect(timsort.binarySearch(array, CMP, 0, array.length, 3.5))
                .toBe(-3-1);

            expect(timsort.binarySearch(array, CMP, 0, array.length, 0))
                .toBe(-0-1);

            expect(timsort.binarySearch(array, CMP, 0, array.length, 10))
                .toBe(-array.length-1);
        });

        it('allows to search subarray', function() {
            var array = [1,2,/**/3,4,5,6,7,/**/ 8];

            expect(timsort.binarySearch(array, CMP, 2, 7, 3))
                .toBe(2);

            expect(timsort.binarySearch(array, CMP, 2, 7, 7))
                .toBe(6);

            expect(timsort.binarySearch(array, CMP, 2, 7, 4))
                .toBe(3);

            expect(timsort.binarySearch(array, CMP, 2, 7, 2))
                .toBe(-2-1);

            expect(timsort.binarySearch(array, CMP, 2, 7, 10))
                .toBe(-7-1);

            expect(timsort.binarySearch(array, CMP, 2, 7, 4.3))
                .toBe(-4-1);
        });

        it('passes stress test', function() {
            expect(true).toBe(true); // fake expectation

            var sortedArray = testUtils.getRandomSortedArrayWithRepetitions(50000);

            for (var i = 0; i < 1000; i += 1) {
                var randomIndex = testUtils.getRandomIndex(sortedArray);
             
                var expectedIndex = sortedArray.lastIndexOf(sortedArray[randomIndex]);

                var bsIndex = timsort.binarySearch(
                    sortedArray, CMP,
                    0, 
                    sortedArray.length,
                    sortedArray[randomIndex]);

                if (bsIndex !== expectedIndex) {
                    expect(bsIndex).toBe(expectedIndex);
                    break;
                }
            }
        });
    });

    describe('binarySearch - find first', function() {
        it('returns index of last element equal to searched element', function() {
            var array = [1,2,3,4,5,6,7];

            expect(timsort.binarySearchFindFirst(array, CMP, 0, array.length, 3))
                .toBe(2);

            array = [1,2,3,3,3,4,5];

            expect(timsort.binarySearchFindFirst(array, CMP, 0, array.length, 3))
                .toBe(2);

            expect(timsort.binarySearchFindFirst(array, CMP, 0, array.length, 1))
                .toBe(0);

            expect(timsort.binarySearchFindFirst(array, CMP, 0, array.length, 5))
                .toBe(6);

            expect(timsort.binarySearchFindFirst(array, CMP, 0, array.length, 2))
                .toBe(1);

            expect(timsort.binarySearchFindFirst(array, CMP, 0, array.length, 4))
                .toBe(5);
        });

        it('returns -index-1 where index is place where element should be inserted ' +
           'when element is not part of the array', function() {
        
            array = [1,2,3,4,5,6,7,8];

            expect(timsort.binarySearchFindFirst(array, CMP, 0, array.length, 3.5))
                .toBe(-3-1);

            expect(timsort.binarySearchFindFirst(array, CMP, 0, array.length, 0))
                .toBe(-0-1);

            expect(timsort.binarySearchFindFirst(array, CMP, 0, array.length, 10))
                .toBe(-array.length-1);
        });

        it('allows to search subarray', function() {
            var array = [1,2,/**/3,4,5,6,7,/**/ 8];

            expect(timsort.binarySearchFindFirst(array, CMP, 2, 7, 3))
                .toBe(2);

            expect(timsort.binarySearchFindFirst(array, CMP, 2, 7, 7))
                .toBe(6);

            expect(timsort.binarySearchFindFirst(array, CMP, 2, 7, 4))
                .toBe(3);

            expect(timsort.binarySearchFindFirst(array, CMP, 2, 7, 2))
                .toBe(-2-1);

            expect(timsort.binarySearchFindFirst(array, CMP, 2, 7, 10))
                .toBe(-7-1);

            expect(timsort.binarySearchFindFirst(array, CMP, 2, 7, 4.3))
                .toBe(-4-1);
        });
  
        it('passes stress test', function() {
            expect(true).toBe(true); // fake expectation

            var sortedArray = testUtils.getRandomSortedArrayWithRepetitions(50000);

            for (var i = 0; i < 1000; i += 1) {
                var randomIndex = testUtils.getRandomIndex(sortedArray);
             
                var expectedIndex = sortedArray.indexOf(sortedArray[randomIndex]);

                var bsIndex = timsort.binarySearchFindFirst(
                    sortedArray, CMP,
                    0, 
                    sortedArray.length,
                    sortedArray[randomIndex]);

                if (bsIndex !== expectedIndex) {
                    expect(bsIndex).toBe(expectedIndex);
                    break;
                }
            }
        });
   });

   describe('expandMinrun', function() {
        it('can expand minrun to desired size', function() {
            var array = [5,4,5,4, 1,2,3,4,7, 1,1,3,5,3, 5,4,5,4];

            timsort.expandMinrun(array, CMP, 4, 9, 10);

            expect(array).toEqual([5,4,5,4, 1,1,1,2,3,3,3,4,5,7, 5,4,5,4]);
        });

        it('can expand minrun of size 1', function() {
            var array = [5,4,5,4, 101, 5,4,5,4];

            timsort.expandMinrun(array, CMP, 4, 5, 4);

            expect(array).toEqual([5,4,5,4, 4,5,5,101, 4]);
        });

        it('stops expansion at array end', function() {
            var array = [5,4,5,4, 1,2,3,4,7, 1,10,4];

            timsort.expandMinrun(array, CMP, 4, 9, 10);

            expect(array).toEqual([5,4,5,4, 1,1,2,3,4,4,7,10]);
        });

        it('can expand minrun with increasing values', function() {
            var array = [0,0, 1,2,3,4, 101,102,103,104, 0,0];

            timsort.expandMinrun(array, CMP, 2, 6, 8);

            expect(array).toEqual([0,0, 1,2,3,4,101,102,103,104, 0,0]);
        });

        it('can expand minrun with decreasing values', function() {
            var array = [0,0, 1,2,3,4,5, 5,4,3,2,1, 0,0];

            timsort.expandMinrun(array, CMP, 2, 7, 10);

            expect(array).toEqual([0,0, 1,1,2,2,3,3,4,4,5,5, 0,0]);
        });

        it('can expand minrun with interleaved values', function() {
            var array = [0,0, 1,2,3,4,5, 0.5,1.5,2.5,3.5,4.5,5.5, 0,0];

            timsort.expandMinrun(array, CMP, 2, 7, 11);

            expect(array).toEqual([0,0, 0.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5, 0,0]);
        });
   });

   describe('arrayCopy', function() {
        it('copies elements from one array to other', function() {
            var src = [0,0, 1,2,3,4,5, 0,0];
            var dest = [1,1,1,1,1,1,1,1];

            timsort.arrayCopy(src, 2, 7, dest, 1);

            expect(src).toEqual([0,0, 1,2,3,4,5, 0,0]);
            expect(dest).toEqual([1, 1,2,3,4,5, 1,1]);
        });
   });

   describe('gallopSearchFindLast', function() {
        var gallopLast = timsort.gallopSearchFindLast;

        it('returns index of last element equal to searched element', function() {
            var array = [1,2,3,4,5,6,7];

            expect(gallopLast(array, CMP, 0, array.length, 3))
                .toBe(2);

            array = [1,2,3,3,3,4,5];

            expect(gallopLast(array, CMP, 0, array.length, 3))
                .toBe(4);

            expect(gallopLast(array, CMP, 0, array.length, 1))
                .toBe(0);

            expect(gallopLast(array, CMP, 0, array.length, 5))
                .toBe(6);

            expect(gallopLast(array, CMP, 0, array.length, 2))
                .toBe(1);

            expect(gallopLast(array, CMP, 0, array.length, 4))
                .toBe(5);
        });

        it('returns -index-1 where index is place where element should be inserted ' +
           'when element is not part of the array', function() {
        
            array = [1,2,3,4,5,6,7,8];

            expect(gallopLast(array, CMP, 0, array.length, 3.5))
                .toBe(-3-1);

            expect(gallopLast(array, CMP, 0, array.length, 0))
                .toBe(-0-1);

            expect(gallopLast(array, CMP, 0, array.length, 10))
                .toBe(-array.length-1);
        });

        it('allows to search subarray', function() {
            var array = [1,2,/**/3,4,5,6,7,/**/ 8];

            expect(gallopLast(array, CMP, 2, 7, 3))
                .toBe(2);

            expect(gallopLast(array, CMP, 2, 7, 7))
                .toBe(6);

            expect(gallopLast(array, CMP, 2, 7, 4))
                .toBe(3);

            expect(gallopLast(array, CMP, 2, 7, 2))
                .toBe(-2-1);

            expect(gallopLast(array, CMP, 2, 7, 10))
                .toBe(-7-1);

            expect(gallopLast(array, CMP, 2, 7, 4.3))
                .toBe(-4-1);
        });

        it('passes stress test', function() {
            expect(true).toBe(true); // fake expectation

            var sortedArray = testUtils.getRandomSortedArrayWithRepetitions(50000);

            for (var i = 0; i < 1000; i += 1) {
                var randomIndex = testUtils.getRandomIndex(sortedArray);
             
                var expectedIndex = sortedArray.lastIndexOf(sortedArray[randomIndex]);

                var bsIndex = gallopLast(
                    sortedArray, CMP,
                    0, 
                    sortedArray.length,
                    sortedArray[randomIndex]);

                if (bsIndex !== expectedIndex) {
                    expect(bsIndex).toBe(expectedIndex);
                    break;
                }
            }
        });
    });

    describe('gallopSearchFindFirst', function() {
        var gallopFirst = timsort.gallopSearchFindFirst;

        it('returns index of last element equal to searched element', function() {
            var array = [1,2,3,4,5,6,7];

            expect(gallopFirst(array, CMP, 0, array.length, 3))
                .toBe(2);

            array = [1,2,3,3,3,4,5];

            expect(gallopFirst(array, CMP, 0, array.length, 3))
                .toBe(2);

            expect(gallopFirst(array, CMP, 0, array.length, 1))
                .toBe(0);

            expect(gallopFirst(array, CMP, 0, array.length, 5))
                .toBe(6);

            expect(gallopFirst(array, CMP, 0, array.length, 2))
                .toBe(1);

            expect(gallopFirst(array, CMP, 0, array.length, 4))
                .toBe(5);
        });

        it('returns -index-1 where index is place where element should be inserted ' +
           'when element is not part of the array', function() {
        
            array = [1,2,3,4,5,6,7,8];

            expect(gallopFirst(array, CMP, 0, array.length, 3.5))
                .toBe(-3-1);

            expect(gallopFirst(array, CMP, 0, array.length, 0))
                .toBe(-0-1);

            expect(gallopFirst(array, CMP, 0, array.length, 10))
                .toBe(-array.length-1);
        });

        it('allows to search subarray', function() {
            var array = [1,2,/**/3,4,5,6,7,/**/ 8];

            expect(gallopFirst(array, CMP, 2, 7, 3))
                .toBe(2);

            expect(gallopFirst(array, CMP, 2, 7, 7))
                .toBe(6);

            expect(gallopFirst(array, CMP, 2, 7, 4))
                .toBe(3);

            expect(gallopFirst(array, CMP, 2, 7, 2))
                .toBe(-2-1);

            expect(gallopFirst(array, CMP, 2, 7, 10))
                .toBe(-7-1);

            expect(gallopFirst(array, CMP, 2, 7, 4.3))
                .toBe(-4-1);
        });
  
        it('passes stress test', function() {
            expect(true).toBe(true); // fake expectation

            var sortedArray = testUtils.getRandomSortedArrayWithRepetitions(50000);

            for (var i = 0; i < 1000; i += 1) {
                var randomIndex = testUtils.getRandomIndex(sortedArray);
             
                var expectedIndex = sortedArray.indexOf(sortedArray[randomIndex]);

                var bsIndex = gallopFirst(
                    sortedArray, CMP,
                    0, 
                    sortedArray.length,
                    sortedArray[randomIndex]);

                if (bsIndex !== expectedIndex) {
                    expect(bsIndex).toBe(expectedIndex);
                    break;
                }
            }
        });
   });

    describe('mergeLow', function() {
        it('merges two neighbour runs', function() {
            var array = [0,0, 1,20,30, 15,24,26,37, 0,0];
            var mergeArea = [];

            timsort.mergeLow(
                array, CMP,
                { startIndex:2, count:3 },
                { startIndex:5, count:4 },
                mergeArea);

            expect(array).toEqual([0,0, 1,15,20,24,26,30,37, 0,0]);
        });

        it('can merge long run with short run', function() {
            var array = [0, 1,2,3,4,5,6,7, -1,11, 0];
            var mergeArea = [];

            timsort.mergeLow(
                array, CMP,
                { startIndex:1, count:7 },
                { startIndex:8, count:2 },
                mergeArea);

            expect(array).toEqual([0, -1,1,2,3,4,5,6,7,11, 0]);
        });

        it('can merge short run with long run', function() {
            var array = [0, -11, 0,10,20,30,40,50, 0];
            var mergeArea = [];

            timsort.mergeLow(
                array, CMP,
                { startIndex:1, count:1 },
                { startIndex:2, count:6 },
                mergeArea);

            expect(array).toEqual([0, -11,0,10,20,30,40,50, 0]);
        });

        it('passes stress test', function() {
            var first = testUtils.getRandomSortedArrayWithRepetitions(1000);
            var second = testUtils.getRandomSortedArrayWithRepetitions(1234);

            var array = first.concat(second);
            var mergeArea = [];

            timsort.mergeLow(
                array, CMP,
                { startIndex:0, count:first.length },
                { startIndex:first.length, count:second.length },
                mergeArea);

            testUtils.assertArrayIsSorted(array);
        });
    });
    
    describe('mergeHigh', function() {
        it('merges two neighbour runs', function() {
            var array = [0,0, 1,20,30, 15,24,26,37, 0,0];
            var mergeArea = [];

            timsort.mergeHigh(
                array, CMP,
                { startIndex:2, count:3 },
                { startIndex:5, count:4 },
                mergeArea);

            expect(array).toEqual([0,0, 1,15,20,24,26,30,37, 0,0]);
        });

        it('can merge long run with short run', function() {
            var array = [0, 1,2,3,4,5,6,7, -1,11, 0];
            var mergeArea = [];

            timsort.mergeHigh(
                array, CMP,
                { startIndex:1, count:7 },
                { startIndex:8, count:2 },
                mergeArea);

            expect(array).toEqual([0, -1,1,2,3,4,5,6,7,11, 0]);
        });

        it('can merge short run with long run', function() {
            var array = [0, -11, 0,10,20,30,40,50, 0];
            var mergeArea = [];

            timsort.mergeHigh(
                array, CMP,
                { startIndex:1, count:1 },
                { startIndex:2, count:6 },
                mergeArea);

            expect(array).toEqual([0, -11,0,10,20,30,40,50, 0]);
        });

        it('passes stress test', function() {
            var first = testUtils.getRandomSortedArrayWithRepetitions(1000);
            var second = testUtils.getRandomSortedArrayWithRepetitions(1234);

            var array = first.concat(second);
            var mergeArea = [];

            timsort.mergeHigh(
                array, CMP,
                { startIndex:0, count:first.length },
                { startIndex:first.length, count:second.length },
                mergeArea);

            testUtils.assertArrayIsSorted(array);
        });
    });

    describe('TIMSORT', function() {
        var tsort = timsort.timsort;

        it('can sort empty array', function() {
            var a = [];

            tsort(a);

            expect(a).toEqual([]);
        });

        it('can sort single element array', function() {
            var a = [666];

            tsort(a);

            expect(a).toEqual([666]);
        });

        it('can sort two element array', function() {
            expect(tsort([1,2])).toEqual([1,2]);
            expect(tsort([2,1])).toEqual([1,2]);
            expect(tsort([1,1])).toEqual([1,1]);
        });

        it('can sort already sorted array', function() {
            var array = testUtils.getRandomSortedArray(100);

            expect(tsort([].concat(array)))
                .toEqual(array);
        });

        it('can sort array sorted in reverse order', function() {
            var array = testUtils.getRandomSortedArray(100);
            
            var inversed = [].concat(array);
            timsort.reverse(inversed, 0, inversed.length);

            expect(tsort(inversed)).toEqual(array);
        });

        it('can sort arrays of various sizes', function() {
            for (var i = 100; i < 1234; i += 1) {
                var array = testUtils.getRandomArray(i);

                var sortedArray = [].concat(array);
                sortedArray.sort(testUtils.NUMERIC_COMPARE);

                expect(tsort(array)).toEqual(sortedArray);
            }
        });

        it('can sort big arrays', function() {
            var bigArray = testUtils.getRandomArray(1000000);

            var sortedBigArray = [].concat(bigArray);
            sortedBigArray.sort(testUtils.NUMERIC_COMPARE);

            expect(tsort(bigArray)).toEqual(sortedBigArray);
        });

        it('can accept custom compare function', function() {
            var array = testUtils.getRandomArray(10000)
                .map(function(element) {
                    return { value: element };
                });

            var sortedArray = [].concat(array);
            sortedArray.sort(function(l,r) {
                return (l.value - r.value);
            });

            expect(tsort(array, function(l,r) { return (l.value - r.value); }))
                .toEqual(sortedArray);
        });

        it('performs stable sort', function() {
            //for (var i = 0; i < 100; i += 1) {
             var array = testUtils.getRandomSortedArrayWithRepetitions(50)
                .map(function(element, index) {
                    return { value: element, index: index };
                });

            var sortedArray = [].concat(array);
            sortedArray.sort(function(l,r) {
                var result = (l.value - r.value);

                // force stable sort - js sort doesn't necessary perform stable sorting
                if (result !== 0) {
                    return result;
                }
                else {
                    return (l.index - r.index);
                }
            });

            expect(tsort(array, function(l,r) { return (l.value - r.value); }))
                .toEqual(sortedArray);
            //}
        });
    });
});
