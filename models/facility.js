var mongoose = require('mongoose');

var FacilitySchema = new mongoose.Schema({
    name: { type: String, required: true }
})

module.exports = mongoose.model('Facility', FacilitySchema);