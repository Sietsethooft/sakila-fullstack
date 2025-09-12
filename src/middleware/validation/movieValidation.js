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

    if (!title) errors.push('Titel is verplicht.');
    if (!description) errors.push('Beschrijving is verplicht.');
    if (!language_name) errors.push('Taal is verplicht.');
    if (!category_id) errors.push('Categorie is verplicht.');
    if (!rating) errors.push('Rating is verplicht.');
    if (!rental_duration) errors.push('Verhuurduur is verplicht.');
    if (!rental_rate) errors.push('Verhuurprijs is verplicht.');
    if (!inventory) errors.push('Aantal exemplaren is verplicht.');

    return errors;
}

module.exports = movieValidation;