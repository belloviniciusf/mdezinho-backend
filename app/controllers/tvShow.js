const Yup = require('yup');
const mongoose = require('mongoose');
const TVShow = require('../models/TVShow');
const Evaluation = require('../models/Evaluation');

module.exports = () => {
    const controller = {};

    controller.store = async (req, res) => {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            broadcaster: Yup.string().required(),
            date: Yup.string().required(),
            hour: Yup.string().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails.' });
        }

        const userExists = await TVShow.findOne({ name: req.body.name });

        if (userExists)
            return res
                .status(400)
                .json({ error: 'This TV show is already registered' });

        try {
            const tvShow = await TVShow.create(req.body);

            return res.status(201).json(tvShow);
        } catch (err) {
            return res
                .status(400)
                .json({ error: 'Error on create TV show', err });
        }
    };

    controller.update = async (req, res) => {
        const schema = Yup.object().shape({
            name: Yup.string(),
            broadcaster: Yup.string(),
            date: Yup.string(),
            hour: Yup.string(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails.' });
        }

        if (!mongoose.isValidObjectId(req.params.id))
            return res.status(400).json({ error: 'Invalid ID.' });

        try {
            const tvShow = await TVShow.findOneAndUpdate(
                { _id: req.params.id },
                req.body
            );

            return res.status(200).json(tvShow);
        } catch (err) {
            return res.status(400).json({ error: 'Error on update TV show' });
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
            // const tvShows = await TVShow.paginate(query, options);
            const evaluations = await Evaluation.find({
                userId: req.userId,
            });
            const tvShows = await TVShow.find({}).lean();

            tvShows.map((tvShow) => {
                if (
                    evaluations.find(
                        (e) => String(e.tvShowId) === String(tvShow._id)
                    )
                ) {
                    tvShow.evaluated = true;
                }
            });

            return res.status(200).json(tvShows);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    controller.get = async (req, res) => {
        try {
            if (!mongoose.isValidObjectId(req.params.id))
                return res.status(400).json({ error: 'Id invalid' });

            const tvShow = await TVShow.findById(req.params.id);
            return res.status(200).json(tvShow);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    controller.getDashboard = async (req, res) => {
        try {
            const evaluations = await Evaluation.find({}).select(
                '_id tvShowId insufficientAnswers values'
            );
            const tvShows = await TVShow.find({}).lean();

            tvShows.map((tvShow) => {
                tvShow.evaluations = evaluations.filter(
                    (e) => String(e.tvShowId) === String(tvShow._id)
                ).length;
            });

            return res.status(200).json(tvShows);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    return controller;
};
