/**
 * @file Defines the BaseRelationship class.
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
 * This is the base class for all model relationships.
 *
 * @abstract
 * @memberOf Relationship
 * @extends Common.BaseClass
 */
class BaseRelationship extends BaseClass {

	/**
	 * Called during construction to initialize the newly instantiated class
	 * (object).
	 *
	 * @param {?Object} cfg - A configuration object that will be consumed by
	 *     the newly instantiated class (object).
	 * @param {Model.BaseModel} cfg.localModel - The local model object.
	 * @param {string} cfg.modelName - The remote model name.
	 * @returns {void}
	 */
	initialize( cfg ) {

		const me = this;

		// Call parent
		super.initialize( cfg );

		me._localModel 		= cfg.localModel;
		me._remoteModelName	= cfg.modelName;

		if ( me._localModelIs === undefined || me._localModelIs === null ) {

			me._localModelIs = "child";
		}
	}

	/**
	 * Relationships objects define a model relationship in a one-way manner,
	 * from a 'local' model to 'remote' model (so two relationship objects,
	 * attached to each respective model, is required to fully represent the
	 * two-way relationship). This property stores the 'local' model for this
	 * relationship.
	 *
	 * Unlike the parent/child properties, this property is highly predictable
	 * because it does not vary by relationship type. The local model will
	 * always be the same, regardless of whether or not it is the parent or the
	 * child.
	 *
	 * @public
	 * @type {Model.BaseModel}
	 */
	get localModel() {

		const me = this;

		return me._localModel;
	}

	/**
	 * Relationships objects define a model relationship in a one-way manner,
	 * from a 'local' model to 'remote' model (so two relationship objects,
	 * attached to each respective model, is required to fully represent the
	 * two-way relationship). This property stores the _name_ of the 'local'
	 * model for this relationship.
	 *
	 * Unlike the parent/child properties, this property is highly predictable
	 * because it does not vary by relationship type. The local model will
	 * always be the same, regardless of whether or not it is the parent or the
	 * child.
	 *
	 * @public
	 * @type {string}
	 */
	get localModelName() {

		const me = this;

		let lm = me.localModel;

		return lm.name;
	}

	/**
	 * Relationships objects define a model relationship in a one-way manner,
	 * from a 'local' model to 'remote' model (so two relationship objects,
	 * attached to each respective model, is required to fully represent the
	 * two-way relationship). This property stores the 'remote' model for this
	 * relationship.
	 *
	 * Unlike the parent/child properties, this property is highly predictable
	 * because it does not vary by relationship type. The local model will
	 * always be the same, regardless of whether or not it is the parent or the
	 * child.
	 *
	 * @public
	 * @type {Model.BaseModel}
	 */
	get remoteModel() {

		const me = this;

		if ( me._remoteModel === undefined || me._remoteModel === null ) {

			me._remoteModel = me._initModelObject( me.remoteModelName );
		}

		return me._remoteModel;
	}

	/**
	 * Relationships objects define a model relationship in a one-way manner,
	 * from a 'local' model to 'remote' model (so two relationship objects,
	 * attached to each respective model, is required to fully represent the
	 * two-way relationship). This property stores the _name_ of the 'remote'
	 * model for this relationship.
	 *
	 * Unlike the parent/child properties, this property is highly predictable
	 * because it does not vary by relationship type. The local model will
	 * always be the same, regardless of whether or not it is the parent or the
	 * child.
	 *
	 * @public
	 * @type {string}
	 */
	get remoteModelName() {

		const me = this;

		if ( me._remoteModel === undefined || me._remoteModel === null ) {

			return me._remoteModelName;
		}

		let remoteModel = me._remoteModel;

		return remoteModel.name;
	}

	/**
	 * Returns the child model in the relationship. The model that is considered
	 * to be the 'child' varies by relationship type.
	 *
	 * @public
	 * @type {Model.BaseModel}
	 */
	get childModel() {

		const me = this;

		let localPos = me._localModelIs;

		if ( localPos === "child" ) {

			return me.localModel;
		}

		return me.remoteModel;
	}

	/**
	 * Returns the _name_ of the child model in the relationship. The model that
	 * is considered to be the 'child' varies by relationship type.
	 *
	 * @public
	 * @type {string}
	 */
	get childModelName() {

		const me = this;

		let localPos = me._localModelIs;

		if ( localPos === "child" ) {

			return me.localModelName;
		}

		return me.remoteModelName;
	}

	/**
	 * Returns the parent model in the relationship. The model that is
	 * considered to be the 'parent' varies by relationship type.
	 *
	 * @public
	 * @type {Model.BaseModel}
	 */
	get parentModel() {

		const me = this;

		let localPos = me._localModelIs;

		if ( localPos === "child" ) {

			return me.remoteModel;
		}

		return me.localModel;
	}

	/**
	 * Returns the _name_ of the parent model in the relationship. The model
	 * that is considered to be the 'parent' varies by relationship type.
	 *
	 * @public
	 * @type {string}
	 */
	get parentModelName() {

		const me = this;

		let localPos = me._localModelIs;

		if ( localPos === "child" ) {

			return me.remoteModelName;
		}

		return me.localModelName;
	}

	/**
	 * Creates a {@link Resource.ResourceIdentifier} object that represents
	 * the remote (or "linked") resource in the relationship.
	 *
	 * @param {string} remoteId - The id of the remote resource.
	 * @returns {Resource.ResourceIdentifier} The resource identifier.
	 */
	createRemoteResourceIdentifier( remoteId ) {

		const me = this;

		let model = me.remoteModel;

		return model.createResourceIdentifier( remoteId );
	}

	/**
	 * Instantiates a model object and returns it.
	 *
	 * @private
	 * @param {string} modelName - The name of the model to spawn.
	 * @returns {Model.BaseModel} The instantiated model object.
	 */
	_initModelObject( modelName ) {

		const me = this;

		return me.$spawn( "models", modelName + "/" + modelName );
	}
}

module.exports = BaseRelationship;
