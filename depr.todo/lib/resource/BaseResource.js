/**
 * Defines the BaseResource class.
 *
 * @author Luke Chavers <luke@c2cschools.com>
 * @author Kevin Sanders <kevin@c2cschools.com>
 * @since 5.0.0
 * @license See LICENSE.md for details about licensing.
 * @copyright 2017 C2C Schools, LLC
 */

"use strict";

const BaseClass = require( "@corefw/common" ).common.BaseClass;

/**
 * This is the base class for all resource-like objects.
 *
 * @memberOf Resource
 * @extends Common.BaseClass
 */
class BaseResource extends BaseClass {

	/**
	 * The model for this resource.
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
	 * The id of this resource.
	 *
	 * @public
	 * @type {string}
	 */
	get id() {

		const me = this;

		return me.getConfigValue( "id" );
	}

	set id( /** string */ val ) {

		const me = this;

		me.setConfigValue( "id", val );
	}

	/**
	 * The _name_ of the model for this resource.
	 *
	 * @public
	 * @type {string}
	 * @readonly
	 */
	get type() {

		const me = this;

		return me.model.name;
	}
}

module.exports = BaseResource;
