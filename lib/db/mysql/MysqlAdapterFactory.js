/**
 * @file Defines the MysqlAdapterFactory class.
 *
 * @author Luke Chavers <luke@c2cschools.com>
 * @author Kevin Sanders <kevin@c2cschools.com>
 * @since 5.0.0
 * @license See LICENSE.md for details about licensing.
 * @copyright 2017 C2C Schools, LLC
 */

"use strict";

// Important Note:
// This module only loads a single dependency, directly, which is the
// parent class for the class defined within. This is intended to force
// dependency loading through the parent class, by way of the `$dep()`
// method, in order to centralize dependency definition and loading.

const BaseClass = require( "@corefw/core-common" ).common.BaseClass;

/**
 * A utility class that loads Sequelize objects from the Sequelize module.
 *
 * @memberOf Database.Mysql
 * @extends Common.BaseClass
 */
class MysqlAdapterFactory extends BaseClass {

	/**
	 * Various MySQL connection settings.
	 *
	 * @protected
	 * @type {Object}
	 */
	get dbSettings() {

		const me = this;

		return {
			username : me.mysqlUsername,
			password : me.mysqlPassword,
			hostname : me.mysqlHostname,
			port     : me.mysqlPort,
		};
	}

	set dbSettings( /** Object */ val ) {

		const me = this;

		// Dependencies
		const TIPE = me.$dep( "tipe" );

		if ( TIPE( val ) !== "object" ) {

			return;
		}

		if ( val.username !== undefined ) {

			me.mysqlUsername = val.username;
		}

		if ( val.password !== undefined ) {

			me.mysqlPassword = val.password;
		}

		if ( val.hostname !== undefined ) {

			me.mysqlHostname = val.hostname;
		}

		if ( val.port !== undefined ) {

			me.mysqlPort = val.port;
		}
	}

	/**
	 * This username used when connecting to MySQL.
	 *
	 * @protected
	 * @type {string}
	 * @default process.env.MYSQL_USERNAME
	 */
	get mysqlUsername() {

		const me = this;

		return me.getConfigValue(
			"mysqlUsername",
			process.env.MYSQL_USERNAME
		);
	}

	set mysqlUsername( /** string */ val ) {

		const me = this;

		me.setConfigValue( "mysqlUsername", val );
	}

	/**
	 * This password used when connecting to MySQL.
	 *
	 * @protected
	 * @type {string}
	 * @default process.env.MYSQL_PASSWORD
	 */
	get mysqlPassword() {

		const me = this;

		return me.getConfigValue(
			"mysqlPassword",
			process.env.MYSQL_PASSWORD
		);
	}

	set mysqlPassword( /** string */ val ) {

		const me = this;

		me.setConfigValue( "mysqlPassword", val );
	}

	/**
	 * The hostname, or IP, of the MySQL server.
	 *
	 * @protected
	 * @type {string}
	 * @default process.env.MYSQL_HOST
	 */
	get mysqlHostname() {

		const me = this;

		return me.getConfigValue(
			"mysqlHostname",
			process.env.MYSQL_HOST
		);
	}

	set mysqlHostname( /** string */ val ) {

		const me = this;

		me.setConfigValue( "mysqlHostname", val );
	}

	/**
	 * The listen port for the remote MySQL server.
	 *
	 * @protected
	 * @type {number}
	 * @default process.env.MYSQL_PORT
	 */
	get mysqlPort() {

		const me = this;

		return me.getConfigValue(
			"mysqlPort",
			process.env.MYSQL_PORT
		);
	}

	set mysqlPort( /** number */ val ) {

		const me = this;

		me.setConfigValue( "mysqlPort", val );
	}

	/**
	 * Instantiates and returns a new Sequelize object, which serves
	 * as the database adapter for MySQL data sources.
	 *
	 * @public
	 * @param {Object} modelConfig - Specific MySQL settings that are needed
	 *     for, and used during, the adapter (Sequelize) instantiation.
	 * @param {string} modelConfig.database - The MySQL database that the
	 *     adapter should point to.
	 * @returns {Sequelize} A newly instantiated Sequelize object.
	 */
	getAdapter( modelConfig ) {

		const me = this;

		// Load MySQL settings from the environment
		let dbSettings = me.dbSettings;

		// Get the Sequelize class/module
		let AdapterClass = me.getAdapterClass();

		// Get logger object...
		let logger = me.logger;

		// Instantiate a new Sequelize object
		// noinspection UnnecessaryLocalVariableJS
		let seq = new AdapterClass(
			modelConfig.database,
			dbSettings.username,
			dbSettings.password,
			{
				host    : dbSettings.hostname,
				dialect : "mysql",
				define  : {
					timestamps      : true,
					paranoid        : false,
					underscored     : true,
					freezeTableName : true,
					createdAt       : "created_datetime",
					updatedAt       : "updated_datetime",
				},
				logging: function ( str ) {

					logger.log( "debug", "sequelize.log", "[Sequelize] " + str );
				},
			}
		);

		// Return the new object
		return seq;
	}

