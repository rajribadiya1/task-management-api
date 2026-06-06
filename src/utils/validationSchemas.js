const Joi = require('joi');

const registerValidation = (data) => {
  const schema = Joi.object({
    name: Joi.string().min(2).max(50).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).required()
  });
  return schema.validate(data);
};

const loginValidation = (data) => {
  const schema = Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required()
  });
  return schema.validate(data);
};

const createTaskValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(100).required(),
    description: Joi.string().max(500).allow('', null),
    priority: Joi.string().valid('low', 'medium', 'high'),
    status: Joi.string().valid('todo', 'in-progress', 'done'),
    dueDate: Joi.date().min('now')
  });
  return schema.validate(data);
};

const updateTaskValidation = (data) => {
  const schema = Joi.object({
    title: Joi.string().min(3).max(100),
    description: Joi.string().max(500).allow('', null),
    priority: Joi.string().valid('low', 'medium', 'high'),
    status: Joi.string().valid('todo', 'in-progress', 'done'),
    dueDate: Joi.date().min('now')
  }).min(1);
  return schema.validate(data);
};

module.exports = {
  registerValidation,
  loginValidation,
  createTaskValidation,
  updateTaskValidation
};