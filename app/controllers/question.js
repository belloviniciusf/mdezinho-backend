const Yup = require('yup');
const mongoose = require('mongoose');
const Question = require('../models/Question');
const Answer = require('../models/Answer');

module.exports = () => {
    const controller = {};

    controller.store = async (req, res) => {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            subject: Yup.string(),
            videoRef: Yup.string(),
            options: Yup.array(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails.' });
        }

        const questionExists = await Question.findOne({ name: req.body.name });

        if (questionExists)
            return res
                .status(400)
                .json({ error: 'This question is already registered' });

        try {
            const question = await Question.create(req.body);

            return res.status(201).json(question);
        } catch (err) {
            return res
                .status(400)
                .json({ error: 'Error on create TV show', err });
        }
    };

    controller.update = async (req, res) => {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            subject: Yup.string(),
            videoRef: Yup.string(),
            options: Yup.array(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails.' });
        }

        if (!mongoose.isValidObjectId(req.params.id))
            return res.status(400).json({ error: 'Invalid ID.' });

        try {
            const question = await Question.update(
                { _id: req.params.id },
                req.body
            );

            return res.status(200).json(question);
        } catch (err) {
            return res.status(400).json({ error: 'Error on update TV show' });
        }
    };

    controller.list = async (req, res) => {
        try {
            const questionsAnswered = await Answer.find(
                {
                    userId: mongoose.Types.ObjectId(req.userId),
                    tvShowId: req.params.tvShowId,
                },
                { _id: 1, questionId: 1 }
            );            

            const query = {
                _id: { $nin: questionsAnswered.map((x) => x.questionId) },
            };

            const questionsToAnswer = await Question.find(query);

            return res.status(200).json(questionsToAnswer);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    controller.getAll = async (req, res) => {
        try {
            const questions = await Question.find();
            return res.status(200).json(questions);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    controller.get = async (req, res) => {
        try {
            if (!mongoose.isValidObjectId(req.params.id))
                return res.status(400).json({ error: 'Id invalid' });

            const question = await Question.findById(req.params.id);
            return res.status(200).json(question);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    return controller;
};
