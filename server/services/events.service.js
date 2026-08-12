import Event from "../models/event.model.js"


class EventService{

  static async getSingleEvent(id){
console.log(id)
      return  await Event.findById(id).populate('organizer', 'name avatarUrl bio organizerProfile');
    }
}

export default EventService ;