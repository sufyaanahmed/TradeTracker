// backend/middleware/auth.js
const admin = require('firebase-admin');

module.exports = async function authenticate(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    console.error('No authorization header found');
    return res.status(401).send('Unauthorized: No token provided');
  }
  //console.log(authHeader);
  const token = authHeader.split(' ')[1];

  if (!token) {
    console.error('Invalid token format');
    return res.status(401).send('Unauthorized: Invalid token format');
  }

  //console.log('Token received:', token);

  try {
    const decodedToken = await admin.auth().verifyIdToken(token);
    //console.log('Decoded Token:', decodedToken);
    req.uid = decodedToken.uid;
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).send('Unauthorized: Invalid token 222');
  }
};
