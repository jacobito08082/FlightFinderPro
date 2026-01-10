require('dotenv').config();
const express = require('express');
const Amadeus = require('amadeus');
const cors = require('cors');

const app = express();
app.use(cors());

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID || 'WhePlAFFUDz7oCPbyfKqMRtBJ5QHrQm6',
  clientSecret: process.env.AMADEUS_CLIENT_SECRET || 'SNt05IbIGt00R1yf'
});

app.get('/autocomplete', async (req, res) => {
    try {
        const response = await amadeus.referenceData.locations.get({
            keyword: req.query.keyword,
            subType: 'AIRPORT,CITY'
        });
        res.json(response.data);
    } catch (err) { res.status(500).json([]); }
});

app.get('/search-flights', async (req, res) => {
    const { origin, destination, date, currency, travelClass, adults, children } = req.query;
    try {
        const response = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDate: date,
            adults: adults || '1',
            children: children || '0',
            currencyCode: currency || 'USD',
            travelClass: travelClass || 'ECONOMY',
            max: 40 
        });
        // CRITICAL FIX: Ensure full dictionaries are sent
        res.json({
            data: response.data || [],
            dictionaries: response.dictionaries || { carriers: {}, aircraft: {} }
        });
    } catch (error) {
        console.error("Amadeus API Error:", error.response?.data);
        res.status(500).json({ error: "Search failed." });
    }
});

app.listen(3000, () => console.log(`✅ FlightFinder Backend LIVE on http://localhost:3000`));