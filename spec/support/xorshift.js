// Xorshiftのリファレンス実装
// Copyright (c) 2014 Andreas Madsen & Emil Bay
// https://github.com/AndreasMadsen/xorshift
// https://github.com/AndreasMadsen/xorshift/blob/master/LICENSE.md

/**
 * Create a pseudorandom number generator, with a seed.
 * @param {array} seed "128-bit" integer, composed of 4x32-bit
 * integers in big endian order.
 */
function XorShift(seed) {
	// Note the extension, this === module.exports is required because
	// the `constructor` function will be used to generate new instances.
	// In that case `this` will point to the default RNG, and `this` will
	// be an instance of XorShift.
	if (!(this instanceof XorShift) || this === module.exports) {
		return new XorShift(seed);
	}
	
	if (!Array.isArray(seed) || seed.length !== 4) {
		throw new TypeError('seed must be an array with 4 numbers');
	}

	// uint64_t s = [seed ...]
	this._state0U = seed[0] | 0;
	this._state0L = seed[1] | 0;
	this._state1U = seed[2] | 0;
	this._state1L = seed[3] | 0;
}

/**
 * Returns a 64bit random number as a 2x32bit array
 * @return {array}
 */
XorShift.prototype.randomint = function() {
	// uint64_t s1 = s[0]
	var s1U = this._state0U, s1L = this._state0L;
	// uint64_t s0 = s[1]
	var s0U = this._state1U, s0L = this._state1L;

	// s[0] = s0
	this._state0U = s0U;
	this._state0L = s0L;

	// - t1 = [0, 0]
	var t1U = 0, t1L = 0;
	// - t2 = [0, 0]
	var t2U = 0, t2L = 0;

	// s1 ^= s1 << 23;
	// :: t1 = s1 << 23
	var a1 = 23;
	var m1 = 0xFFFFFFFF << (32 - a1);
	t1U = (s1U << a1) | ((s1L & m1) >>> (32 - a1));
	t1L = s1L << a1;
	// :: s1 = s1 ^ t1
	s1U = s1U ^ t1U;
	s1L = s1L ^ t1L;

	// t1 = ( s1 ^ s0 ^ ( s1 >> 17 ) ^ ( s0 >> 26 ) )
	// :: t1 = s1 ^ s0
	t1U = s1U ^ s0U;
	t1L = s1L ^ s0L;
	// :: t2 = s1 >> 17
	var a2 = 17;
	var m2 = 0xFFFFFFFF >>> (32 - a2);
	t2U = s1U >>> a2;
	t2L = (s1L >>> a2) | ((s1U & m2) << (32 - a2));
	// :: t1 = t1 ^ t2
	t1U = t1U ^ t2U;
	t1L = t1L ^ t2L;
	// :: t2 = s0 >> 26
	var a3 = 26;
	var m3 = 0xFFFFFFFF >>> (32 - a3);
	t2U = s0U >>> a3;
	t2L = (s0L >>> a3) | ((s0U & m3) << (32 - a3));
	// :: t1 = t1 ^ t2
	t1U = t1U ^ t2U;
	t1L = t1L ^ t2L;

	// s[1] = t1
	this._state1U = t1U;
	this._state1L = t1L;

	// return t1 + s0
	// :: t2 = t1 + s0
	var sumL = (t1L >>> 0) + (s0L >>> 0);
	t2U = (t1U + s0U + (sumL / 2 >>> 31)) >>> 0;
	t2L = sumL >>> 0;

	// :: ret t2
	return [t2U, t2L];
};

/**
 * Returns a random number normalized [0, 1), just like Math.random()
 * @return {number}
 */
var CONVERTION_BUFFER = new Buffer(8);
XorShift.prototype.random = function() {
	var t2 = this.randomint();

	// :: ret t2 / 2**64
	return (t2[0] * 4294967296 + t2[1]) / 18446744073709551616;
};

// There is nothing particularly scientific about this seed, it is just
// based on the clock.
module.exports = new XorShift([
	0, Date.now() / 65536,
	0, Date.now() % 65536
]);

// Perform 20 iterations in the RNG, this prevens a short seed from generating
// pseudo predictable number.
(function () {
	var rng = module.exports;
	for (var i = 0; i < 20; i++) {
		rng.randomint();
	}
})();

