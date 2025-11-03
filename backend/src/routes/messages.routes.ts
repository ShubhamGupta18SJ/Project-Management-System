
// src/routes/messages.routes.ts
import express from "express";
import { addMessage, getChatBySender, getChatByDate, getAllChats, getUsersForChat } from "../controllers/messages.controller";

const router = express.Router();

router.post("/add", addMessage); // save message (also emits)
router.get("/conversation/:sanderUniqueCode/:reciverUniqueCode", getAllChats);
router.get("/date/:sender/:receiver/:date", getChatByDate);
router.get("/sender/:sanderUniqueCode", getChatBySender);
router.get("/users/list", getUsersForChat);
// export default router;

/**
 * @swagger
 * tags:
 *   name: Messages
 *   description: Chat Messages API
 */

/**
 * @swagger
 * /api/messages/add:
 *   post:
 *     summary: Save and send a chat message
 *     tags: [Messages]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - sanderUniqueCode
 *               - reciverUniqueCode
 *               - text
 *             properties:
 *               sanderUniqueCode:
 *                 type: string
 *               reciverUniqueCode:
 *                 type: string
 *               text:
 *                 type: string
 *               time:
 *                 type: string
 *                 example: "13:45:10"
 *               date:
 *                 type: string
 *                 example: "2025-10-27"
 *               messageStatus:
 *                 type: number
 *                 example: 0
 *               isSent:
 *                 type: boolean
 *               isRead:
 *                 type: boolean
 *     responses:
 *       201:
 *         description: Message saved successfully
 *       500:
 *         description: Internal Server Error
 */

/**
 * @swagger
 * /api/messages/conversation/{sanderUniqueCode}/{reciverUniqueCode}:
 *   get:
 *     summary: Get full chat conversation between two users
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: sanderUniqueCode
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: reciverUniqueCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Conversation fetched successfully
 *       404:
 *         description: No conversation found
 */

/**
 * @swagger
 * /api/messages/date/{sender}/{receiver}/{date}:
 *   get:
 *     summary: Get messages by sender, receiver, and date
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: sender
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: receiver
 *         required: true
 *         schema:
 *           type: string
 *       - in: path
 *         name: date
 *         required: true
 *         schema:
 *           type: string
 *           example: "2025-10-26"
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *       404:
 *         description: No messages found for the given date
 */

/**
 * @swagger
 * /api/messages/sender/{sanderUniqueCode}:
 *   get:
 *     summary: Get all messages sent by a specific user
 *     tags: [Messages]
 *     parameters:
 *       - in: path
 *         name: sanderUniqueCode
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Messages fetched successfully
 *       404:
 *         description: No messages found for the given sender
 */


/**
 * @swagger
 * /api/messages/users/list:
 *   get:
 *     summary: Get all users available for chat
 *     tags: [Messages]
 *     description: Returns a list of users with avatar, unread message count, and online status
 *     responses:
 *       200:
 *         description: Users list retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: Chat users fetched successfully
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       username:
 *                         type: string
 *                         example: "Shubham"
 *                       email:
 *                         type: string
 *                         example: "shubham@gmail.com"
 *                       uniqueCode:
 *                         type: string
 *                         example: "USR0001"
 *                       avatar:
 *                         type: string
 *                         example: "https://cdn-icons-png.flaticon.com/512/4333/4333609.png"
 *                       lastSeen:
 *                         type: string
 *                         example: "Last seen recently"
 *                       lastMsgTime:
 *                         type: string
 *                         example: "22:15"
 *                       unread:
 *                         type: integer
 *                         example: 3
 *       500:
 *         description: Server Error
 */

export default router;


