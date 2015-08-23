
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
        
        });
    });
});
