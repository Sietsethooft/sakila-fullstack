const categoryService = require('../../services/categoryServices');
const ratingService = require('../../services/ratingServices');

const movieValidation = {
    createValidation(req, res, next) {
        const errors = validateMovie(req.body);
        if (errors.length > 0) {
            categoryService.getCategories((catError, categories) => {
                if (catError) {
                    return res.status(500).render('pages/error', {
                        message: 'Fout bij het ophalen van categorieën',
                        error: { status: 500, stack: catError.stack }
                    });
                }
                ratingService.getRatings((ratError, ratings) => {
                    if (ratError) {
                        return res.status(500).render('pages/error', {
                            message: 'Fout bij het ophalen van ratings',
                            error: { status: 500, stack: ratError.stack }
                        });
                    }
                    const ratingStrings = ratings.map(r => r.rating);
                    res.status(400).render('pages/movieManagement/movieCreate', {
                        categories,
                        ratings: ratingStrings,
                        errors,
                        old: req.body
                    });
                });
            });
            return;
        }
        next();
    },
    updateValidation(req, res, next) {
        const errors = validateMovie(req.body);
        if (errors.length > 0) {
            return res.status(400).render('pages/movieManagement/movieEdit', {
                errors,
                old: req.body,
                data: {
                    movie: {
                        ...req.body,
                        film_id: req.params.id
                    }
                }
            });
        }
        next();
    }
};

function validateMovie(body) {
    const { title, description, language_name, category_id, rating, rental_duration, rental_rate, inventory } = body;
    const errors = [];

    if (!title) errors.push('Title is required.');
    if (!description) errors.push('Description is required.');
    if (!language_name) errors.push('Language is required.');
    if (!category_id) errors.push('Category is required.');
    if (!rating) errors.push('Rating is required.');
    if (!rental_duration) errors.push('Rental duration is required.');
    if (!rental_rate) errors.push('Rental price is required.');
    if (!inventory) errors.push('Number of copies is required.');

    return errors;
}

module.exports = movieValidation;