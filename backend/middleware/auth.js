// backend/middleware/auth.js
const jwt = require('jsonwebtoken');

// --- REMOVE ALL dotenv.config() and top-level JWT_SECRET definition from here ---
// const path = require('path'); // Remove this line
// require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') }); // Remove this line

// const JWT_SECRET = process.env.JWT_SECRET; // REMOVE THIS LINE
// --------------------------------------------------------------------------------

// Remove the conditional log from the top-level as well, as it's misleading due to timing
// if (!JWT_SECRET) { /* ... */ } else { /* ... */ }

function authenticateToken(req, res, next) {
    // Define JWT_SECRET *inside* the function.
    // By the time this function executes (when a request hits the route),
    // process.env.JWT_SECRET will definitely be loaded by index.js.
    const JWT_SECRET = process.env.JWT_SECRET;

    // --- Add a more critical check here for direct visibility during request execution ---
    if (!JWT_SECRET) {
        console.error('CRITICAL ERROR: JWT_SECRET is undefined when authenticateToken is called! This indicates a server configuration problem.');
        return res.status(500).json({ message: 'Server configuration error: JWT secret is missing.' });
    }
    // console.log('authMiddleware: JWT_SECRET used for verification (inside function):', JWT_SECRET); // Optional debug for the actual value

    console.log('\n--- Incoming Protected Request ---');
    console.log('Request URL:', req.originalUrl);
    
    const authHeader = req.headers['authorization'];
    console.log('Authorization Header:', authHeader); // Log the full header
    
    const token = authHeader && authHeader.split(' ')[1];

    if (token == null) {
        console.log('Auth Failed: No token provided (401)');
        return res.status(401).json({ message: 'Authentication token required' });
    }

    console.log('Token received:', token.substring(0, 30) + '...'); // Log first 30 chars of token
    
    jwt.verify(token, JWT_SECRET, (err, user) => {
        if (err) {
            // This is the error if the token is invalid/expired with the CORRECT secret
            console.error('JWT verification error:', err.message);
            console.error('Token used for verification:', token.substring(0, 30) + '...');
            console.error('JWT_SECRET used for verification:', JWT_SECRET); // This should now show the actual value!
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        
        req.user = user; 
        console.log('Auth Success: Token valid for user:', user.id, user.username);
        next(); // Proceed to the next middleware or route handler
    });
    console.log('--- End Protected Request ---');
}

module.exports = authenticateToken;