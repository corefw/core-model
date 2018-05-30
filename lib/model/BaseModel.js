/**
 * @file Defines the BaseModel class.
 *
 * @author Ashraful Sharif <sharif.ashraful@gmail.com>
 * @author Theodor Shaytanov <brainenjii@gmail.com>
 * @author Luke Chavers <luke@c2cschools.com>
 * @author Kevin Sanders <kevin@c2cschools.com>
 * @since 5.0.0
 * @license See LICENSE.md for details about licensing.
 * @copyright 2017 C2C Schools, LLC
 */

"use strict";

const BaseClass = require( "@corefw/common" ).common.BaseClass;

/**
 * The parent class for all models.
 *
 * @abstract
 * @memberOf Model
 * @extends Common.BaseClass
 */
class BaseModel extends BaseClass {

	/**
	 * @inheritDoc
	 *
	 * @param {?Object} modelConfig - A configuration object that will be
	 *     consumed by the newly instantiated class (object).
	 * @returns {void}
	 */
	_initialize( modelConfig ) {

		const me = this;

		// Call parent
		super._initialize( modelConfig );

		// Add Relationships
		me._initRelationships();
	}

	// noinspection JSUnusedGlobalSymbols
	/**
	 * Initializes a PathManager object and attaches it to this endpoint.
	 * PathManagers are used throughout the project by most classes, but they're
	 * usually inherited. Endpoints are the actual creators/source for path
	 * managers, and, so, they need to create their own.
	 *
	 * @private
	 * @returns {Common.PathManager} The path manager is instantiated and then
	 *     stored in the 'pathManager' property.
	 */
	initPathManager() {

		const me = this;

		// Dependencies...
		const PATH = me.$dep( "path" );

		let pm = me.getConfigValue( "pathManager" );

		if ( !pm ) {

			pm = super.initPathManager();
		}

		if ( !pm.hasPath( "modelLib" ) ) {

			pm.setPath( "modelLib", PATH.join( __dirname, ".." ) );
		}

		return pm;

		// // Dependencies...
		// const PATH = me.$dep( "path" );
		//
		// // We'll only ever need one...
		// if ( me.hasConfigValue( "pathManager" ) ) {
		//
		// 	return me.pathManager;
		// }
		//
		// // Instantiate the new path manager
		// let pm = super.initPathManager();
		//
		// pm.setPath( "modelLib", PATH.join( __dirname, ".." ) );
		//
		// return pm;
	}

	/**
	 * The _singular_ name of the model (e.g. "Person").
	 *
	 * @public
	 * @type {string}
	 */
	get name() {

		const me = this;

		return me.getConfigValue( "name" );
	}

	set name( /** string */ val ) {

		const me = this;

		// Dependencies
		const _ = me.$dep( "lodash" );

		// Force camel case
		val = _.camelCase( val );

		// Ensure that the first letter is capitalized
		val = val.substr( 0, 1 ).toUpperCase() + val.substr( 1 );

		// Ensure that the name is singular
		val = _.singularize( val );

		// Persist the value
		me.setConfigValue( "name", val );
	}

	/**
	 * The _plural_ name of the model (e.g. "People").
	 *
	 * @public
	 * @type {string}
	 * @readonly
	 */
	get pluralName() {

		const me = this;

		// Dependencies
		const _ = me.$dep( "lodash" );

		let name = me.name;

		return _.pluralize( name );
	}

	/**
	 * The _singular_ name of the model, in "snake case" (e.g. "group_address").
	 *
	 * @public
	 * @type {string}
	 * @readonly
	 */
	get snakeName() {

		const me = this;

		// Dependencies
		const _ = me.$dep( "lodash" );

		let name = me.name;

		return _.snakeCase( name );
	}

	/**
	 * Initializes and instantiates a new {@link Resource.Resource} object
	 * using {$link Common.BaseClass#$spawn}.
	 *
	 * @private
	 * @returns {Resource.Resource} The instantiated resource object.
	 */
	_initEmptyResource() {

		const me = this;

		return me.$spawn( "modelLib", "resource/Resource", {
			model: me,
		} );
	}

