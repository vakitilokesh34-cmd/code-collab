import express from "express";
import Room from "../models/Room.js";
import authMiddleware from "../middleware/authMiddleware.js";

const router = express.Router();

// GET /api/rooms/recent
router.get("/recent", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    console.log(`DEBUG: Fetching recent rooms for userId: ${userId}`);
    
    // Find rooms where user is owner or in the users list
    const rooms = await Room.find({
      $or: [
        { owner: userId },
        { "users.userId": userId }
      ]
    })
    .sort({ updatedAt: -1 })
    .limit(10);

    console.log(`DEBUG: Found ${rooms.length} rooms`);

    const formatted = rooms.map(r => ({
      id: r.roomId,
      name: r.roomName || r.roomId,
      date: new Date(r.updatedAt).toLocaleDateString(),
      status: r.users && r.users.length > 0 ? "Active" : "Closed"
    }));

    res.json(formatted);
  } catch (error) {
    res.status(500).json({ message: "Failed to fetch recent rooms" });
  }
});

// DELETE /api/rooms/clear-history
router.delete("/clear-history", authMiddleware, async (req, res) => {
  try {
    const userId = req.user.id;
    // Permanently delete rooms owned by this user
    await Room.deleteMany({ owner: userId });
    
    // Also remove the user from any other rooms they were participating in
    await Room.updateMany(
      { "users.userId": userId },
      { $pull: { users: { userId: userId } } }
    );

    res.json({ message: "Rooms deleted and history cleared successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to clear history" });
  }
});

export default router;