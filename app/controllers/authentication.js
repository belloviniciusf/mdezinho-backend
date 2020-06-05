const Yup = require('yup');
const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const { promisify } = require('util');
const authConfig = require('../../config/auth');
const User = require('../models/User');

module.exports = () => {
    const controller = {};

    controller.verify = async (req, res, next) => {
        const authHeader = req.headers.authorization;

        if (!authHeader) {
            return res.status(401).json({ error: 'Token not provided.' });
        }

        const [, token] = authHeader.split(' ');

        try {
            const decoded = await promisify(jwt.verify)(
                token,
                authConfig.secret
            );

            req.userId = decoded._id;

            return next();
        } catch (err) {
            return res.status(401).json({ error: 'Token invalid.' });
        }
    };

    controller.storeUser = async (req, res) => {
        const schema = Yup.object().shape({
            name: Yup.string().required(),
            email: Yup.string().email().required(),
            password: Yup.string().required().min(6),
        });

        if (!(await schema.isValid(req.body))) {
            return res.status(400).json({ error: 'Validation fails.' });
        }

        const userExists = await User.findOne({ email: req.body.email });

        if (userExists)
            return res
                .status(400)
                .json({ error: 'This e-mail is already registered' });

        try {
            const user = await User.create(req.body);
            const token = jwt.sign({ _id: user._id }, authConfig.secret, {
                expiresIn: authConfig.expiresIn,
            });

            return res.status(201).json({ user, token });
        } catch (err) {
            return res.status(400).json({ error: 'Error on create user', err });
        }
    };

    controller.updateUser = async (req, res) => {
        const schema = Yup.object().shape({
            name: Yup.string(),
            email: Yup.string().email(),
            type: Yup.string(),
            oldPassword: Yup.string().min(6),
            password: Yup.string()
                .min(6)
                .when('oldPassword', (oldPassword, field) =>
                    oldPassword ? field.required() : field
                ),
            confirmPassword: Yup.string().when('password', (password, field) =>
                password ? field.required().oneOf([Yup.ref('password')]) : field
            ),
        });

        if (!(await schema.isValid(req.body)))
            return res.status(400).json({ error: 'Validation fails.' });

        const { email, oldPassword } = req.body;

        const user = await User.findById(req.userId);

        if (email && email !== user.email) {
            const userExists = await User.findOne({ email });

            if (userExists)
                return res.status(400).json({ error: 'User already exists.' });
        }

        if (oldPassword && !(await user.comparePassword(oldPassword)))
            return res.status(401).json({ error: 'Password does not match.' });

        await user.update(req.body);

        const { id, name } = await User.findById(req.userId);

        return res.json({ id, name, email });
    };

    controller.login = async (req, res) => {
        const schema = Yup.object().shape({
            email: Yup.string().email().required(),
            password: Yup.string().required().min(6),
        });

        if (!(await schema.isValid(req.body)))
            return res.status(400).json({ error: 'Validation fails' });

        const { email, password } = req.body;

        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ error: 'User not found.' });

        if (!(await user.comparePassword(password)))
            return res.status(401).json({ error: 'Password does not match.' });

        const { _id, name, language } = user;

        return res.status(200).json({
            user: { _id, name, email, language },
            token: jwt.sign({ _id }, authConfig.secret, {
                expiresIn: authConfig.expiresIn,
            }),
        });
    };

    controller.listUsers = async (req, res) => {
        const query = {
            // active: true
        };

        const options = {
            sort: { createdAt: -1 },
            page: req.query.page ? req.query.page : 1,
            limit: 10,
        };

        try {
            const notifications = await User.paginate(query, options);
            return res.status(200).json(notifications);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    controller.getUser = async (req, res) => {
        try {
            if (!mongoose.isValidObjectId(req.params.id))
                return res.status(400).json({ error: 'Id invalid' });

            const user = await User.findById(req.params.id);
            return res.status(200).json(user);
        } catch (err) {
            return res.status(400).json(err);
        }
    };

    return controller;
};
