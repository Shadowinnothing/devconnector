const Validator = require('Validator')

const isEmpty = require('./is-empty')

module.exports = validateExperienceInput = (data) => {
    let errors = {}

    // Check to make sure that name/email/password are not empty
    data.title = !isEmpty(data.title) ? data.title : ''
    data.company = !isEmpty(data.company) ? data.company : ''
    data.from = !isEmpty(data.from) ? data.from : ''

    if(Validator.isEmpty(data.title)) {
        errors.title = 'Job Title field is required'
    }

    if(Validator.isEmpty(data.company)) {
        errors.company = 'Company field is required'
    }

    if(Validator.isEmpty(data.from)) {
        errors.from = 'From date field is required'
    }

    return{ errors, isValid: isEmpty(errors) }
} 