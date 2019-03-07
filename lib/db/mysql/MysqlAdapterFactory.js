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

const BaseClass = require( "@corefw/common" ).common.BaseClass;

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

	set dbSettings( /** Object */ value ) {

		const me = this;

		// Dependencies
		const TIPE = me.$dep( "tipe" );

		if ( TIPE( value ) !== "object" ) {

			return;
		}

		if ( value.username !== undefined ) {

			me.mysqlUsername = value.username;
		}

		if ( value.password !== undefined ) {

			me.mysqlPassword = value.password;
		}

		if ( value.hostname !== undefined ) {

			me.mysqlHostname = value.hostname;
		}

		if ( value.port !== undefined ) {

			me.mysqlPort = value.port;
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

	set mysqlUsername( /** string */ value ) {

		const me = this;

		me.setConfigValue( "mysqlUsername", value );
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

	set mysqlPassword( /** string */ value ) {

		const me = this;

		me.setConfigValue( "mysqlPassword", value );
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

	set mysqlHostname( /** string */ value ) {

		const me = this;

		me.setConfigValue( "mysqlHostname", value );
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

	set mysqlPort( /** number */ value ) {

		const me = this;

		me.setConfigValue( "mysqlPort", value );
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
				host             : dbSettings.hostname,
				dialect          : "mysql",
				// NOTE: Removes deprecation warning
				// https://github.com/sequelize/sequelize/issues/8417
				// http://docs.sequelizejs.com/manual/tutorial/querying.html#operators-security
				operatorsAliases : false,
				define           : {
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
		const TIPE					= me.$dep( "tipe" );
		const SequelizeTypeInjector	= me.$dep( require( "./SequelizeTypeInjector" ) );
		const _						= me.$dep( "lodash" );

		// Return if we've already applied our mods
		if ( me._hasAppliedSequelizeMods !== undefined ) {

			return;
		}

		// Add type(s)

		/**
		 * ZERO_NULL_DATE
		 *
		 * Date only type where "zero" dates are represented as NULL.
		 */

		SequelizeTypeInjector.injectType( {
			Sequelize     : Sequelize,
			name          : "ZERO_NULL_DATE",
			parent        : Sequelize.DATEONLY,
			staticMethods : {

				parse: function parse( value ) {

					return value.string();
				},
			},
			methods: {

				_stringify: function _stringify( date, options ) {

					// Special "zero" date handling...

					if ( date === "0000-00-00" ) {

						return date;
					}

					return Sequelize.DATEONLY()._stringify( date, options );
				},
			},
		} );

		SequelizeTypeInjector.injectType( {
			Sequelize     : Sequelize,
			name          : "ZERO_NULL_DATETIME",
			parent        : Sequelize.DATE,
			staticMethods : {

				parse: function parse( value ) {

					return value.string();
				},
			},
			methods: {

				_sanitize: function _sanitize( value ) {

					return value;
				},

				_stringify: function _stringify( value ) {

					return value;
				},
			},
		} );

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

				_sanitize( value ) {

					// Convert NULL/Undefined to zero UUID buffer...

					if ( _.isNil( value ) ) {

						value = MysqlAdapterFactory.uuidToBuffer( "00000000-0000-0000-0000-000000000000" );
					}

					return value;
				},

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

		// Presets For Common Field Types

		/**
		 * Applies presets for fields that contain STRING values.
		 *
		 * @param {integer} length - Maximum string length.
		 * @returns {function(Object): Object} The updated field object, with presets applied.
		 */
		presets.STRING = function ( length ) {

			return function Preset_STRING( fieldObj ) { // eslint-disable-line camelcase

				fieldObj.type = Sequelize.STRING( length );

				_.defaults(
					fieldObj,
					{
						allowNull    : false,
						defaultValue : "",
					}
				);

				return fieldObj;
			};
		};

		/**
		 * Applies presets for fields that contain ENUM values.
		 *
		 * @param {Object} fieldObj - Existing field settings that will be
		 *     extended with the presets configuration(s).
		 * @returns {Object} The updated field object, with presets applied.
		 */
		presets.ENUM = function Preset_ENUM( fieldObj ) { // eslint-disable-line camelcase

			fieldObj.type = Sequelize.ENUM;

			_.defaults(
				fieldObj,
				{
					allowNull: false,
				}
			);

			return fieldObj;
		};

		/**
		 * Applies presets for fields that contain INTEGER values.
		 *
		 * @param {Object} fieldObj - Existing field settings that will be
		 *     extended with the presets configuration(s).
		 * @returns {Object} The updated field object, with presets applied.
		 */
		presets.INTEGER_11 = function Preset_INTEGER_11( fieldObj ) { // eslint-disable-line camelcase

			fieldObj.type = Sequelize.INTEGER( 11 );

			_.defaults(
				fieldObj,
				{
					allowNull    : false,
					defaultValue : 0,
				}
			);

			return fieldObj;
		};

		/**
		 * Applies presets for fields that contain DECIMAL(10,2) values.
		 *
		 * @param {Object} fieldObj - Existing field settings that will be
		 *     extended with the presets configuration(s).
		 * @returns {Object} The updated field object, with presets applied.
		 */
		presets.DECIMAL_10_2 = function Preset_DECIMAL_10_2( fieldObj ) { // eslint-disable-line camelcase

			fieldObj.type = Sequelize.DECIMAL( 10, 2 );

			_.defaults(
				fieldObj,
				{
					allowNull    : false,
					defaultValue : "0.00",
				}
			);

			return fieldObj;
		};

		/**
		 * Applies presets for fields that contain TINYTEXT values.
		 *
		 * @param {Object} fieldObj - Existing field settings that will be
		 *     extended with the presets configuration(s).
		 * @returns {Object} The updated field object, with presets applied.
		 */
		presets.TINYTEXT = function Preset_TINYTEXT( fieldObj ) { // eslint-disable-line camelcase

			fieldObj.type = Sequelize.TEXT( "tiny" );

			_.defaults(
				fieldObj,
				{
					allowNull    : false,
					defaultValue : "",
				}
			);

			return fieldObj;
		};

		/**
		 * Applies presets for fields that contain MEDIUMTEXT values.
		 *
		 * @param {Object} fieldObj - Existing field settings that will be
		 *     extended with the presets configuration(s).
		 * @returns {Object} The updated field object, with presets applied.
		 */
		presets.MEDIUMTEXT = function Preset_MEDIUMTEXT( fieldObj ) { // eslint-disable-line camelcase

			fieldObj.type = Sequelize.TEXT( "medium" );

			_.defaults(
				fieldObj,
				{
					allowNull    : false,
					defaultValue : "",
				}
			);

			return fieldObj;
		};

		/**
		 * Applies presets for fields that contain LONGTEXT values.
		 *
		 * @param {Object} fieldObj - Existing field settings that will be
		 *     extended with the presets configuration(s).
		 * @returns {Object} The updated field object, with presets applied.
		 */
		presets.LONGTEXT = function Preset_LONGTEXT( fieldObj ) { // eslint-disable-line camelcase

			fieldObj.type = Sequelize.TEXT( "long" );

			_.defaults(
				fieldObj,
				{
					allowNull    : false,
					defaultValue : "",
				}
			);

			return fieldObj;
		};

		/**
		 * Applies presets for fields that contain only DATE values.
		 *
		 * Blank or empty date values will be represented by the special "zero"
		 * data string '0000-00-00' internally and NULL externally.
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
		presets.ZERO_NULL_DATE = function Preset_ZERO_NULL_DATE( fieldObj, refs ) { // eslint-disable-line camelcase

			fieldObj.type = Sequelize.ZERO_NULL_DATE;

			_.defaults(
				fieldObj,
				{
					allowNull    : false,
					defaultValue : null,
				}
			);

			fieldObj.get = function Preset_ZERO_NULL_DATE_Getter() { // eslint-disable-line camelcase

				let value = this.getDataValue( refs.fieldName );

				// Convert "zero" date to NULL

				if ( value === "0000-00-00" ) {

					value = null;
				}

				return value;
			};

			fieldObj.set = function Preset_ZERO_NULL_DATE_Setter( value ) { // eslint-disable-line camelcase

				// Convert NULL/Undefined to "zero" date

				if ( _.isNil( value ) ) {
					value = "0000-00-00";
				}

				this.setDataValue( refs.fieldName, value );
			};

			// Preset is applied...
			return fieldObj;
		};

		/**
		 * Applies presets for fields that contain UUIDs in binary format
		 * (VARBINARY[16]).
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

			fieldObj.type = Sequelize.BINARYUUID;

			_.defaults(
				fieldObj,
				{
					allowNull    : false,
					defaultValue : null,
				}
			);

			// Apply a getter...
			fieldObj.get = function Preset_BINARYUUID_Getter() { // eslint-disable-line camelcase

				// Get the raw value...
				let value = this.getDataValue( refs.fieldName );

				// Parse
				value = MysqlAdapterFactory.forceToProperUuid( value );

				// Convert zero UUID to NULL
				if ( value === "00000000-0000-0000-0000-000000000000" ) {

					value = null;
				}

				// All done...
				return value;
			};

			// Apply a setter...
			fieldObj.set = function Preset_BINARYUUID_Setter( value ) { // eslint-disable-line camelcase

				// Parse
				value = MysqlAdapterFactory.forceToProperUuid( value );

				// Cast to Buffer
				value = MysqlAdapterFactory.uuidToBuffer( value );

				// All done...
				this.setDataValue( refs.fieldName, value );
			};

			// Preset is applied...
			return fieldObj;
		};

		/**
		 * Applies presets for fields that contain DATETIME values.
		 * Mainly, this preset helps with the formatting, especially into
		 * ISO9801 strings.
		 *
		 * Blank or empty date/time values will be represented by the special
		 * "zero" date string '0000-00-00 00:00:00' internally and NULL
		 * externally.
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
		presets.ZERO_NULL_DATETIME = function Preset_ZERO_NULL_DATETIME( fieldObj, refs ) { // eslint-disable-line camelcase

			fieldObj.type = Sequelize.ZERO_NULL_DATETIME;

			_.defaults(
				fieldObj,
				{
					allowNull    : false,
					defaultValue : null,
				}
			);

			// Apply a getter...
			fieldObj.get = function Preset_ZERO_NULL_DATETIME_Getter() { // eslint-disable-line camelcase

				let value = this.getDataValue( refs.fieldName );

				// Convert "zero" date/time to NULL

				if ( value === "0000-00-00 00:00:00" ) {

					value = null;
				}

				if ( value !== null ) {

					// Convert to a moment object
					value = new MOMENT( value );

					// Force to UTC
					value.utc();

					// ...and, finally, convert to string
					value = value.toISOString();
				}

				return value;
			};

			// Apply a setter...
			fieldObj.set = function Preset_ZERO_NULL_DATETIME_Setter( value ) { // eslint-disable-line camelcase

				if ( _.isNil( value ) ) {

					// Convert NULL/Undefined to "zero" date/time

					value = "0000-00-00 00:00:00";

				} else {

					// Convert to a moment object

					try {

						value = new MOMENT( value );

						// Force to UTC
						value.utc();

						// Convert to string
						value = value.format( "YYYY-MM-DD HH:mm:ss" );

					} catch ( err ) {

						throw new Error(
							"Invalid date/time value; this field will accept any value compatible with Moment.js."
						);
					}
				}

				this.setDataValue( refs.fieldName, value );
			};

			// Preset is applied...
			return fieldObj;
		};

		/**
		 * Applies presets for ENUM fields that represent a boolean using
		 * 'yes'/'no' values internally and true/false values externally.
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

			_.defaults(
				fieldObj,
				{
					allowNull    : false,
					defaultValue : false,
				}
			);

			// If a defaultValue is provided, we will ensure that it
			// is either yes, or no, but will respect it.

			if ( fieldObj.defaultValue === true || fieldObj.defaultValue === 1 ) {

				fieldObj.defaultValue = "yes";
			}

			if ( fieldObj.defaultValue !== "yes" ) {

				fieldObj.defaultValue = "no";
			}

			// Apply a getter...
			fieldObj.get = function Preset_BOOLYESNO_Getter() { // eslint-disable-line camelcase

				// Get the raw value...
				let value = this.getDataValue( refs.fieldName );

				// Convert the literal values
				value = MysqlAdapterFactory.forceToBool( value );

				// All done...
				return value;
			};

			// Apply a setter...
			fieldObj.set = function Preset_BOOLYESNO_Setter( value ) { // eslint-disable-line camelcase

				// Force to boolean
				value = MysqlAdapterFactory.forceToBool( value );

				// Convert to string
				if ( value === true ) {

					value = "yes";

				} else {

					value = "no";
				}

				// All done...
				this.setDataValue( refs.fieldName, value );
			};

			// Preset is applied...
			return fieldObj;
		};

		// Return the preset utility object
		return presets;
	}

	// -- Utility/Helpers for the presets ----------------------------------

	/**
	 * A utility function, used by one more or of the field preset methods,
	 * that liberally casts variables to the BOOLEAN type.
	 *
	 * @private
	 * @param {*} value - The variable that should be converted to a BOOLEAN.
	 * @returns {boolean} The value converted to a BOOLEAN.
	 */
	static forceToBool( value ) {

		const TIPE = MysqlAdapterFactory.$dep( "tipe" );

		// Convert the literal values
		if ( TIPE( value ) === "string" ) {

			value = value.toLowerCase();

			if ( value === "yes" ) {

				value = true;
			}

			if ( value === "no" ) {

				value = false;
			}
		}

		// Evaluate anything else as truthy/falsy
		value = Boolean( value );

		// All done...
		return value;
	}

	/**
	 * A utility function, used by one or more of the field preset methods,
	 * that liberally casts variables to the STRING type and UUID format.
	 *
	 * @private
	 * @param {*|Buffer|string} value - The variable that should be
	 *     converted to a UUID.
	 * @returns {string} The value converted to a UUID.
	 */
	static forceToProperUuid( value ) {

		const _ = MysqlAdapterFactory.$dep( "lodash" );

		// Convert it to a string, if it is a Buffer...
		if ( Buffer.isBuffer( value ) ) {

			value = value.toString( "hex" );
		}

		// Convert it to a string if it is anything else...
		if ( !_.isString( value ) ) {

			value = String( value );
		}

		// Remove invalid (non-hex) characters
		value = value.replace( /[^a-fA-F0-9]/g, "" );

		// Force the value to exactly 32 characters...
		if ( value.length < 32 ) {

			// If it's too short, pad with zeros...
			value = _.padEnd( value, 32, "0" );

		} else if ( value.length > 32 ) {

			// If it's too long, trim it...
			value = value.substr( 0, 32 );
		}

		// Make it lower case...
		value = value.toLowerCase();

		// Insert dashes...
		value =
			value.substr( 0, 8 ) + "-" +
			value.substr( 8, 4 ) + "-" +
			value.substr( 12, 4 ) + "-" +
			value.substr( 16, 4 ) + "-" +
			value.substr( 20 );

		// Done
		return value;
	}

	/**
	 * A utility function, used by one more or of the field preset methods,
	 * that converts UUID strings into Buffer objects, the native storage
	 * type for binary data in Sequelize.
	 *
	 * @private
	 * @param {*} value - The variable that should be converted to a Buffer.
	 * @returns {Buffer} The value converted to a Buffer.
	 */
	static uuidToBuffer( value ) {

		// Remove all non-hex characters (incl dashes)
		value = value.replace( /[^a-f0-9]/g, "" );

		// Create new Buffer
		value = new Buffer( value, "hex" );

		// Done...
		return value;
	}
}

module.exports = MysqlAdapterFactory;
