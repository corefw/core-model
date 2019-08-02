/**
 * Defines the ResourceIdentifier class.
 *
 * @author Luke Chavers <luke@c2cschools.com>
 * @author Kevin Sanders <kevin@c2cschools.com>
 * @since 5.0.0
 * @license See LICENSE.md for details about licensing.
 * @copyright 2017 C2C Schools, LLC
 */

"use strict";

let BaseResource = require( "./BaseResource" );

/**
 * Represents a single resource identifier, which provides linking information
 * to a resource but does not provide its data.
 *
 * @memberOf Resource
 * @extends Resource.BaseResource
 */
class ResourceIdentifier extends BaseResource {

	/**
	 * Serializes this collection into a JSON-API compatible object.
	 *
	 * @private
	 * @returns {Object} The serialized object.
	 */
	_serializeToJsonApiObject() {

		const me = this;

		return {
			id   : me.id,
			type : me.type,
		};
	}
}

module.exports = ResourceIdentifier;
