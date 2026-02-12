
const proj4 = require('proj4');

// Definitions for common Korean coordinate systems
// GRS80 Middle (EPSG:5186)
proj4.defs("EPSG:5186", "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=600000 +ellps=GRS80 +units=m +no_defs");

// Korea 1985 Modified Central Belt (EPSG:2097)
proj4.defs("EPSG:2097", "+proj=tmerc +lat_0=38 +lon_0=127 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43");

// Korea 1985 Central Belt (EPSG:5174)
proj4.defs("EPSG:5174", "+proj=tmerc +lat_0=38 +lon_0=127.0028902777778 +k=1 +x_0=200000 +y_0=500000 +ellps=bessel +units=m +no_defs +towgs84=-115.80,474.99,674.11,1.16,-2.31,-1.63,6.43,8.90,0");

// WGS84 (EPSG:4326) - built-in usually, but definitive just in case
proj4.defs("EPSG:4326", "+proj=longlat +datum=WGS84 +no_defs");

// Sample: New York Animal Hospital (Seoul Jongno-gu, Hyehwa-dong)
// Address: Seoul Jongno-gu Changgyeonggung-ro 35-gil 19
// Approx Lat/Lng: 37.585, 127.000
// X: 200079.663985257, Y: 453836.098562833

const x = 200079.663985257;
const y = 453836.098562833;

const systems = ["EPSG:5186", "EPSG:2097", "EPSG:5174"];

systems.forEach(sys => {
    try {
        const [lng, lat] = proj4(sys, "EPSG:4326", [x, y]);
        console.log(`${sys}: Lat ${lat}, Lng ${lng}`);
    } catch (e) {
        console.log(`${sys}: Error ${e.message}`);
    }
});
