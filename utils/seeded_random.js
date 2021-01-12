module.exports.RNG = function RNG(seed) {
    this.m = Math.pow(2, 31);
    this.a = 1103515245;
    this.c = 12345;

    this.state = seed ? seed : Math.floor(Math.random() * (this.m - 1));
}

this.RNG.prototype.next_int = function () {
    this.state = (this.a * this.state + this.c) % this.m;
    return this.state;
}

this.RNG.prototype.next_float = function () {
    return this.next_int() / (this.m - 1);
}

this.RNG.prototype.next_int_ranged = function (start, end) {
    var range = end - start;
    var random_under_1 = this.next_int() / this.m;
    return start + Math.floor(random_under_1 * range);
}

this.RNG.prototype.choice = function (array) {
    return array[this.next_int_ranged(0, array.length)];
}