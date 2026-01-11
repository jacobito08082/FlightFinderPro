require('dotenv').config();
const express = require('express');
const Amadeus = require('amadeus');
const cors = require('cors');

const app = express();

// THE MASTER FIX: This tells your backend to talk to EVERYONE (Vercel, Phone, Laptop)
app.use(cors({
    origin: '*',
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
    } catch (err) { res.status(500).json([]); }
});

app.get('/search-flights', async (req, res) => {
    try {
        const response = await amadeus.shopping.flightOffersSearch.get({
            originLocationCode: req.query.origin,
            destinationLocationCode: req.query.destination,
            departureDate: req.query.date,
            adults: req.query.adults || '1',
            currencyCode: req.query.currency || 'USD'
        });
        res.json({ data: response.data, dictionaries: response.dictionaries });
    } catch (err) { res.status(500).json({ error: "Search failed" }); }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`✅ Backend LIVE on port ${PORT}`));