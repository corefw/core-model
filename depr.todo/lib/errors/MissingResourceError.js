/**
 * @file Defines the MissingResourceError class.
 */

"use strict";

const StatusCode404Error = require( "@corefw/common" )
	.errors.abstract.StatusCode404Error;

/**
 * This error is thrown whenever a resource is expected, but not found.
 *
 * @memberOf Errors
 * @extends Errors.Abstract.StatusCode404Error
 */
class MissingResourceError extends StatusCode404Error {

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

module.exports = MissingResourceError;
