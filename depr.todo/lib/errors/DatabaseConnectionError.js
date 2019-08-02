/**
 * @file Defines the DatabaseConnectionError class.
 */

"use strict";

const DatabaseError = require( "./abstract/DatabaseError" );

/**
 * This error is thrown whenever a database connection attempt fails or is
 * unexpectedly disconnected.
 *
 * @memberOf Errors
 * @extends Errors.Abstract.DatabaseError
 */
class DatabaseConnectionError extends DatabaseError {

	/**
	 * @param {Error} [cause] - An optional Error object that can be provided if
	 *     this error was caused by another.
	 * @param {string} message - An error message that provides clients with a
	 *     description of the error condition and, potentially, how it might be
	 *     resolved.
	 * @param {...*} [args] - Printf style arguments for the message.
	 */
	constructor( cause, message, ...args ) {

		super( cause, message, ...args );
	}
}

module.exports = DatabaseConnectionError;
