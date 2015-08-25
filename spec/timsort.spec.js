
describe('timsort', function() {

    describe('countRun', function() {
        it('returns one when start index points to last array element', function() {
            expect(timsort.countRun([1,2,3], 2))
                .toBe(1);
        });

        it('returns number of elements in non decreasing run', function() {
            expect(timsort.countRun([5,8,1,2,3,3,4,5,2,1], 2))
                .toBe(6);
        });

        it('returns number of elements in decreasing run as negative number', 
           function() {
               expect(timsort.countRun([4,6,3,2,1,4,5], 2))
                .toBe(-3);
        });

        it('accepts startIndex equal zero', function() {
            expect(timsort.countRun([1,2,3,4,5,3], 0))
                .toBe(5);
        });

        it('allows run to end at array end', function() {
            expect(timsort.countRun([1,2,3,4,5], 2))
                .toBe(3);

            expect(timsort.countRun([5,4,3,2,1], 2))
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

            expect(timsort.binarySearch(array, 0, array.length, 3))
                .toBe(2);

            array = [1,2,3,3,3,4,5];

            expect(timsort.binarySearch(array, 0, array.length, 3))
                .toBe(4);

            expect(timsort.binarySearch(array, 0, array.length, 1))
                .toBe(0);

            expect(timsort.binarySearch(array, 0, array.length, 5))
                .toBe(6);

            expect(timsort.binarySearch(array, 0, array.length, 2))
                .toBe(1);

            expect(timsort.binarySearch(array, 0, array.length, 4))
                .toBe(5);
        });

        it('returns -index-1 where index is place where element should be inserted ' +
           'when element is not part of the array', function() {
        
            array = [1,2,3,4,5,6,7,8];

            expect(timsort.binarySearch(array, 0, array.length, 3.5))
                .toBe(-3-1);

            expect(timsort.binarySearch(array, 0, array.length, 0))
                .toBe(-0-1);

            expect(timsort.binarySearch(array, 0, array.length, 10))
                .toBe(-array.length-1);
        });

        it('allows to search subarray', function() {
            var array = [1,2,/**/3,4,5,6,7,/**/ 8];

            expect(timsort.binarySearch(array, 2, 7, 3))
                .toBe(2);

            expect(timsort.binarySearch(array, 2, 7, 7))
                .toBe(6);

            expect(timsort.binarySearch(array, 2, 7, 4))
                .toBe(3);

            expect(timsort.binarySearch(array, 2, 7, 2))
                .toBe(-2-1);

            expect(timsort.binarySearch(array, 2, 7, 10))
                .toBe(-7-1);

            expect(timsort.binarySearch(array, 2, 7, 4.3))
                .toBe(-4-1);
        });

        it('passes stress test', function() {
            expect(true).toBe(true); // fake expectation

            var sortedArray = testUtils.getRandomSortedArray(50000);

            for (var i = 0; i < 1000; i += 1) {
                var randomIndex = testUtils.getRandomIndex(sortedArray);
             
                var expectedIndex = array.indexOf(array[randomIndex]);

                var bsIndex = timsort.binarySearch(
                    array, 
                    0, 
                    sortedArray.length,
                    array[randomIndex]);

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

            expect(timsort.binarySearchFindFirst(array, 0, array.length, 3))
                .toBe(2);

            array = [1,2,3,3,3,4,5];

            expect(timsort.binarySearchFindFirst(array, 0, array.length, 3))
                .toBe(2);

            expect(timsort.binarySearchFindFirst(array, 0, array.length, 1))
                .toBe(0);

            expect(timsort.binarySearchFindFirst(array, 0, array.length, 5))
                .toBe(6);

            expect(timsort.binarySearchFindFirst(array, 0, array.length, 2))
                .toBe(1);

            expect(timsort.binarySearchFindFirst(array, 0, array.length, 4))
                .toBe(5);
        });

        it('returns -index-1 where index is place where element should be inserted ' +
           'when element is not part of the array', function() {
        
            array = [1,2,3,4,5,6,7,8];

            expect(timsort.binarySearchFindFirst(array, 0, array.length, 3.5))
                .toBe(-3-1);

            expect(timsort.binarySearchFindFirst(array, 0, array.length, 0))
                .toBe(-0-1);

            expect(timsort.binarySearchFindFirst(array, 0, array.length, 10))
                .toBe(-array.length-1);
        });

        it('allows to search subarray', function() {
            var array = [1,2,/**/3,4,5,6,7,/**/ 8];

            expect(timsort.binarySearchFindFirst(array, 2, 7, 3))
                .toBe(2);

            expect(timsort.binarySearchFindFirst(array, 2, 7, 7))
                .toBe(6);

            expect(timsort.binarySearchFindFirst(array, 2, 7, 4))
                .toBe(3);

            expect(timsort.binarySearchFindFirst(array, 2, 7, 2))
                .toBe(-2-1);

            expect(timsort.binarySearchFindFirst(array, 2, 7, 10))
                .toBe(-7-1);

            expect(timsort.binarySearchFindFirst(array, 2, 7, 4.3))
                .toBe(-4-1);
        });
  
        it('passes stress test', function() {
            expect(true).toBe(true); // fake expectation

            var sortedArray = testUtils.getRandomSortedArray(50000);

            for (var i = 0; i < 1000; i += 1) {
                var randomIndex = testUtils.getRandomIndex(sortedArray);
             
                var expectedIndex = array.lastIndexOf(array[randomIndex]);

                var bsIndex = timsort.binarySearch(
                    array, 
                    0, 
                    sortedArray.length,
                    array[randomIndex]);

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

            timsort.expandMinrun(array, 4, 9, 10);

            expect(array).toEqual([5,4,5,4, 1,1,1,2,3,3,3,4,5,7, 5,4,5,4]);
        });

        it('can expand minrun of size 1', function() {
            var array = [5,4,5,4, 101, 5,4,5,4];

            timsort.expandMinrun(array, 4, 5, 4);

            expect(array).toEqual([5,4,5,4, 4,5,5,101, 4]);
        });

        it('stops expansion at array end', function() {
            var array = [5,4,5,4, 1,2,3,4,7, 1,10,4];

            timsort.expandMinrun(array, 4, 9, 10);

            expect(array).toEqual([5,4,5,4, 1,1,2,3,4,4,7,10]);
        });

        it('can expand minrun with increasing values', function() {
            var array = [0,0, 1,2,3,4, 101,102,103,104, 0,0];

            timsort.expandMinrun(array, 2, 6, 8);

            expect(array).toEqual([0,0, 1,2,3,4,101,102,103,104, 0,0]);
        });

        it('can expand minrun with decreasing values', function() {
            var array = [0,0, 1,2,3,4,5, 5,4,3,2,1, 0,0];

            timsort.expandMinrun(array, 2, 7, 10);

            expect(array).toEqual([0,0, 1,1,2,2,3,3,4,4,5,5, 0,0]);
        });

        it('can expand minrun with interleaved values', function() {
            var array = [0,0, 1,2,3,4,5, 0.5,1.5,2.5,3.5,4.5,5.5, 0,0];

            timsort.expandMinrun(array, 2, 7, 11);

            expect(array).toEqual([0,0, 0.5,1,1.5,2,2.5,3,3.5,4,4.5,5,5.5, 0,0]);
        });
   });

});
