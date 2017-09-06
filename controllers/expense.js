const Currency = require('../models/Currency');
const Expense = require('../models/Expense');

const mongoose = require('mongoose');
const moment = require('moment');
const dateHelpers = require('../helpers/dates');

const formatExpenses = (expenses, userId) => expenses.map((el) => {
    const date = moment(el.date).format('DD-MM-YYYY ddd');
    let user = (el.user_id.profile && el.user_id.profile.name) || el.user_id.email;

    if (el.user_id._id.toString() === userId.toString()) {
        user = 'Me';
    }

    return Object.assign({}, el, { user, date });
});

/**
* GET /expenses
* Show the expenses.
*/
exports.getExpenses = (req, res, next) => {
    if (!req.user) {
        return res.redirect('/');
    }

    Expense.find({
        user_id: {
            $in: [mongoose.Types.ObjectId(req.user.id), ...req.user.familyMembers]
        }
    })
        .populate('user_id')
        .populate('currency')
        .sort({ date: -1, updatedAt: -1 })
        .lean()
        .exec((err, expenses) => {
            if (err) {
                return next(err);
            }
            if (expenses.length) {
                res.render('expenses/list', {
                    title: 'Expenses',
                    expenses: formatExpenses(expenses, req.user.id),
                    thisWeekTotal: dateHelpers.getThisWeekAmount(expenses),
                    prevWeekTotal: dateHelpers.getPrevWeekAmount(expenses),
                    thisMonthTotal: dateHelpers.getThisMonthAmount(expenses),
                    prevMonthTotal: dateHelpers.getPrevMonthAmount(expenses)
                });
            } else {
                res.render('expenses/empty', {
                    title: 'Expenses',
                    text: 'There\'s no expenses yet. Please add something first'
                });
            }
        });
};

/**
* GET / expenses/add
* Addexpense
*/
exports.addExpense = (req, res) => {
    if (!req.user) {
        return res.redirect('/');
    }

    Currency.find({}).exec((err, currencies, next) => {
        if (err) {
            return next(err);
        }
        res.render('expenses/add', {
            title: 'Add expense',
            today: moment().format('DD-MM-YYYY'),
            currencies,
            categories: req.user.categories
        });
    });
};

/**
* POST /expense/add
* Addexpense
*/
exports.postExpense = (req, res, next) => {
    if (!req.user) {
        return res.redirect('/');
    }

    req.assert('amount', 'Amount can not be blank').notEmpty();
    req.assert('date', 'Date can not be blank').notEmpty();
    req.assert('category', 'Category can not be blank').notEmpty();
    req.assert('currency', 'Currency can not be blank').notEmpty();

    const errors = req.validationErrors();

    if (errors) {
        req.flash('errors', errors);
        return res.redirect('/expenses');
    }

    const expense = new Expense({
        amount: req.body.amount,
        date: moment(req.body.date, 'DD-MM-YYYY'),
        category: req.body.category,
        currency: mongoose.Types.ObjectId(req.body.currency),
        comment: req.body.comment,
        user_id: mongoose.Types.ObjectId(req.user.id)
    });

    expense.save((err) => {
        if (err) {
            return next(err);
        }

        res.redirect('/expenses');
    });
};
