require('dotenv').config();
const express = require('express');
const Amadeus = require('amadeus');
// Add this to the top of server.js
const cors = require('cors');

// This allows both your local testing and your live Vercel site
app.use(cors({
    origin: [
        'https://flight-finder-pro-seven.vercel.app', 
        'http://localhost:3000'
    ],
    methods: ['GET', 'POST'],
    credentials: true
}));

const amadeus = new Amadeus({
  clientId: process.env.AMADEUS_CLIENT_ID,
  clientSecret: process.env.AMADEUS_CLIENT_SECRET
});

app.get('/autocomplete', async (req, res) => {
    try {
        const response = await amadeus.referenceData.locations.get({
            keyword: req.query.keyword,
            subType: 'AIRPORT,CITY'
        });
        res.json(response.data);
    } catch (err) { 
        console.error("Autocomplete Error:", err.response?.data || err.message);
        res.status(500).json([]); 
    }
});

app.get('/search-flights', async (req, res) => {
    const { origin, destination, date, currency, adults, children } = req.query;
    try {
        const response = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: origin,
            destinationLocationCode: destination,
            departureDate: date,
            adults: adults || '1',
            children: children || '0',
            currencyCode: currency || 'USD',
            max: 20 
        });
        res.json({
            data: response.data || [],
            dictionaries: response.dictionaries || { carriers: {}, aircraft: {} }
        });
    } catch (error) {
        res.status(500).json({ error: "Search failed." });
    }
});

// Render uses dynamic ports; this fix is required for deployment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend LIVE on port ${PORT}`));