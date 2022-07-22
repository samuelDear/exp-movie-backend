const validateParams = (params, fields) => {
  let exist = true;

  fields.map(field => {
    if (exist) {
      exist = params[field] && params[field];
    }
  });

  return exist;
};

export default validateParams;
