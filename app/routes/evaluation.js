module.exports = (app) => {
    const auth = app.controllers.authentication;
    const controller = app.controllers.evaluation;

    app.route('/evaluations/dashboard')
        .all(auth.verify)
        .get(controller.getDashboard);

    app.route('/evaluations/:id').all(auth.verify).get(controller.get);

    app.route('/evaluations/:id/list').all(auth.verify).get(controller.list);

    app.route('/evaluations/:id/technicals')
        .all(auth.verify)
        .get(controller.getTechnicalAnswers);

    app.route('/evaluations/:id/comments')
        .all(auth.verify)
        .get(controller.getComments);

    app.route('/evaluations/:id/average')
        .all(auth.verify)
        .get(controller.getAverageEvaluation);

    app.route('/evaluations/:id/evaluators')
        .all(auth.verify)
        .get(controller.getEvaluators);
};
