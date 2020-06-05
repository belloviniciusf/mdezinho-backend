module.exports = (app) => {
    const auth = app.controllers.authentication;
    const controller = app.controllers.comment;

    app.route('/comments')
        .all(auth.verify)
        .get(controller.list)
        .post(controller.store);    

    app.route('/comments/:id')
        .all(auth.verify)
        .put(controller.update)
        .get(controller.get);
};
