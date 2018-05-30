/**
 * The 'Errors' namespace provides custom error classes that are used throughout
 * the project to provide meaningful information about the various errors that
 * can occur.
 *
 * @namespace Errors
 */

"use strict";

// module.exports = require( "requireindex" )( __dirname );

module.exports = {
	common                   : require( "@corefw/common" ).errors,
	abstract                 : require( "./abstract" ),
	DatabaseConnectionError  : require( "./DatabaseConnectionError" ),
	DatabaseQueryError       : require( "./DatabaseQueryError" ),
	MissingRelationshipError : require( "./MissingRelationshipError" ),
	MissingResourceError     : require( "./MissingResourceError" ),
};
