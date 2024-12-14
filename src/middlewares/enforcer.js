const { newEnforcer } = require('casbin');
const path = require('path');

let enforcer;

exports.initializeCasbin = async () => {
  // Initialize the enforcer with the model and policy files
  enforcer = await newEnforcer(
    path.join(__dirname, '../rbac/rbac_model.conf'),
    path.join(__dirname, '../rbac/rbac_policy.csv')
  );
  console.log('Casbin initialized');
  return enforcer;
};

exports.getEnforcer = () => enforcer;
