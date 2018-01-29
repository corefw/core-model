/**
 * Defines the BaseRelationship class.
 *
 * @author Luke Chavers <luke@c2cschools.com>
 * @author Kevin Sanders <kevin@c2cschools.com>
 * @since 5.0.0
 * @license See LICENSE.md for details about licensing.
 * @copyright 2017 C2C Schools, LLC
 */

"use strict";

let BaseCollection = require( "./BaseCollection" );

/**
 * Represents a collection of resources.
 *
 * @memberOf Resource
 * @extends Resource.BaseCollection
 */
class ResourceCollection extends BaseCollection {

	/**
	 * An alias for {@link Resource.BaseCollection#addItem}.
	 *
	 * @public
	 * @param {Resource.Resource} item - The resource item to add.
	 * @returns {void}
	 */
	addResource( item ) {

		const me = this;

		me.addItem( item );
	}
}

module.exports = ResourceCollection;
