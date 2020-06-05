module.exports = (app) => {
    const auth = app.controllers.authentication;
    const controller = app.controllers.tvShow;

    app.route('/tvshows').all(auth.verify).post(controller.store);

    app.route('/tvshows').all(auth.verify).get(controller.list);

    app.route('/tvshows/dashboard')
        .all(auth.verify)
        .get(controller.getDashboard);

    app.route('/tvshows/:id')
        .all(auth.verify)
        .put(controller.update)
        .get(controller.get);
};
