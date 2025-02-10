
// Log-scale mode helpers

// TODO: all-negative numbers (sometimes wrong scaling)

import math from '../../stuff/math.js'

export default {

    candle(self, mid, p, $p) {
        return {
            x: mid,
            w: self.px_step * $p.config.CANDLEW,
            o: Math.floor(math.log(p[1]) * self.A + self.B),
            h: Math.floor(math.log(p[2]) * self.A + self.B),
            l: Math.floor(math.log(p[3]) * self.A + self.B),
            c: Math.floor(math.log(p[4]) * self.A + self.B),
            raw: p
        }
    },

    expand(self, height) {
        let hi = self.$_hi;
        let lo = self.$_lo;

        // Check if both high and low are negative
        if (hi < 0 && lo < 0) {
            // Apply log to absolute values and adjust scaling for negative domain
            let A = -height / (math.log(Math.abs(lo)) - math.log(Math.abs(hi)));
            let B = -math.log(Math.abs(hi)) * A;

            let top = -height * 0.1;
            let bot = height * 1.1;

            // Shift back to the negative domain using negative exponentiation
            self.$_hi = -math.exp((top - B) / A);
            self.$_lo = -math.exp((bot - B) / A);
        }
        // Handle mixed positive and negative or all positive cases
        else {
            // Expand log scale normally
            let A = -height / (math.log(hi) - math.log(lo));
            let B = -math.log(hi) * A;

            let top = -height * 0.1;
            let bot = height * 1.1;

            self.$_hi = math.exp((top - B) / A);
            self.$_lo = math.exp((bot - B) / A);
        }
    }

}
