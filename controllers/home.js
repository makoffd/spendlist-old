/**
* GET /
* Home page.
*/
exports.index = (req, res) => {
    res.render('home', {
        title: 'The best home finance tracker'
    });
};
