const express = require("express");

const {
  searchPlaces,
  savePlaceToTrip,
  getTripPlaces,
  deleteTripPlace,
} = require("../controllers/placeController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Places
 *   description: Google Places search and saved trip places
 */


/**
 * @swagger
 * /api/places/search:
 *   get:
 *     summary: Search nearby places using Google Places API
 *     tags:
 *       - Places
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: lat
 *         required: true
 *         schema:
 *           type: number
 *         example: 41.9028
 *       - in: query
 *         name: lng
 *         required: true
 *         schema:
 *           type: number
 *         example: 12.4964
 *       - in: query
 *         name: type
 *         required: true
 *         schema:
 *           type: string
 *         example: restaurant
 *       - in: query
 *         name: radius
 *         required: false
 *         schema:
 *           type: number
 *           default: 3000
 *     responses:
 *       200:
 *         description: Google Places results returned successfully
 *       400:
 *         description: Invalid search parameters
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Google Places search failed
 */
router.get(
  "/places/search",
  protect,
  searchPlaces
);


/**
 * @swagger
 * /api/trips/{tripId}/places:
 *   post:
 *     summary: Save a Google Place to a trip
 *     tags:
 *       - Places
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - googlePlaceId
 *               - name
 *               - latitude
 *               - longitude
 *             properties:
 *               googlePlaceId:
 *                 type: string
 *                 example: ChIJVTkQgThgLxMRWM0saoiZzkA
 *               name:
 *                 type: string
 *                 example: Tonnarello
 *               category:
 *                 type: string
 *                 example: restaurant
 *               address:
 *                 type: string
 *                 example: Rome, Italy
 *               rating:
 *                 type: number
 *                 example: 4.7
 *               latitude:
 *                 type: number
 *                 example: 41.889804
 *               longitude:
 *                 type: number
 *                 example: 12.4693004
 *     responses:
 *       201:
 *         description: Place saved successfully
 *       400:
 *         description: Invalid data or trip ID
 *       403:
 *         description: User is not authorised
 *       404:
 *         description: Trip not found
 *       409:
 *         description: Place already saved
 */
router.post(
  "/trips/:tripId/places",
  protect,
  savePlaceToTrip
);


/**
 * @swagger
 * /api/trips/{tripId}/places:
 *   get:
 *     summary: Get all saved places for a trip
 *     tags:
 *       - Places
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Saved places returned successfully
 *       400:
 *         description: Invalid trip ID
 *       403:
 *         description: User is not authorised
 *       404:
 *         description: Trip not found
 */
router.get(
  "/trips/:tripId/places",
  protect,
  getTripPlaces
);


/**
 * @swagger
 * /api/trips/{tripId}/places/{placeId}:
 *   delete:
 *     summary: Delete a saved place from a trip
 *     tags:
 *       - Places
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: tripId
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: placeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Place removed successfully
 *       400:
 *         description: Invalid trip or place ID
 *       403:
 *         description: User is not authorised
 *       404:
 *         description: Trip or place not found
 */
router.delete(
  "/trips/:tripId/places/:placeId",
  protect,
  deleteTripPlace
);


module.exports = router;