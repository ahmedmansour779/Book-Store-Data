const { body } = require('express-validator');

const middlewarePostBlog = () => {
  return [
    body('title').notEmpty().withMessage('title is required'),

    body('description').notEmpty().withMessage('description is required'),

    body('category').notEmpty().withMessage('category is required'),

    body('items').custom((value) => {
      if (!value) {
        throw new Error('items is required');
      }
      try {
        const arr = JSON.parse(value);
        if (!Array.isArray(arr) || arr.length === 0) {
          throw new Error('items must be a non-empty array');
        }

        arr.forEach((item) => {
          if (!item.title) throw new Error('Each item must have a title');
          if (!Array.isArray(item.items) || item.items.length === 0) {
            throw new Error('Each item must have a non-empty items array');
          }
          item.items.forEach((i) => {
            if (typeof i !== 'string')
              throw new Error('Each element inside items array must be a string');
          });
        });
        return true;
      } catch (err) {
        if (err instanceof SyntaxError) {
          throw new Error('items must be a valid JSON array');
        }
        throw err;
      }
    }),
  ];
};

module.exports = { middlewarePostBlog };
