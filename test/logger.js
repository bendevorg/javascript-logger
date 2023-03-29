const logger = require("../src");
const { expect } = require("chai");
const app = require("express")();
const api = require("supertest");

//  OVERRIDING CONSOLE
console.info = (message) => message;
console.error = (message) => message;
console.warn = (message) => message;

describe("Logger", () => {
	describe("Info", () => {
		it("should have only level when no data, req or res are sent", (done) => {
			const log = JSON.parse(logger.info());
			expect(log).to.haveOwnProperty("level");
			expect(log.level).to.equal("INFO");
			done();
		});

		it("should contain data with level when data but no req or res are sent", (done) => {
			const data = { field_1: 1, field_2: true };
			const log = JSON.parse(logger.info(data));
			expect(log).to.haveOwnProperty("level");
			expect(log).to.haveOwnProperty("field_1");
			expect(log).to.haveOwnProperty("field_2");
			expect(log.level).to.equal("INFO");
			expect(log.field_1).to.equal(data.field_1);
			expect(log.field_2).to.equal(data.field_2);
			done();
		});

		it("should contain plain text data with level when plain text data but no req or res are sent", (done) => {
			const data = "Test";
			const log = JSON.parse(logger.info(data));
			expect(log).to.haveOwnProperty("level");
			expect(log).to.haveOwnProperty("data");
			expect(log.level).to.equal("INFO");
			expect(log.data).to.equal(data);
			done();
		});

		it("should contain plain number data with level when plain number data but no req or res are sent", (done) => {
			const data = 42;
			const log = JSON.parse(logger.info(data));
			expect(log).to.haveOwnProperty("level");
			expect(log).to.haveOwnProperty("data");
			expect(log.level).to.equal("INFO");
			expect(log.data).to.equal(data);
			done();
		});

		it("should contain API request data when sent", (done) => {
			const cb = function (err, res, line) {
				if (err) return done(err);
				done();
			};
			api(createServer(app, logger)).get("/success").expect(200, cb);
		});
	});

	describe("Warning", () => {
		it("should have only level when no data, req or res are sent", (done) => {
			const log = JSON.parse(logger.warn());
			expect(log).to.haveOwnProperty("level");
			expect(log.level).to.equal("WARNING");
			done();
		});

		it("should contain data with level when data but no req or res are sent", (done) => {
			const data = { field_1: 1, field_2: true };
			const log = JSON.parse(logger.warn(data));
			expect(log).to.haveOwnProperty("level");
			expect(log).to.haveOwnProperty("field_1");
			expect(log).to.haveOwnProperty("field_2");
			expect(log.level).to.equal("WARNING");
			expect(log.field_1).to.equal(data.field_1);
			expect(log.field_2).to.equal(data.field_2);
			done();
		});

		it("should contain plain text data with level when plain text data but no req or res are sent", (done) => {
			const data = "Test";
			const log = JSON.parse(logger.warn(data));
			expect(log).to.haveOwnProperty("level");
			expect(log).to.haveOwnProperty("data");
			expect(log.level).to.equal("WARNING");
			expect(log.data).to.equal(data);
			done();
		});

		it("should contain plain number data with level when plain number data but no req or res are sent", (done) => {
			const data = 42;
			const log = JSON.parse(logger.warn(data));
			expect(log).to.haveOwnProperty("level");
			expect(log).to.haveOwnProperty("data");
			expect(log.level).to.equal("WARNING");
			expect(log.data).to.equal(data);
			done();
		});

		it("should contain API request data when sent", (done) => {
			const cb = function (err, res, line) {
				if (err) return done(err);
				done();
			};
			api(createServer(app, logger)).get("/warning").expect(401, cb);
		});
	});

	describe("Error", () => {
		it("should have only level when no data, req or res are sent", (done) => {
			const log = JSON.parse(logger.error());
			expect(log).to.haveOwnProperty("level");
			expect(log.level).to.equal("ERROR");
			done();
		});

		it("should contain data with level when data but no req or res are sent", (done) => {
			const log = JSON.parse(logger.error(new Error("Test error message")));
			expect(log).to.haveOwnProperty("level");
			expect(log).to.haveOwnProperty("message");
			expect(log.level).to.equal("ERROR");
			expect(log.message).to.equal("Test error message");
			done();
		});

		it("should contain plain text data with level when plain text data but no req or res are sent", (done) => {
			const data = "Test";
			const log = JSON.parse(logger.error(data));
			expect(log).to.haveOwnProperty("level");
			expect(log).to.haveOwnProperty("err");
			expect(log.level).to.equal("ERROR");
			expect(log.err).to.equal(data);
			done();
		});

		it("should contain plain number data with level when plain number data but no req or res are sent", (done) => {
			const data = 42;
			const log = JSON.parse(logger.error(data));
			expect(log).to.haveOwnProperty("level");
			expect(log).to.haveOwnProperty("err");
			expect(log.level).to.equal("ERROR");
			expect(log.err).to.equal(data);
			done();
		});

		it("should contain API request data when sent", (done) => {
			const cb = function (err, res, line) {
				if (err) return done(err);
				done();
			};
			api(createServer(app, logger)).get("/error").expect(500, cb);
		});

		it("should contain API request data when error code uncatched error occurs", (done) => {
			const cb = function (err, res, line) {
				if (err) return done(err);
				done();
			};
			api(createServer(app, logger)).get("/unexpected/a").expect(500, cb);
		});
	});
});

function createServer(app, logger) {
	app.use(logger.middleware);
	app.get("/success", (req, res) => res.status(200).json());
	app.get("/warning", (req, res) => res.status(401).json());
	app.get("/error", (req, res) => res.status(500).json());
	app.get("/unexpected/a", (req, res) => {
		throw new Error("Teste");
	});
	return app;
}
