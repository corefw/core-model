/**
 * @file Defines the MissingRelationshipError class.
 */

"use strict";

const RelationshipError = require( "./abstract/RelationshipError" );

/**
 * This error is thrown whenever a relationship is expected, but not found.
 *
 * @memberOf Errors
 * @extends Errors.Abstract.RelationshipError
 */
class MissingRelationshipError extends RelationshipError {

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

module.exports = MissingRelationshipError;
