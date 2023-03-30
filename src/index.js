const onFinished = require("on-finished");

const levels = {
	INFO: "INFO",
	ERROR: "ERROR",
	WARNING: "WARNING",
};
const errorStatusCode = /5\w{2}/g;
const warningStatusCode = /4\w{2}/g;

function generateId() {
	const date = new Date().getTime();
	const id = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (newId) => {
		const randomNumber = (date + Math.random() * 16) % 16 | 0;
		return (newId === "x" ? randomNumber : (randomNumber & 0x3) | 0x8).toString(16);
	});
	return id;
}

function info(data = {}, req = {}, res = {}) {
	let log = {
		level: levels.INFO,
		requestId: req.requestId || res.requestId,
		path: req.path || res.path,
		method: req.method || res.method,
		processTime: res.processTime,
		statusCode: res.statusCode,
	};
	if (typeof data === "object") {
		log = {
			...log,
			...data,
		};
	} else {
		log = {
			...log,
			data,
		};
	}
	return console.info(JSON.stringify(log));
}

function error(err = {}, req = {}, res = {}) {
	let log = {
		level: levels.ERROR,
		requestId: req.requestId || res.requestId,
		path: req.path || res.path,
		method: req.method || res.method,
		processTime: res.processTime,
		statusCode: res.statusCode,
	};
	if (typeof err === "object") {
		if (err.code || err.message) {
			log = {
				...log,
				code: err.code,
				message: err.message,
			};
		} else {
			log = {
				...log,
				...err,
			};
		}
	} else {
		log = {
			...log,
			err,
		};
	}
	return console.error(JSON.stringify(log));
}

function warn(data = {}, req = {}, res = {}) {
	let log = {
		level: levels.WARNING,
		requestId: req.requestId || res.requestId,
		path: req.path || res.path,
		method: req.method || res.method,
		processTime: res.processTime,
		statusCode: res.statusCode,
	};
	if (typeof data === "object") {
		log = {
			...log,
			...data,
		};
	} else {
		log = {
			...log,
			data,
		};
	}
	return console.warn(JSON.stringify(log));
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
	res.method = req.method;
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
