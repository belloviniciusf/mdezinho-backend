const mongoose = require('mongoose');
const Evaluation = require('../models/Evaluation');
const Answer = require('../models/Answer');
const Question = require('../models/Question');
const TVShow = require('../models/TVShow');
const User = require('../models/User');

module.exports = () => {
    const controller = {};

    controller.getDashboard = async (req, res) => {
        try {
            const totalAnswers = await Answer.count({});
            const totalTvShows = await TVShow.count({});
            const totalEvaluations = await Evaluation.count({});
            const lastEvaluations = await Evaluation.find({})
                .sort({ _id: -1 })
                .limit(3)
                .populate('tvShowId userId');

            const lastUsers = await User.find({}).sort({ _id: -1 }).limit(3);

            return res.status(200).json({
                totalAnswers,
                totalTvShows,
                totalEvaluations,
                lastEvaluations,
                lastUsers,
            });
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    controller.get = async (req, res) => {
        try {
            if (!mongoose.isValidObjectId(req.params.id))
                return res.status(400).json({ error: 'Id invalid' });

            const query = {
                tvShowId: mongoose.Types.ObjectId(req.params.id),
                userId: req.query.userId
                    ? mongoose.Types.ObjectId(req.query.userId)
                    : req.userId,
            };

            const evaluation = await Evaluation.findOne(query);
            return res.status(200).json(evaluation);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    controller.list = async (req, res) => {
        try {
            if (!mongoose.isValidObjectId(req.params.id))
                return res.status(400).json({ error: 'Id invalid' });

            const query = {
                tvShowId: mongoose.Types.ObjectId(req.params.id),
            };

            const evaluations = await Evaluation.find(query).populate(
                'userId',
                '_id name'
            );
            return res.status(200).json(evaluations);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    controller.getTechnicalAnswers = async (req, res) => {
        try {
            if (!mongoose.isValidObjectId(req.params.id))
                return res.status(400).json({ error: 'Id invalid' });

            const query = [
                {
                    $match: {
                        tvShowId: mongoose.Types.ObjectId(req.params.id),
                        userId: req.query.userId
                            ? mongoose.Types.ObjectId(req.query.userId)
                            : mongoose.Types.ObjectId(req.userId),
                    },
                },
                {
                    $lookup: {
                        from: 'questions',
                        foreignField: '_id',
                        localField: 'questionId',
                        as: 'questionObj',
                    },
                },
                { $unwind: '$questionObj' },
                { $match: { 'questionObj.type': 2 } },
                {
                    $project: {
                        _id: 0,
                        label: '$questionObj.subject',
                        value: '$value',
                        notAnswered: '$notAnswered',
                    },
                },
            ];

            const response = await Answer.aggregate(query);

            return res.status(200).json(response);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    controller.getComments = async (req, res) => {
        try {
            if (!mongoose.isValidObjectId(req.params.id))
                return res.status(400).json({ error: 'Id invalid' });

            const questionComment = await Question.findOne({ type: 3 });

            const query = {
                tvShowId: mongoose.Types.ObjectId(req.params.id),
                userId: req.query.userId
                    ? mongoose.Types.ObjectId(req.query.userId)
                    : req.userId,
                questionId: questionComment._id,
            };

            const response = await Answer.findOne(query);

            return res.status(200).json(response);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    controller.getAverageEvaluation = async (req, res) => {
        try {
            if (!mongoose.isValidObjectId(req.params.id))
                return res.status(400).json({ error: 'Id invalid' });

            const query = [
                {
                    $match: {
                        tvShowId: mongoose.Types.ObjectId(req.params.id),
                        insufficientAnswers: { $ne: true },
                    },
                },
                {
                    $group: {
                        _id: '$tvShowId',
                        values: { $push: { $arrayElemAt: ['$values', 3] } },
                    },
                },
                {
                    $project: {
                        _id: 1,
                        total: { $size: '$values' },
                        average: {
                            $cond: {
                                if: { $gt: [{ $size: '$values' }, 0] },
                                then: {
                                    $divide: [
                                        {
                                            $reduce: {
                                                input: '$values',
                                                initialValue: 0,
                                                in: {
                                                    $sum: [
                                                        '$$value',
                                                        '$$this.value',
                                                    ],
                                                },
                                            },
                                        },
                                        { $size: '$values' },
                                    ],
                                },
                                else: 1,
                            },
                        },
                    },
                },
            ];

            const response = await Evaluation.aggregate(query);

            return res.status(200).json(response ? response[0] : null);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    controller.getEvaluators = async (req, res) => {
        try {
            if (!mongoose.isValidObjectId(req.params.id))
                return res.status(400).json({ error: 'Id invalid' });

            const query = [
                {
                    $match: {
                        tvShowId: mongoose.Types.ObjectId(req.params.id),
                    },
                },
                {
                    $lookup: {
                        foreignField: '_id',
                        localField: 'userId',
                        as: 'userObj',
                        from: 'users',
                    },
                },
                { $unwind: '$userObj' },
                {
                    $project: {
                        _id: 0,
                        userId: '$userId',
                        userName: '$userObj.name',
                    },
                },
            ];

            const response = await Evaluation.aggregate(query);

            return res.status(200).json(response);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    return controller;
};
