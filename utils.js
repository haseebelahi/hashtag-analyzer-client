'use strict';

((global) => {

	const colors = ['rgb(255, 99, 132)', 'rgb(54, 162, 235)', 'rgb(255, 206, 86)', 'rgb(75, 192, 192)', 'rgb(153, 102, 255)', 'rgb(255, 159, 64)', 'rgb(235, 98, 134)', 'rgb(54, 162, 235)', 'rgb(255, 206, 86)', 'rgb(75, 192, 192)', 'rgb(153, 102, 255)', 'rgb(255, 159, 64)'];

    const colorsLight = ['rgba(255, 99, 132, 0.8)', 'rgba(54, 162, 235, 0.8)', 'rgba(255, 206, 86, 0.8)', 'rgba(75, 192, 192, 0.8)', 'rgba(153, 102, 255, 0.8)', 'rgba(255, 159, 64, 0.8)'];

	class Utils {
		
		constructor(isDarkModeOn=false) {
			this.isDarkModeOn = isDarkModeOn;
		}
		random_rgb() {
			var o = Math.round, r = Math.random, s = 255;
			// return 'rgb(' + o(r()*s) + ',' + o(r()*s) + ',' + o(r()*s) + ')';
			return [o(r()*s), o(r()*s), o(r()*s)];
		}
		randomColor() {
			const whiteRGB = [255, 255, 255];
			const blackRBG = [0, 0, 0];
			let compareToRGB;
			if(this.isDarkModeOn) {
				compareToRGB = blackRBG;
			} else {
				compareToRGB = whiteRGB;
			}
			let randomRGB = this.random_rgb();
			while(this.contrast(compareToRGB, randomRGB) < 3) {
				randomRGB = this.random_rgb();
			}
			return `rgba(${randomRGB[0]}, ${randomRGB[1]}, ${randomRGB[2]}, 0.8)`;
		}

		luminanace(r, g, b) {
			const a = [r, g, b].map(function (v) {
				v /= 255;
				return v <= 0.03928
					? v / 12.92
					: Math.pow( (v + 0.055) / 1.055, 2.4 );
			});
			return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
		}
		contrast(rgb1, rgb2) {
			const luminanace1 = this.luminanace(rgb1[0], rgb1[1], rgb1[2]) + 0.05;
			const luminanace2 = this.luminanace(rgb2[0], rgb2[1], rgb2[2]) + 0.05;
			return luminanace1 > luminanace2 ? luminanace1/luminanace2 : luminanace2/luminanace1;
		}

		getColorPair() {
			// let constrastRatio = 0;
			// let color1 = [];
			// let color2 = [];
			// while(constrastRatio < 3.5) {
			// 	color1 = this.random_rgb();
			// 	color2 = this.random_rgb();
			// 	constrastRatio = this.contrast(color1, color2);
			// }
			// return [`rgba(${color1[0]}, ${color1[1]}, ${color1[2]}, 0.9)`, `rgb(${color2[0]}, ${color2[1]}, ${color2[2]}, 0.9)`];
			return [colors[5], colors[3]];
		}

		getColors(size) {
			const newColors = [];
			for (let i = 0; i < size; i++){
				newColors.push(this.randomColor());
			}
			return newColors;
		}
		
		numberWithCommas(x) {
			return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
		}

	}
	// Expose the library as an AMD module
	if (typeof define === 'function' && define.amd) {
		global.Utils = Utils;
		define('utils', [], function() { return Utils; });
	} else if (typeof module !== 'undefined' && module.exports) {
		module.exports = Utils;
	} else {
		global.Utils = Utils;
	}
	  
})(this);
