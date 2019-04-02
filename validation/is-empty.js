// checks if string, object, etc. is empty, similar to
// what lodash would do
module.exports = isEmpty = (value) => (
    value === undefined ||
    value === null ||
    (typeof value === 'object' && Object.keys(value).length === 0) ||
    (typeof value === 'string' && value.trim().length === 0)
)