var mongoose = require('mongoose');

var FacilitySchema = new mongoose.Schema({
    name: { type: String, required: true },
    number: {type: Number, required: true}
})

module.exports = mongoose.model('Facility', FacilitySchema);