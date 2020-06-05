module.exports = (app) => {
    const auth = app.controllers.authentication;
    const controller = app.controllers.question;

    app.route('/questions').all(auth.verify).post(controller.store);

    app.route('/questions/all').all(auth.verify).get(controller.getAll);

    app.route('/questions/tvshows/:tvShowId')
        .all(auth.verify)
        .get(controller.list);

    app.route('/questions/:id')
        .all(auth.verify)
        .put(controller.update)
        .get(controller.get);
};
