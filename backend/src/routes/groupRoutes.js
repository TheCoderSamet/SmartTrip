const express = require("express");

const {
  createGroup,
  getMyGroups,
  getGroupById,
  addMember,
} = require("../controllers/groupController");

const protect = require("../middleware/authMiddleware");

const router = express.Router();


/**
 * @swagger
 * tags:
 *   name: Groups
 *   description: Travel group management
 */


/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Create a new travel group
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - name
 *             properties:
 *               name:
 *                 type: string
 *                 example: Italy Trip Group
 *     responses:
 *       201:
 *         description: Group created successfully
 *       400:
 *         description: Group name is required
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.post("/", protect, createGroup);


/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Get all groups for the current user
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Groups returned successfully
 *       401:
 *         description: Authentication required
 *       500:
 *         description: Server error
 */
router.get("/", protect, getMyGroups);


/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     summary: Get a group by ID
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: MongoDB Group ID
 *     responses:
 *       200:
 *         description: Group returned successfully
 *       403:
 *         description: User is not a member of the group
 *       404:
 *         description: Group not found
 *       500:
 *         description: Server error
 */
router.get("/:id", protect, getGroupById);


/**
 * @swagger
 * /api/groups/{id}/members:
 *   post:
 *     summary: Add a registered user to a group
 *     tags:
 *       - Groups
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
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
 *               - email
 *             properties:
 *               email:
 *                 type: string
 *                 example: enes@test.com
 *     responses:
 *       200:
 *         description: Member added successfully
 *       400:
 *         description: Email is required
 *       403:
 *         description: Only the group owner can add members
 *       404:
 *         description: Group or user not found
 *       409:
 *         description: User is already a member
 *       500:
 *         description: Server error
 */
router.post("/:id/members", protect, addMember);


module.exports = router;