	/**
	 * Returns the Sequelize class, which has a number of useful static
	 * variables and methods that can be used for various purposes.
	 *
	 * @public
	 * @returns {Sequelize} The uninstantiated sequelize class.
	 */
	getAdapterClass() {

		const me = this;

		// Dependencies
		const Sequelize = me.$dep( "sequelize" );

		me._applySequelizeModifications( Sequelize );

		return Sequelize;
	}

	/**
	 * Applies a number of changes and extensions to Sequelize,
	 * for our compatibility and convenience.
	 *
	 * @private
	 * @param {Sequelize} Sequelize - The uninstantiated sequelize class.
	 * @returns {void} All modifications are made ByRef.
	 */
	_applySequelizeModifications( Sequelize ) {

		const me = this;

		// Dependencies
		// const inherits				= me.$dep( "sequelize-inherits" );
		const SequelizeTypeInjector	= me.$dep( "SequelizeTypeInjector" );
		const TIPE					= me.$dep( "tipe" );

		// Return if we've already applied our mods
		if ( me._hasAppliedSequelizeMods !== undefined ) {

			return;
		}

		// Add type(s)
		// noinspection JSUnusedGlobalSymbols
		let VARBINARY = SequelizeTypeInjector.injectType( {
			Sequelize : Sequelize,
			name      : "VARBINARY",
			parent    : Sequelize.BLOB,
			methods   : {

				/**
				 * Returns the MySQL representation of the type.
				 *
				 * @returns {string} The MySQL representation of the type.
				 */
				toSql: function () {

					return "VARBINARY(" + this._length + ")";
				},

				/**
				 * Parses configuration options for the type.
				 *
				 * @param {Array} constArgs - Configuration options.
				 * @returns {void}
				 * @private
				 */
				_parseOptions: function ( constArgs ) {

					let opts = constArgs[ 0 ];

					if ( TIPE( opts ) === "object" ) {

						this.options = opts;

					} else {

						this.options.length = opts;
					}

					this._length = this.options.length || 1;
				},

				/**
				 * Converts a value to a hexadecimal literal.
				 *
				 * @param {*|Buffer} value - The value to convert.
				 * @returns {string} Hexadecimal literal.
				 * @private
				 */
				_stringify: function ( value ) {

					value = this._toBuffer( value );

					let hex = value.toString( "hex" );

					return this._hexify( hex );
				},

				/**
				 * Converts a value to a Buffer.
				 *
				 * @param {*} value - The value to convert to a Buffer.
				 * @returns {Buffer} The value converted to a Buffer.
				 * @private
				 */
				_toBuffer: function ( value ) {

					if ( !Buffer.isBuffer( value ) ) {

						if ( Array.isArray( value ) ) {

							// Newer Node -> value = Buffer.from( value );
							value = new Buffer( value );

						} else {

							// Newer Node -> value = Buffer.from( value.toString(), "hex" );
							value = String( value );
							value = value.replace( /[^a-f0-9]/ig, "" ).toLowerCase();
							value = new Buffer( value, "hex" );
						}
					}

					return value;
				},

				/**
				 * Converts a value to a hexadecimal literal by
				 * prepending 0x to the value.
				 *
				 * @param {string} hex - Hexadecimal string.
				 * @returns {string} Hexadecimal literal.
				 * @private
				 */
				_hexify: function ( hex ) {

					return "0x" + hex;
				},
			},
		} );

		SequelizeTypeInjector.injectType( {
			Sequelize : Sequelize,
			name      : "BINARYUUID",
			parent    : VARBINARY,
			methods   : {

				/**
				 * Parses configuration options for the type.
				 *
				 * @param {Array} constArgs - Configuration options.
				 * @returns {void}
				 * @private
				 */
				_parseOptions: function ( constArgs ) {

					this.options = constArgs[ 0 ];

					if ( TIPE( this.options ) !== "object" ) {

						this.options = {};
					}

					this.options.length = 16;
					this._length = 16;
				},
			},
		} );

		// So that we don't do this again
		me._hasAppliedSequelizeMods = true;
	}

