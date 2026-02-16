const express = require("express");
const router = express.Router();

const {createEvent, getEventById} = require("../controllers/Event/event");
const {allEvent} = require("../controllers/Event/event");
const {updateEvent} = require("../controllers/Event/event");
const {deletedEvent} = require("../controllers/Event/event");

router.post("/create-event", createEvent);
router.get("/all-event", allEvent)
router.get("/getEventById/:id",getEventById)
router.patch('/updateEvent/:id', updateEvent);
router.delete('/deleteEvent/:id',deletedEvent);

module.exports = router;