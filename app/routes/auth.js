module.exports = (app) => {
    const controller = app.controllers.authentication;

    app.route('/users').post(controller.storeUser);

    app.route('/users').all(controller.verify).put(controller.updateUser);

    app.route('/users').all(controller.verify).get(controller.listUsers);

    app.route('/users/:id').all(controller.verify).get(controller.getUser);

    app.route('/sessions').post(controller.login);
};