	/**
	 * Creates and returns a static utility object with methods that
	 * facilitate field definition presets for Sequelize.
	 *
	 * @public
	 * @returns {Object} A 'presets' utility.
	 */
	getAdapterFieldPresets() {

		const me = this;

		// Dependencies
		const _			= me.$dep( "lodash" );
		const TIPE		= me.$dep( "tipe" );
		const MOMENT	= me.$dep( "moment" );
		const Sequelize	= me.$dep( "sequelize" );

		// Init the static preset utility object
		let presets = {};

		/**
		 * This static method for the presets utility object is the
		 * main entry point for its logic.
		 *
		 * @public
		 * @param {Object[]} fieldList - A list of Sequelize field objects.
		 * @returns {Object} The same field list as it was passed, but with
		 *     presets applied.
		 */
		presets.apply = function applyPresetsToFieldList( fieldList ) {

			// Iterate over each field in the list
			_.each( fieldList, function ( fieldObj, fieldName ) {

				// We're looking for fields with a 'preset' property.
				if ( fieldObj.preset !== undefined ) {

					// Preset values MUST be functions...
					if ( TIPE( fieldObj.preset ) === "function" ) {

						// Capture the preset function
						let fnPreset = fieldObj.preset;

						// Execute the preset function
						fieldList[ fieldName ] = fnPreset(
							fieldObj,
							{
								fieldName : fieldName,
								factory   : me,
								fieldList : fieldList,
								presets   : presets,
							}
						);
					}

					// The 'preset' property is not native to Sequelize,
					// so we remove it to avoid any trouble...
					delete fieldObj.preset;
				}
			} );

			return fieldList;
		};

		/**
		 * Applies field presets for fields that contain UUIDs in binary
		 * format (VARBINARY[16]).
		 *
		 * @public
		 * @param {Object} fieldObj - Existing field settings that will be
		 *     extended with the presets configuration(s).
		 * @param {Object} refs - An object containing useful references that
		 *     the preset can use in its operations.
		 * @param {string} refs.fieldName - The name of the field that presets
		 *     are being applied to.
		 * @param {MysqlAdapterFactory} refs.factory - This adapter factory.
		 * @param {Object} refs.fieldList - The entire field list that was
		 *     passed to the #apply() method.
		 * @param {Object} refs.presets - The preset utility object.
		 * @returns {Object} The updated field object, with presets applied.
		 */
		presets.BINARYUUID = function Preset_BINARYUUID( fieldObj, refs ) { // eslint-disable-line camelcase

			// Apply the 'type' of the same name...
			fieldObj.type = Sequelize.BINARYUUID;

			// Apply a getter...
			fieldObj.get = function Preset_BINARYUUID_Getter() { // eslint-disable-line camelcase

				// Get the raw value...
				let val = this.getDataValue( refs.fieldName );

				// Parse
				val = forceToProperUuid( val );

				// All done...
				return val;
			};

			// Apply a setter...
			fieldObj.set = function Preset_BINARYUUID_Setter( val ) { // eslint-disable-line camelcase

				// Parse
				val = forceToProperUuid( val );

				// Cast to Buffer
				val = uuidToBuffer( val );

				// All done...
				this.setDataValue( refs.fieldName, val );
			};

			// Preset is applied...
			return fieldObj;
		};

		/**
		 * Applies field presets for fields that contain date/time values.
		 * Mainly, this preset helps with the formatting, especially into
		 * ISO9801 strings.
		 *
		 * @public
		 * @param {Object} fieldObj - Existing field settings that will be
		 *     extended with the presets configuration(s).
		 * @param {Object} refs - An object containing useful references that
		 *     the preset can use in its operations.
		 * @param {string} refs.fieldName - The name of the field that presets
		 *     are being applied to.
		 * @param {MysqlAdapterFactory} refs.factory - This adapter factory.
		 * @param {Object} refs.fieldList - The entire field list that was
		 *     passed to the #apply() method.
		 * @param {Object} refs.presets - The preset utility object.
		 * @returns {Object} The updated field object, with presets applied.
		 */
		presets.STRDATETIME = function Preset_STRDATETIME( fieldObj, refs ) { // eslint-disable-line camelcase

			// Apply the 'type' for dates
			fieldObj.type = Sequelize.DATE;

			// Apply a getter...
			fieldObj.get = function Preset_STRDATETIME_Getter() { // eslint-disable-line camelcase

				// Get the raw value...
				let val = this.getDataValue( refs.fieldName );

				// Convert to a moment object
				val = new MOMENT( val );

				// Force to UTC
				val.utc();

				// ...and, finally, convert to string
				val = val.toISOString();

				// All done...
				return val;
			};

			// Apply a setter...
			fieldObj.set = function Preset_STRDATETIME_Setter( val ) { // eslint-disable-line camelcase

				// Convert to a moment object
				try {

					val = new MOMENT( val );

				} catch ( err ) {

					throw new Error(
						"Invalid date/time value; this field will accept any value compatible with Moment.js."
					);
				}

				// Force to UTC
				val.utc();

				// Convert to standard date object
				val = val.toDate();

				// All done...
				this.setDataValue( refs.fieldName, val );
			};

			// Preset is applied...
			return fieldObj;
		};

		/**
		 * Applies field presets for ENUM fields that represent a boolean using
		 * 'yes' and 'no' values.
		 *
		 * @public
		 * @param {Object} fieldObj - Existing field settings that will be
		 *     extended with the presets configuration(s).
		 * @param {Object} refs - An object containing useful references that
		 *     the preset can use in its operations.
		 * @param {string} refs.fieldName - The name of the field that presets
		 *     are being applied to.
		 * @param {MysqlAdapterFactory} refs.factory - This adapter factory.
		 * @param {Object} refs.fieldList - The entire field list that was
		 *     passed to the #apply() method.
		 * @param {Object} refs.presets - The preset utility object.
		 * @returns {Object} The updated field object, with presets applied.
		 */
		presets.BOOLYESNO = function Preset_BOOLYESNO( fieldObj, refs ) { // eslint-disable-line camelcase

			// Apply the 'type' for enums
			fieldObj.type = Sequelize.ENUM;

			// This preset allows two possible values: 'no' or 'yes'
			fieldObj.values = [ "no", "yes" ];

			// If a defaultValue is provided, we will ensure that it
			// is either yes, or no, but will respect it.
			if ( fieldObj.defaultValue !== "yes" ) {

				fieldObj.defaultValue = "no";
			}

			// Apply a getter...
			fieldObj.get = function Preset_BOOLYESNO_Getter() { // eslint-disable-line camelcase

				// Get the raw value...
				let val = this.getDataValue( refs.fieldName );

				// Convert the literal values
				val = forceToBool( val );

				// All done...
				return val;
			};

			// Apply a setter...
			fieldObj.set = function Preset_BOOLYESNO_Setter( val ) { // eslint-disable-line camelcase

				// Force to boolean
				val = forceToBool( val );

				// Convert to string
				if ( val === true ) {

					val = "yes";

				} else {

					val = "no";
				}

				// All done...
				this.setDataValue( refs.fieldName, val );
			};

			// Preset is applied...
			return fieldObj;
		};

		// Return the preset utility object
		return presets;

		// -- Utility/Helpers for the presets ----------------------------------

		/**
		 * A utility function, used by one more or of the field preset methods,
		 * that liberally casts variables to the BOOLEAN type.
		 *
		 * @private
		 * @param {*} val - The variable that should be converted to a BOOLEAN.
		 * @returns {boolean} The value converted to a BOOLEAN.
		 */
		function forceToBool( val ) {

			// Convert the literal values
			if ( TIPE( val ) === "string" ) {

				val = val.toLowerCase();

				if ( val === "yes" ) {

					val = true;
				}

				if ( val === "no" ) {

					val = false;
				}
			}

			// Evaluate anything else as truthy/falsy
			val = Boolean( val );

			// All done...
			return val;
		}

		/**
		 * A utility function, used by one more or of the field preset methods,
		 * that converts UUID strings into Buffer objects, the native storage
		 * type for binary data in Sequelize.
		 *
		 * @private
		 * @param {*} val - The variable that should be converted to a Buffer.
		 * @returns {Buffer} The value converted to a Buffer.
		 */
		function uuidToBuffer( val ) {

			// Remove all non-hex characters (incl dashes)
			val = val.replace( /[^a-f0-9]/g, "" );

			// Create new Buffer
			val = new Buffer( val, "hex" );

			// Done...
			return val;
		}

		/**
		 * A utility function, used by one more or of the field preset methods,
		 * that liberally casts variables the STRING type and UUID format.
		 *
		 * @private
		 * @param {*|Buffer|string} val - The variable that should be converted
		 *     to a UUID.
		 * @returns {string} The value converted to a UUID.
		 */
		function forceToProperUuid( val ) {

			// Convert it to a string, if it is a Buffer...
			if ( Buffer.isBuffer( val ) ) {

				val = val.toString( "hex" );
			}

			// Convert it to a string if it is anything else...
			if ( !_.isString( val ) ) {

				val = String( val );
			}

			// Remove invalid (non-hex) characters
			val = val.replace( /[^a-fA-F0-9]/g, "" );

			// Force the value to exactly 32 characters...
			if ( val.length < 32 ) {

				// If it's too short, pad with zeros...
				val = _.padEnd( val, 32, "0" );

			} else if ( val.length > 32 ) {

				// If it's too long, trim it...
				val = val.substr( 0, 32 );
			}

			// Make it lower case...
			val =	val.toLowerCase();

			// Insert dashes...
			val =	val.substr( 0, 8 ) + "-" +
					val.substr( 8, 4 ) + "-" +
					val.substr( 12, 4 ) + "-" +
					val.substr( 16, 4 ) + "-" +
					val.substr( 20 );

			// Done
			return val;
		}
	}
}

module.exports = MysqlAdapterFactory;
