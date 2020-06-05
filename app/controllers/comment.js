const Yup = require('yup');
const mongoose = require('mongoose');
const Comment = require('../models/Comment');

module.exports = () => {
    const controller = {};

    controller.store = async (req, res) => {
        const schema = Yup.object().shape({
            text: Yup.string().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails.' });
        }

        try {
            const comment = await Comment.create(req.body);

            return res.status(201).json(comment);
        } catch (err) {
            return res
                .status(400)
                .json({ error: 'Error on create comment', err });
        }
    };

    controller.update = async (req, res) => {
        const schema = Yup.object().shape({
            text: Yup.string().required,
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails.' });
        }

        if (!mongoose.isValidObjectId(req.params.id))
            return res.status(400).json({ error: 'Invalid ID.' });

        try {
            const comment = await Comment.findOneAndUpdate(
                { _id: req.params.id },
                req.body
            );

            return res.status(200).json(comment);
        } catch (err) {
            return res.status(400).json({ error: 'Error on update comment' });
        }
    };

    controller.list = async (req, res) => {
        const query = {
            // active: true
        };

        const options = {
            sort: { createdAt: -1 },
            page: req.query.page ? req.query.page : 1,
            limit: 10,
        };

        try {
            const comments = await Comment.paginate(query, options);

            return res.status(200).json(comments);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    controller.get = async (req, res) => {
        try {
            if (!mongoose.isValidObjectId(req.params.id))
                return res.status(400).json({ error: 'Id invalid' });

            const tvShow = await Comment.findById(req.params.id);
            return res.status(200).json(tvShow);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    return controller;
};
