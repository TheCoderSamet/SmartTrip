const express = require("express");

const {
  createRoute,
  getTripRoutes,
  getRouteById,
  calculateRoute,
  calculateRouteAsync,
} = require("../controllers/routeController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Routes
 *   description: Travel route creation and calculation
 */


/**
 * @swagger
 * /api/trips/{tripId}/routes:
 *   post:
 *     summary: Create a new route using saved places
 *     tags:
 *       - Routes
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
 *               - name
 *               - placeIds
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rome Food Route
 *               placeIds:
 *                 type: array
 *                 minItems: 2
 *                 items:
 *                   type: string
 *               routeType:
 *                 type: string
 *                 enum:
 *                   - walking
 *                   - driving
 *                   - bicycling
 *                 example: walking
 *     responses:
 *       201:
 *         description: Route created successfully
 *       400:
 *         description: Invalid route data
 *       403:
 *         description: User is not authorised
 *       404:
 *         description: Trip not found
 */
router.post(
  "/trips/:tripId/routes",
  protect,
  createRoute
);


/**
 * @swagger
 * /api/trips/{tripId}/routes:
 *   get:
 *     summary: Get all routes for a trip
 *     tags:
 *       - Routes
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
 *         description: Routes returned successfully
 *       400:
 *         description: Invalid trip ID
 *       403:
 *         description: User is not authorised
 *       404:
 *         description: Trip not found
 */
router.get(
  "/trips/:tripId/routes",
  protect,
  getTripRoutes
);


/**
 * @swagger
 * /api/routes/{routeId}:
 *   get:
 *     summary: Get a route by ID
 *     tags:
 *       - Routes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Route returned successfully
 *       400:
 *         description: Invalid route ID
 *       403:
 *         description: User is not authorised
 *       404:
 *         description: Route not found
 */
router.get(
  "/routes/:routeId",
  protect,
  getRouteById
);


/**
 * @swagger
 * /api/routes/{routeId}/calculate:
 *   post:
 *     summary: Calculate a route synchronously with Google Routes API
 *     tags:
 *       - Routes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Route calculated successfully
 *       400:
 *         description: Invalid route or insufficient places
 *       403:
 *         description: User is not authorised
 *       404:
 *         description: Route not found
 *       500:
 *         description: Route calculation failed
 */
router.post(
  "/routes/:routeId/calculate",
  protect,
  calculateRoute
);


/**
 * @swagger
 * /api/routes/{routeId}/calculate-async:
 *   post:
 *     summary: Queue a route calculation asynchronously with RabbitMQ
 *     tags:
 *       - Routes
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: routeId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       202:
 *         description: Route calculation accepted and queued
 *       400:
 *         description: Invalid route ID
 *       403:
 *         description: User is not authorised
 *       404:
 *         description: Route not found
 *       500:
 *         description: Failed to queue route calculation
 */
router.post(
  "/routes/:routeId/calculate-async",
  protect,
  calculateRouteAsync
);


module.exports = router;