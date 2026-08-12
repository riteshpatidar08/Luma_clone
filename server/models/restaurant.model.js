const mongoose = require('mongoose');

const restaurentSchema = new mongoose.Schema({
  name: {
    type: String,
  },

  location: {
    type: { type: String, enum: ['Point'], default: 'Point' },
    coordinates: {
    type: [Number], 
    // [long, lati]
    },
  },
});

const Restaurent = mongoose.model('Restaurent', restaurentSchema);

restaurentSchema.index({ 'location.coordinates': '2dsphere' });

module.exports  = Restaurent ;
// 75.8513,
//                     26.9855
//  500meter
//                     60.4  20.6


// {
//    location :  {
//       $near: {
//         $geometry: {
//            type: "Point" ,
//            coordinates: [ <longitude> , <latitude> ]
//         },
//         $maxDistance: <distance in meters>,
      
//       }
//     }
//  }