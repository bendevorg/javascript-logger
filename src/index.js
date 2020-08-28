const onFinished = require('on-finished');

const levels = {
  INFO: 'INFO',
  ERROR: 'ERROR',
  WARNING: 'WARNING',
};
const errorStatusCode = /5\w{2}/g;
const warningStatusCode = /4\w{2}/g;

function generateId() {
  const date = new Date().getTime();
  const id = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, newId => {
    const randomNumber = (date + Math.random() * 16) % 16 | 0;
    return (newId === 'x' ? randomNumber : (randomNumber & 0x3 | 0x8)).toString(16);
  });
  return id;
}

function info(data, req = {}, res = {}) {
  return console.info(JSON.stringify({
    level: levels.INFO,
    requestId: req.requestId || res.requestId,
    path: req.path,
    method: req.method,
    processTime: res.processTime,
    statusCode: res.statusCode,
    ...data,
  }));
}

function error(err = {}, req = {}, res = {}) {
  return console.error(JSON.stringify({
    level: levels.ERROR,
    requestId: req.requestId || res.requestId,
    path: req.path,
    method: req.method,
    processTime: res.processTime,
    statusCode: res.statusCode,
    code: err.code,
    message: err.message,
  }));
}

function warn(data = {}, req = {}, res = {}) {
  return console.warn(JSON.stringify({
    level: levels.WARNING,
    requestId: req.requestId || res.requestId,
    path: req.path,
    method: req.method,
    processTime: res.processTime,
    statusCode: res.statusCode,
    ...data,
  }));
}

function listener(err, res) {
  if (err) {
    return error(err, {}, res);
  }
  res.processTime = Date.now() - res.startedAt;
  if (errorStatusCode.test(res.statusCode)) {
    return error({}, {}, res);
  } 
  if (warningStatusCode.test(res.statusCode)) {
    return warn({}, {}, res);
  }
  return info({}, {}, res);
}

function middleware(req, res, next) {
  const requestId = generateId();
  req.requestId = requestId;
  res.requestId = requestId;
  res.path = req.path;
  res.startedAt = Date.now();
  onFinished(res, listener);
  info({}, req);
  return next();
}

module.exports = {
  info,
  error,
  middleware,
  warn,
};
