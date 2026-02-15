const Joi = require('joi');

module.exports.TitlesSchema = Joi.object({
            _id : Joi.number().required().min(0),
            title : Joi.string().required(),
            year : Joi.number().required().min(0),
            type : Joi.string().required(),
    })