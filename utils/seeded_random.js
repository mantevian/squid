module.exports.RNG = function RNG(seed) {
    this.m = Math.pow(2, 31);
    this.a = 1103515245;
    this.c = 12345;

    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));

    this.next_int = function () {
        this.state = (this.a * this.state + this.c) % this.m;
        return this.state;
    }
    
    this.next_float = function () {
        return this.next_int() / (this.m - 1);
    }
    
    this.next_int_ranged = function (start, end) {
        var range = end - start + 1;
        var random_under_1 = this.next_int() / this.m;
        return start + Math.floor(random_under_1 * range);
    }

    this.next_float_ranged = function (start, end) {
        var range = end - start;
        return start + (this.next_float() * range);
    }
    
    this.choice = function (array) {
        return array[this.next_int_ranged(0, array.length - 1)];
    }

    this.next_sign = function() {
        var result = this.next_int_ranged(0, 2);
        if (result == 0)
            result = -1;

        return result;
    }
}