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

const BaseClass = require( "@corefw/core-common" ).common.BaseClass;

/**
 * This is the base class for all collections (arrays) of resource-like objects.
 *
 * @memberOf Resource
 * @extends Common.BaseClass
 */
class BaseCollection extends BaseClass {

	/**
	 * @inheritDoc
	 */
	initialize( cfg ) {

		const me = this;

		// Call parent
		super.initialize( cfg );

		me._items = [];
	}

	/**
	 * The model for items within this collection.
	 *
	 * @public
	 * @type {Model.BaseModel}
	 * @readonly
	 */
	get model() {

		const me = this;

		return me.getConfigValue( "model" );
	}

	/**
	 * The items within this collection.
	 *
	 * @public
	 * @type {Resource.BaseResource[]}
	 * @readonly
	 */
	get items() {

		const me = this;

		return me._items;
	}

	/**
	 * Adds an item to the collection.
	 *
	 * @public
	 * @param {Resource.BaseResource} item - The item to add to the collection
	 * @returns {void}
	 */
	addItem( item ) {

		const me = this;

		me._items.push( item );
	}

	/**
	 * Serializes this collection into a JSON-API compatible object.
	 *
	 * @private
	 * @returns {Array} The serialized object.
	 */
	_serializeToJsonApiObject() {

		const me = this;

		// Dependencies
		const _ = me.$dep( "lodash" );

		let items = me.items;
		let ret = [];

		_.each( items, function ( item ) {

			ret.push( item._serializeToJsonApiObject() );
		} );

		return ret;
	}
}

module.exports = BaseCollection;
