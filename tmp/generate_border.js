
const turf = require('@turf/turf');
const fs = require('fs');

const BARANGAY_CENTERS = [
    { name: "Amanoaoac", lat: 16.0177, lng: 120.4461 },
    { name: "Apaya", lat: 16.0242, lng: 120.4459 },
    { name: "Aserda", lat: 16.0230, lng: 120.4624 },
    { name: "Baloling", lat: 16.0378, lng: 120.4565 },
    { name: "Coral", lat: 16.0311, lng: 120.4518 },
    { name: "Golden", lat: 16.0223, lng: 120.4419 },
    { name: "Jimenez", lat: 16.0099, lng: 120.4653 },
    { name: "Lambayan", lat: 16.0005, lng: 120.4699 },
    { name: "Luyan", lat: 16.0128, lng: 120.4742 },
    { name: "Nilombot", lat: 16.0288, lng: 120.4366 },
    { name: "Pias", lat: 16.0363, lng: 120.4463 },
    { name: "Poblacion", lat: 16.0262, lng: 120.4520 },
    { name: "Primicias", lat: 15.9963, lng: 120.4799 },
    { name: "Santa Maria", lat: 16.0285, lng: 120.4680 },
    { name: "Torres", lat: 16.0151, lng: 120.4661 }
];

const points = turf.featureCollection(
    BARANGAY_CENTERS.map(c => turf.point([c.lng, c.lat]))
);

// Create a concave hull to get the organic shape
const hull = turf.convex(points);
// Expand it slightly to cover the area
const buffered = turf.buffer(hull, 1, { units: 'kilometers' });

fs.writeFileSync('public/mapandan-border.json', JSON.stringify(buffered, null, 2));
console.log('Border generated accurately!');
