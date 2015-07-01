var mongoose = require('mongoose');

var FacilitySchema = new mongoose.Schema({
    name:         { type: String, required: true, index: true },
    id:           { type: Number, required: true, index: true },
    capacity:     { type: Number, required: true, index: true },
    description:  { type: String, required: false }
})

module.exports = mongoose.model('Facility', FacilitySchema);
