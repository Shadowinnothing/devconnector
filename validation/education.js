const Validator = require('Validator')

const isEmpty = require('./is-empty')

module.exports = validateEducationInput = (data) => {
    let errors = {}

    // Check to make sure that name/email/password are not empty
    data.school = !isEmpty(data.school) ? data.school : ''
    data.degree = !isEmpty(data.degree) ? data.degree : ''
    data.fieldOfStudy = !isEmpty(data.fieldOfStudy) ? data.fieldOfStudy : ''
    data.from = !isEmpty(data.from) ? data.from : ''

    if(Validator.isEmpty(data.school)) {
        errors.school = 'School field is required'
    }

    if(Validator.isEmpty(data.degree)) {
        errors.degree = 'Degree field is required'
    }

    if(Validator.isEmpty(data.fieldOfStudy)) {
        errors.fieldOfStudy = 'Field of Study field is required'
    }

    if(Validator.isEmpty(data.from)) {
        errors.from = 'From date field is required'
    }

    return{ errors, isValid: isEmpty(errors) }
} 