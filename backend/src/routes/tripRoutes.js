const express = require("express");

const {
  createTrip,
  getGroupTrips,
  getTripById,
  updateTrip,
  deleteTrip,
} = require("../controllers/tripController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Trips
 *   description: Travel trip management
 */


/**
 * @swagger
 * /api/groups/{groupId}/trips:
 *   post:
 *     summary: Create a trip for a group
 *     tags:
 *       - Trips
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Group ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *               - country
 *               - city
 *               - startDate
 *               - endDate
 *             properties:
 *               name:
 *                 type: string
 *                 example: Rome Holiday
 *               country:
 *                 type: string
 *                 example: Italy
 *               city:
 *                 type: string
 *                 example: Rome
 *               startDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-09-10"
 *               endDate:
 *                 type: string
 *                 format: date
 *                 example: "2026-09-15"
 *     responses:
 *       201:
 *         description: Trip created successfully
 *       400:
 *         description: Invalid request or dates
 *       403:
 *         description: User is not a group member
 *       404:
 *         description: Group not found
 */
router.post(
  "/groups/:groupId/trips",
  protect,
  createTrip
);


/**
 * @swagger
 * /api/groups/{groupId}/trips:
 *   get:
 *     summary: Get all trips for a group
 *     tags:
 *       - Trips
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trips returned successfully
 *       400:
 *         description: Invalid group ID
 *       403:
 *         description: User is not authorised
 *       404:
 *         description: Group not found
 */
router.get(
  "/groups/:groupId/trips",
  protect,
  getGroupTrips
);


/**
 * @swagger
 * /api/trips/{id}:
 *   get:
 *     summary: Get a trip by ID
 *     tags:
 *       - Trips
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Trip returned successfully
 *       400:
 *         description: Invalid trip ID
 *       403:
 *         description: User is not authorised
 *       404:
 *         description: Trip not found
 */
router.get(
  "/trips/:id",
  protect,
  getTripById
);


/**
 * @swagger
 * /api/trips/{id}:
 *   patch:
 *     summary: Update a trip
 *     tags:
 *       - Trips
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               country:
 *                 type: string
 *               city:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               status:
 *                 type: string
 *                 enum:
 *                   - planned
 *                   - active
 *                   - completed
 *                   - cancelled
 *     responses:
 *       200:
 *         description: Trip updated successfully
 *       400:
 *         description: Invalid trip ID or dates
 *       403:
 *         description: User is not authorised
 *       404:
 *         description: Trip not found
 */
router.patch(
  "/trips/:id",
  protect,
  updateTrip
);


/**
 * @swagger
 * /api/trips/{id}:
 *   delete:
 *     summary: Delete a trip
 *     tags:
 *       - Trips
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       204:
 *         description: Trip deleted successfully
 *       400:
 *         description: Invalid trip ID
 *       403:
 *         description: User is not authorised
 *       404:
 *         description: Trip not found
 */
router.delete(
  "/trips/:id",
  protect,
  deleteTrip
);


module.exports = router;