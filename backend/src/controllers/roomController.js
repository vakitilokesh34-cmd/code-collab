import Room from "../models/Room.js";

// create room
export const createRoom =
  async (req, res) => {
    try {
      const {
        roomId,
        language,
      } = req.body;

      // check existing room
      const exists =
        await Room.findOne({
          roomId,
        });

      if (exists) {
        return res.status(400).json({
          message:
            "Room already exists",
        });
      }

      // create room
      const room = await Room.create({
        roomId,

        language:
          language ||
          "javascript",

        owner: req.user.id,

        files: [
          {
            name: "main.js",
            content: "",
          },
        ],
      });

      res.status(201).json({
        message:
          "Room created successfully",

        room,
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to create room",
      });
    }
  };

// get all rooms
export const getAllRooms =
  async (req, res) => {
    try {
      const rooms =
        await Room.find()
          .populate(
            "owner",
            "username email"
          )
          .sort({
            createdAt: -1,
          });

      res.status(200).json(
        rooms
      );
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch rooms",
      });
    }
  };

// get single room
export const getRoom =
  async (req, res) => {
    try {
      const room =
        await Room.findOne({
          roomId:
            req.params.roomId,
        }).populate(
          "owner",
          "username email"
        );

      if (!room) {
        return res.status(404).json({
          message:
            "Room not found",
        });
      }

      res.status(200).json(
        room
      );
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to fetch room",
      });
    }
  };

// delete room
export const deleteRoom =
  async (req, res) => {
    try {
      const room =
        await Room.findOne({
          roomId:
            req.params.roomId,
        });

      if (!room) {
        return res.status(404).json({
          message:
            "Room not found",
        });
      }

      // owner only delete
      if (
        room.owner.toString() !==
        req.user.id
      ) {
        return res.status(403).json({
          message:
            "Unauthorized",
        });
      }

      await Room.deleteOne({
        roomId:
          req.params.roomId,
      });

      res.status(200).json({
        message:
          "Room deleted successfully",
      });
    } catch (error) {
      res.status(500).json({
        message:
          "Failed to delete room",
      });
    }
  };