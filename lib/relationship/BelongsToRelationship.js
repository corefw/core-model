/**
 * @file Defines the BelongsToRelationship class.
 *
 * @author Luke Chavers <luke@c2cschools.com>
 * @author Kevin Sanders <kevin@c2cschools.com>
 * @since 5.0.0
 * @license See LICENSE.md for details about licensing.
 * @copyright 2017 C2C Schools, LLC
 */

"use strict";

const BaseRelationship = require( "./BaseRelationship" );

/**
 * Represents the child perspective in a 1:1 or 1:n relationship.
 *
 * @memberOf Relationship
 * @extends Relationship.BaseRelationship
 */
class BelongsToRelationship extends BaseRelationship {

	/**
	 * Extends the initializer of the {@link Relationship.BaseRelationship}
	 * class by indicating that the "local" model is the "child" in this
	 * relationship type.
	 *
	 * @param {?Object} cfg - A configuration object that will be consumed by
	 *     the newly instantiated class (object).
	 * @param {Model.BaseModel} cfg.localModel - The local model object.
	 * @param {string} cfg.modelName - The remote model name.
	 * @returns {void}
	 */
	_initialize( cfg ) {

		const me = this;

		// Call parent
		super._initialize( cfg );

		// Indicate that the "local" model is the "child"
		// in this relationship type.
		me._localModelIs = "child";
	}
}

module.exports = BelongsToRelationship;
