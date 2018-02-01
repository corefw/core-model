/**
 * @file Defines the SequelizeTypeInjector class.
 *
 * @author Luke Chavers <luke@c2cschools.com>
 * @author Kevin Sanders <kevin@c2cschools.com>
 * @since 5.0.0
 * @license See LICENSE.md for details about licensing.
 * @copyright 2017 C2C Schools, LLC
 */

"use strict";

// Important Note:
// This module only loads a single dependency, directly, which is the parent
// class for the class defined within. This is intended to force dependency
// loading through the parent class, by way of the `$dep()` method, in order to
// centralize dependency definition and loading.

const BaseClass = require( "@corefw/common" ).common.BaseClass;

/**
 * This utility class can be used to inject new field types (especially MySQL
 * field types) into Sequelize.
 *
 * @memberOf Database.Mysql
 * @extends Common.BaseClass
 */
class SequelizeTypeInjector extends BaseClass {

	/**
	 * This special static method is evaluated, exclusively, by
	 * {@link Common.BaseClass} when this class (or any of its children) are
	 * loaded through it.
	 *
	 * Note: Classes that return TRUE for this static method will be assumed
	 * to also require instantiation. Thus, `#$forceInstantiation` will be
	 * assumed to also return TRUE.
	 *
	 * @protected
	 * @returns {boolean} When TRUE, the `$dep()` loader will only instantiate
	 *     an object from this class once. Subsequent requests for this object
	 *     will yield the same instance.
	 */
	static $singleton() {

		return true;
	}

	/**
	 * Injects a new data type into Sequelize.
	 *
	 * @param {Object} cfg - Configuration options.
	 * @returns {Object} The newly injected type.
	 */
	injectType( cfg ) {

		const me = this;

		// Dependencies
		const Sequelize	= cfg.Sequelize;
		const inherits 	= me.$dep( "sequelize-inherits" );
		const _ 		= me.$dep( "lodash" );
		const TIPE		= me.$dep( "tipe" );

		let defaultMethods;
		let defaultStaticMethods;

		/**
		 * Define the constructor for the new type.
		 *
		 * @constructor
		 * @param {*} [a] - Parameter 1
		 * @param {*} [b] - Parameter 2
		 * @param {*} [c] - Parameter 3
		 * @param {*} [d] - Parameter 4
		 * @param {*} [e] - Parameter 5
		 * @param {*} [f] - Parameter 6
		 *
		 * @returns {CustomSequelizeType} New type object.
		 */
		function CustomSequelizeType( a, b, c, d, e, f ) {

			if ( !( this instanceof CustomSequelizeType ) ) {

				return new CustomSequelizeType( a, b, c, d, e, f );
			}

			this.options = {};

			// noinspection JSUnresolvedFunction
			this._parseOptions( arguments );
		}

		// Inherit the parent type
		inherits( CustomSequelizeType, cfg.parent );

		// A convenience reference
		// to the prototype
		let ntp = CustomSequelizeType.prototype;

		// Apply key
		CustomSequelizeType.prototype.key = CustomSequelizeType.key = cfg.name;

		// -- methods --

		// Init Methods Object
		if ( TIPE( cfg.methods ) !== "object" ) {

			cfg.methods = {};
		}

		if ( TIPE( cfg.staticMethods ) !== "object" ) {

			cfg.staticMethods = {};
		}

		// Create default methods
		defaultMethods = {
			_parseOptions: function () {

				// Do Nothing
			},
		};

		defaultStaticMethods = {
			extend: function ( oldType ) {

				return new CustomSequelizeType( oldType.options );
			},
		};

		// Merge methods
		cfg.methods = Object.assign(
			{},
			defaultMethods,
			cfg.methods
		);

		cfg.staticMethods = Object.assign(
			{},
			defaultStaticMethods,
			cfg.staticMethods
		);

		// Apply instance methods to the prototype
		_.each( cfg.methods, function ( fn, methodName ) {

			ntp[ methodName ] = fn;
		} );

		// Apply static methods to the type
		_.each( cfg.staticMethods, function ( fn, methodName ) {

			CustomSequelizeType[ methodName ] = fn;
		} );

		// No idea... yet...
		if ( cfg.types === undefined ) {

			CustomSequelizeType.types.mysql = [ cfg.name ];

		} else {

			CustomSequelizeType.types.mysql = cfg.types;
		}

		// Apply the new type
		Sequelize[ cfg.name ]		= CustomSequelizeType;
		Sequelize.mysql[ cfg.name ]	= CustomSequelizeType;

		// Return the new type
		return Sequelize[ cfg.name ];
	}
}

module.exports = SequelizeTypeInjector;
