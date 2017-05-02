(function() {
    'use strict';
    class Test {
        constructor(x, y) {
            this._x = x;
            this._y = y;
        }

        sum() {
            return this._x + this._y;
        }

        x() {
            return this._x;
        }
    }

    let test1 = new Test(1, 2);
    console.log(test1.sum());
    console.log(test1.x());
})();

