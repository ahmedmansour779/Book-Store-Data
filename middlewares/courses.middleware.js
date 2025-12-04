const { body } = require("express-validator");

const middlewareEditCourse = () => {
    return [
        body('title')
            .notEmpty()
            .withMessage("title is required")
            .isLength({ min: 2, max: 10 })
            .withMessage("title is not failed")
    ]
}

const middlewarePostCourse = () => {
    return [
        ...middlewareEditCourse(),
        body('price')
            .notEmpty()
            .withMessage('price is required')
    ]
}

module.exports = { middlewarePostCourse, middlewareEditCourse }