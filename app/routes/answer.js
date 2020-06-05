module.exports = (app) => {
    const auth = app.controllers.authentication;
    const controller = app.controllers.answer;

    app.route('/answers').all(auth.verify).post(controller.store);

    app.route('/answers').all(auth.verify).get(controller.list);

    app.route('/answers/evaluate').all(auth.verify).get(controller.getEvaluate);

    app.route('/answers/:id')
        .all(auth.verify)
        .put(controller.update)
        .get(controller.get);
};
