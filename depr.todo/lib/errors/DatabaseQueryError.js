/**
 * @file Defines the DatabaseQueryError class.
 */

"use strict";

const DatabaseError = require( "./abstract/DatabaseError" );

/**
 * This error is thrown whenever a database query fails to execute or when a
 * database returns an error in response to a query.
 *
 * @memberOf Errors
 * @extends Errors.Abstract.DatabaseError
 */
class DatabaseQueryError extends DatabaseError {

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

module.exports = DatabaseQueryError;
