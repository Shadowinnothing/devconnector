const Validator = require('Validator')

const isEmpty = require('./is-empty')

module.exports = validatePostInput = (data) => {
    let errors = {}

    // Check to make sure that name/email/password are not empty
    data.text = !isEmpty(data.text) ? data.text : ''

    if(!Validator.isLength(data.text, { min: 2, max: 300 })) {
        errors.text = 'Post must be between 2 and 300 chars'
    }

    if(Validator.isEmpty(data.text)) {
        errors.text = 'Post text is invalid'
    }

    return{ errors, isValid: isEmpty(errors) }
}