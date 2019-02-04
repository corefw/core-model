/**
 * Defines the Resource class.
 *
 * @author Luke Chavers <luke@c2cschools.com>
 * @author Kevin Sanders <kevin@c2cschools.com>
 * @since 5.0.0
 * @license See LICENSE.md for details about licensing.
 * @copyright 2017 C2C Schools, LLC
 */

"use strict";

const BaseResource 	= require( "./BaseResource" );
const ERRORS 		= require( "../errors" );

/**
 * Represents a single resource, potentially with data.
 *
 * @memberOf Resource
 * @extends Resource.BaseResource
 */
class Resource extends BaseResource {

	// noinspection JSUnusedGlobalSymbols
	/**
	 * A reference to the data source that was used to populate this resource
	 * with its data.
	 *
	 * @public
	 * @type {*}
	 * @default null
	 */
	get rawDataSource() {

		const me = this;

		if ( me._rawDataSource === undefined ) {

			return null;
		}

		return me._rawDataSource;
	}

	set rawDataSource( val ) {

		const me = this;

		me._rawDataSource = val;
	}

	/**
	 * All data for this resource.
	 *
	 * @public
	 * @type {Object}
	 * @default { attributes: {}, meta: {}, relationships: {} }
	 */
	get data() {

		const me = this;

		// Dependencies
		const TIPE = me.$dep( "tipe" );

		let cur = me.getConfigValue( "data", null );

		if ( cur === null ) {

			cur = {};
			me.setConfigValue( "data", cur );
		}

		if (
			cur.attributes === undefined ||
			TIPE( cur.attributes ) !== "object"
		) {

			cur.attributes = {};
		}

		if (
			cur.meta === undefined ||
			TIPE( cur.meta ) !== "object"
		) {

			cur.meta = {};
		}

		if (
			cur.relationships === undefined ||
			TIPE( cur.relationships ) !== "object"
		) {

			cur.relationships = {};
		}

		return cur;
	}

	set data( /** Object */ val ) {

		const me = this;

		// Dependencies
		const TIPE = me.$dep( "tipe" );

		if ( TIPE( val ) !== "object" ) {

			throw new ERRORS.common.InvalidDataTypeError(
				"Data within a Resource object must be set using an object."
			);
		}

		if ( TIPE( val.attributes ) !== "object" ) {

			val.attributes = {};
		}

		if ( TIPE( val.meta ) !== "object" ) {

			val.meta = {};
		}

		if ( TIPE( val.relationships ) !== "object" ) {

			val.relationships = {};
		}

		me.setConfigValue( "data", val );
	}

	/**
	 * The attribute data for this resource.
	 *
	 * @public
	 * @type {Object}
	 * @default {}
	 */
	get attributes() {

		const me = this;

		let data = me.data;

		return data.attributes;
	}

	set attributes( /** Object */ val ) {

		const me = this;

		let data = me.data;

		data.attributes = val;
	}

	/**
	 * The metadata for this resource.
	 *
	 * @public
	 * @type {Object}
	 * @default {}
	 */
	get meta() {

		const me = this;

		let data = me.data;

		return data.meta;
	}

	set meta( /** Object */ val ) {

		const me = this;

		let data = me.data;

		data.meta = val;
	}

	/**
	 * The relationship data for this resource.
	 *
	 * @public
	 * @type {Object}
	 * @default {}
	 */
	get relationships() {

		const me = this;

		let data = me.data;

		return data.relationships;
	}

	set relationships( /** Object */ val ) {

		const me = this;

		let data = me.data;

		data.relationships = val;
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

		let ret = {
			id            : me.id,
			type          : me.type,
			meta          : me.meta,
			attributes    : me.attributes,
			relationships : {},
		};

		_.each( me.relationships, function ( relData, relName ) {

			ret.relationships[ relName ] = {
				data: relData._serializeToJsonApiObject(),
			};
		} );

		return ret;
	}
}

module.exports = Resource;