	/**
	 * Initializes and instantiates a new {@link Resource.ResourceCollection}
	 * object using {$link Common.BaseClass#$spawn}.
	 *
	 * @private
	 * @returns {Resource.ResourceCollection} The instantiated resource
	 *     collection.
	 */
	_initEmptyResourceCollection() {

		const me = this;

		return me.$spawn( "modelLib", "resource/ResourceCollection", {
			model: me,
		} );
	}

	/**
	 * Initializes and instantiates a new {@link Resource.ResourceIdentifier}
	 * object using {$link Common.BaseClass#$spawn}.
	 *
	 * @private
	 * @returns {Resource.ResourceIdentifier} The instantiated resource
	 *     identifier.
	 */
	_initEmptyResourceIdentifier() {

		const me = this;

		return me.$spawn( "modelLib", "resource/ResourceIdentifier", {
			model: me,
		} );
	}

	/**
	 * Initializes and instantiates a new
	 * {@link Resource.ResourceIdentifierCollection} object using
	 * {$link Common.BaseClass#$spawn}.
	 *
	 * @private
	 * @returns {Resource.ResourceIdentifierCollection} The instantiated
	 *     resource identifier collection.
	 */
	_initEmptyIdentifierCollection() {

		const me = this;

		return me.$spawn(
			"modelLib",
			"resource/ResourceIdentifierCollection",
			{
				model: me,
			}
		);
	}

	/**
	 * Creates a new {@link Resource.ResourceIdentifier} object for this model
	 * with a provided `id`.
	 *
	 * @public
	 * @param {string} id - The `id` of the resource identified by the new
	 *     {@link Resource.ResourceIdentifier} object.
	 * @returns {Resource.ResourceIdentifier} The resource identifier object.
	 */
	createResourceIdentifier( id ) {

		const me = this;

		let ri = me._initEmptyResourceIdentifier();

		ri.id = id;

		return ri;
	}

	/**
	 * The relationships that this model has with other models, represented
	 * as a plain-object of {@link Relationship.BaseRelationship} objects.
	 *
	 * @public
	 * @returns {Object} The relationships object.
	 */
	get relationships() {

		const me = this;

		if ( me._relationships === undefined ) {

			me._relationships = {};
		}

		return me._relationships;
	}

	/**
	 * Initializes the relationships that this model has with other models
	 * based on configuration data provided in this model's constructor.
	 *
	 * @private
	 * @returns {void} All modifications are made ByRef.
	 */
	_initRelationships() {

		const me = this;

		// Dependencies
		const _ = me.$dep( "lodash" );

		let conf = me.config;

		// Default relationship config
		_.each( conf.relationships, function ( relsOfType, relationshipType ) {

			_.each( relsOfType, function ( relationshipCfg, relationshipName ) {

				relationshipCfg.name = relationshipName;
				relationshipCfg.type = relationshipType;

				me.addRelationship( relationshipCfg );
			} );
		} );
	}

	/**
	 * Instantiates a single {@link Relationship.BaseRelationship} object to
	 * represent a relationship that this model has with another model.
	 *
	 * @public
	 * @param {Object} cfg - Configuration information for the new relationship.
	 * @returns {Relationship.BaseRelationship} The newly created relationship
	 *     object.
	 */
	addRelationship( cfg ) {

		const me = this;

		if ( me._relationships === undefined ) {

			me._relationships = {};
		}

		// Find class name
		let rClassName =
			cfg.type.substr( 0, 1 ).toUpperCase() +
			cfg.type.substr( 1 ) + "Relationship";

		cfg.relationshipClass = {
			name: rClassName,
		};

		// Add the local model
		cfg.localModel = me;

		// Spawn new relationship object
		let relObj = me.$spawn(
			"modelLib",
			"relationship/" + rClassName, cfg
		);

		// Persist it...
		me._relationships[ cfg.name ] = relObj;

		// Return the new relationship
		return relObj;
	}
}

module.exports = BaseModel;
