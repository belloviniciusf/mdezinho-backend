const Yup = require('yup');
const mongoose = require('mongoose');
const _ = require('lodash');
const Answer = require('../models/Answer');
const Evaluation = require('../models/Evaluation');

module.exports = () => {
    const controller = {};

    controller.store = async (req, res) => {
        const schema = Yup.object().shape({
            tvShowId: Yup.string().required(),
            value: Yup.number(),
            notAnswered: Yup.boolean(),
            last: Yup.boolean(),
            questionId: Yup.string().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails.' });
        }

        try {
            const question = await Answer.create({
                ...req.body,
                userId: req.userId,
            });

            res.status(201).json(question);

            const { last, tvShowId } = req.body;

            if (last) {
                const answers = await Answer.find({
                    userId: req.userId,
                    tvShowId,
                }).populate('questionId');

                const data = { userId: req.userId, tvShowId, values: [] };
                const hasTechnicalAnswers = answers.some(
                    (answer) => answer.questionId.type === 2
                );

                const countNotAnswereds = _.countBy(answers, {
                    notAnswered: true,
                });

                let totalTec = 0;

                answers.forEach((answer) => {
                    if (answer.questionId.type === 1) {
                        data.values.push({
                            label: answer.questionId.subject,
                            value: answer.value,
                        });
                    }

                    if (answer.questionId.type === 2) {
                        totalTec += answer.value * answer.questionId.weight;
                    }

                    if (answer.questionId.type === 3) {
                        data.positiveComment = answer.positiveComment;
                        data.negativeComment = answer.negativeComment;
                    }
                });

                if (hasTechnicalAnswers) {
                    data.values.push({
                        label: 'Avaliação técnica',
                        value: totalTec / 24,
                    });

                    data.values.push({
                        label: 'Média geral do usuário',
                        value:
                            data.values.reduce((a, b) => {
                                return a + b.value;
                            }, 0) / 3,
                    });
                }

                if (countNotAnswereds.true > 2) {
                    data.insufficientAnswers = true;
                }

                await Evaluation.create(data);
            }
        } catch (err) {
            return res
                .status(400)
                .json({ error: 'Error on create answer', err });
        }
    };

    controller.update = async (req, res) => {
        const schema = Yup.object().shape({
            tvShowId: Yup.string().required(),
            value: Yup.number().required(),
            questionId: Yup.string().required(),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails.' });
        }

        if (!mongoose.isValidObjectId(req.params.id))
            return res.status(400).json({ error: 'Invalid ID.' });

        try {
            const answer = await Answer.update(
                { _id: req.params.id },
                req.body
            );

            return res.status(200).json(answer);
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
            const answers = await Answer.paginate(query, options);
            return res.status(200).json(answers);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    controller.get = async (req, res) => {
        try {
            if (!mongoose.isValidObjectId(req.params.id))
                return res.status(400).json({ error: 'Id invalid' });

            const answer = await Answer.findById(req.params.id).populate([
                { path: 'userId', select: 'name' },
                { path: 'tvShowId', select: 'name' },
                { path: 'questionId', select: 'name subject' },
            ]);
            return res.status(200).json(answer);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    controller.getEvaluate = async (req, res) => {
        const query = [
            { $match: { userId: mongoose.Types.ObjectId(req.userId) } },
            {
                $lookup: {
                    from: 'questions',
                    localField: 'questionId',
                    foreignField: '_id',
                    as: 'questionObj',
                },
            },
            { $unwind: '$questionObj' },
            {
                $project: {
                    _id: '$_id',
                    value: '$value',
                    question: '$questionObj.name',
                },
            },
        ];

        try {
            const response = await Answer.aggregate(query);

            return res.status(200).json(response);
        } catch (err) {
            return res.status(400).json({ error: `Error on get evaluation` });
        }
    };

    return controller;
};
