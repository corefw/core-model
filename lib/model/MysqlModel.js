/* eslint-disable camelcase */
/**
 * @file Defines the MysqlModel class.
 *
 * @author Luke Chavers <luke@c2cschools.com>
 * @author Kevin Sanders <kevin@c2cschools.com>
 * @since 5.0.0
 * @license See LICENSE.md for details about licensing.
 * @copyright 2017 C2C Schools, LLC
 */

"use strict";

const BaseModel	= require( "./BaseModel" );
const ERRORS	= require( "../errors" );

/**
 * The parent class for all data models that correlate directly to a MySQL
 * table.
 *
 * @memberOf Model
 * @extends Model.BaseModel
 */
class MysqlModel extends BaseModel {

	// <editor-fold desc="--- Virtual Property DocBlocks -------------------------------------------------------------">

	/**
	 * @property _adapterClass A modified Sequelize client.
	 *
	 * @access private
	 * @type {Sequelize}
	 */

	// </editor-fold>

	/**
	 * @inheritDoc
	 *
	 * This extends the default model initialization by applying a few patterns
	 * that are universal for all C2C MySQL tables.
	 *
	 * @param {?Object} modelConfig - A configuration object that will be
	 *     consumed by the newly instantiated class (object).
	 * @param {Object} [modelConfig.relationships] - Relationships.
	 * @param {Object<Relationship.BelongsToRelationship>} [modelConfig.relationships.belongsTo] - BelongsTo Relationships.
	 * @param {Object} [modelConfig.dbFieldMappings] - Field Mappings
	 * @returns {void}
	 */
	_initialize( modelConfig ) {

		const me = this;

		const TIPE = me.$dep( "tipe" );

		// Add Standard Relationship Configs
		if ( modelConfig.relationships === undefined ) {

			modelConfig.relationships = {};
		}

		if ( modelConfig.relationships.belongsTo === undefined ) {

			modelConfig.relationships.belongsTo = {};
		}

		if ( modelConfig.relationships.belongsTo.createdBy === undefined ) {

			modelConfig.relationships.belongsTo.createdBy = {
				modelName: "User",
			};
		}

		if ( modelConfig.relationships.belongsTo.updatedBy === undefined ) {

			modelConfig.relationships.belongsTo.updatedBy = {
				modelName: "User",
			};
		}

		// Ensure we have a field mappings object
		if ( TIPE( modelConfig.dbFieldMappings ) !== "object" ) {

			modelConfig.dbFieldMappings = {};
		}

		// For convenience
		let fm = modelConfig.dbFieldMappings;

		if ( TIPE( fm.attributes ) !== "object" ) {

			fm.attributes = {};
		}

		if ( TIPE( fm.meta ) !== "object" ) {

			fm.meta = {};
		}

		if ( TIPE( fm.relationships ) !== "object" ) {

			fm.relationships = {};
		}

		// Add Standard Field Mappings for attributes
		if ( fm.attributes.status === undefined ) {

			fm.attributes.status = "status";
		}

		// Add Standard Field Mappings for metadata
		if ( fm.meta.createdDateTime === undefined ) {

			fm.meta.createdDateTime = "created_datetime";
		}

		if ( fm.meta.updatedDateTime === undefined ) {

			fm.meta.updatedDateTime = "updated_datetime";
		}

		// Add Standard Field Mappings for relationships
		if ( fm.relationships.createdBy === undefined ) {

			fm.relationships.createdBy = "created_user_id";
		}

		if ( fm.relationships.updatedBy === undefined ) {

			fm.relationships.updatedBy = "updated_user_id";
		}

		// Call parent constructor
		super._initialize( modelConfig );
	}

	/**
	 * The name of the primary key for this model's correlating MySQL table.
	 * This is usually the name of the table plus `_id`, but it can be anything.
	 *
	 * @public
	 * @type {string}
	 * @default tableName + "_id"
	 */
	get databasePrimaryKey() {

		const me = this;

		return me.getConfigValue( "databasePrimaryKey",	me._resolvePrimaryKey );
	}

	// noinspection JSUnusedGlobalSymbols
	set databasePrimaryKey( /** string */ val ) {

		const me = this;

		me.setConfigValue( "databasePrimaryKey", val );
	}

	/**
	 * Resolves the primary key for this model when one is not provided in
	 * the model config; this method simply concatenates the name of the table
	 * with `_id`.
	 *
	 * @private
	 * @returns	{string} The primary key.
	 */
	_resolvePrimaryKey() {

		const me = this;

		return me.mysqlTable + "_id";
	}

	/**
	 * The MySQL adapter used to communicate with the MySQL server about this
	 * model. This method will return an INSTANTIATED adapter.
	 *
	 * @returns {Sequelize} An instantiated Sequelize object.
	 */
	get adapter() {

		const me = this;

		let factory = me.adapterFactory;

		if ( me._adapter === undefined ) {

			me._adapter = factory.getAdapter( {
				database: me.mysqlDatabase,
			} );
		}

		return me._adapter;
	}

	/**
	 * The MySQL adapter used to communicate with the MySQL server about this
	 * model. This method will return an UNINSTANTIATED, static, object.
	 *
	 * @returns {Sequelize} An uninstantiated/static Sequelize object.
	 */
	get adapterClass() {

		const me = this;

		let factory = me.adapterFactory;

		if ( me._adapterClass === undefined ) {

			me._adapterClass = factory.getAdapterClass();
		}

		return me._adapterClass;
	}

	/**
	 * Gets the presets object from the adapter factory, which can be used
	 * to abbreviate field definitions.
	 *
	 * @public
	 * @type {Object}
	 * @readonly
	 */
	get adapterFieldPresets() {

		const me = this;

		let factory = me.adapterFactory;

		if ( me._dbFieldPresets === undefined ) {

			me._dbFieldPresets = factory.getAdapterFieldPresets();
		}

		return me._dbFieldPresets;
	}

	/**
	 * A factory object used to create and instantiate MySQL adapters for
	 * use by this model in its database operations.
	 *
	 * @protected
	 * @type {Database.MysqlAdapterFactory}
	 * @readonly
	 */
	get adapterFactory() {

		const me = this;

		if ( me._adapterFactory === undefined ) {

			me._adapterFactory = me.$dep(
				require( "../db/mysql/MysqlAdapterFactory" ),
				{}
			);
		}

		return me._adapterFactory;
	}

	/**
	 * The name of the MySQL table that this model correlates with.
	 *
	 * @public
	 * @type {?string}
	 * @default null
	 */
	get mysqlTable() {

		const me = this;

		return me.getConfigValue( "mysqlTable", null );
	}

	set mysqlTable( /** ?string */ val ) {

		const me = this;

		me.setConfigValue( "mysqlTable", val );
	}

	/**
	 * The name of the MySQL database that houses the table that this model
	 * correlates with.
	 *
	 * @public
	 * @type {?string}
	 * @default null
	 */
	get mysqlDatabase() {

		const me = this;

		return me.getConfigValue( "mysqlDatabase", null );
	}

	// noinspection JSUnusedGlobalSymbols
	set mysqlDatabase( /** ?string */ val ) {

		const me = this;

		me.setConfigValue( "mysqlDatabase", val );
	}

	/**
	 * The database settings used to connect to MySQL. This property
	 * mirrors/aliases the settings stored within the adapter factory (as
	 * {@link Database.MysqlAdapterFactory#dbSettings}).
	 *
	 * @public
	 * @type {Object}
	 */
	get dbSettings() {

		const me = this;

		return me.adapterFactory.dbSettings;
	}

	// noinspection JSUnusedGlobalSymbols
	set dbSettings( /** Object */ val ) {

		const me = this;

		me.adapterFactory.dbSettings = val;
	}

	/**
	 * The username used when connecting to MySQL. This property mirrors/aliases
	 * the setting stored within the adapter factory (as
	 * {@link Database.MysqlAdapterFactory#mysqlUsername}).
	 *
	 * @public
	 * @type {string}
	 */
	get mysqlUsername() {

		const me = this;

		return me.adapterFactory.mysqlUsername;
	}

	set mysqlUsername( /** string */ val ) {

		const me = this;

		me.adapterFactory.mysqlUsername = val;
	}

	/**
	 * The password used when connecting to MySQL. This property mirrors/aliases
	 * the setting stored within the adapter factory (as
	 * {@link Database.MysqlAdapterFactory#mysqlPassword}).
	 *
	 * @public
	 * @type {string}
	 */
	get mysqlPassword() {

		const me = this;

		return me.adapterFactory.mysqlPassword;
	}

	set mysqlPassword( /** string */ val ) {

		const me = this;

		me.adapterFactory.mysqlPassword = val;
	}

	/**
	 * The hostname of the MySQL server. This property mirrors/aliases the
	 * setting stored within the adapter factory (as
	 * {@link Database.MysqlAdapterFactory#mysqlHostname}).
	 *
	 * @public
	 * @type {string}
	 */
	get mysqlHostname() {

		const me = this;

		return me.adapterFactory.mysqlHostname;
	}

	// noinspection JSUnusedGlobalSymbols
	set mysqlHostname( /** string */ val ) {

		const me = this;

		me.adapterFactory.mysqlHostname = val;
	}

	/**
	 * The listen port of the MySQL server. This property mirrors/aliases the
	 * setting stored within the adapter factory (as
	 * {@link Database.MysqlAdapterFactory#mysqlPort}).
	 *
	 * @public
	 * @type {number}
	 */
	get mysqlPort() {

		const me = this;

		return me.adapterFactory.mysqlPort;
	}

	set mysqlPort( /** number */ val ) {

		const me = this;

		me.adapterFactory.mysqlPort = val;
	}

	/**
	 * The Sequelize model that this model uses as a DBAL ("database abstraction
	 * layer") when talking to the MySQL database.
	 *
	 * @type {Sequelize.Model}
	 */
	get db() {

		const me = this;

		return me.getConfigValue( "dbModel", me._defineDatabaseModel );
	}

	set db( /** Sequelize.Model */ val ) {

		const me = this;

		me.setConfigValue( "dbModel", val );
	}

	/**
	 * A plain object that maps database fields to this model's internal
	 * data structure. This object is the parent object that contains the
	 * mappings for all fields, including the parameters, meta, relationships,
	 * and attributes of the model.
	 *
	 * @public
	 * @type {Object}
	 */
	get dbFieldMappings() {

		const me = this;

		return me.getConfigValue( "dbFieldMappings", {} );
	}

	// noinspection JSUnusedGlobalSymbols
	set dbFieldMappings( /** Object */ val ) {

		const me = this;

		me.setConfigValue( "dbFieldMappings", val );
	}

	/**
	 * A plain object that maps database fields to this model's internal
	 * data structure. This object is part of
	 * {@link Model.MysqlModel#dbFieldMappings} and contains only a subset of
	 * the field mappings (those used in relationships).
	 *
	 * @public
	 * @type {Object}
	 * @readonly
	 */
	get dbFieldMappingsForRelationships() {

		const me = this;

		let fm = me.dbFieldMappings;

		if ( fm.relationships === undefined || fm.relationships === null ) {

			return {};
		}

		return fm.relationships;
	}

	/**
	 * A plain object that maps database fields to this model's internal
	 * data structure. This object is part of
	 * {@link Model.MysqlModel#dbFieldMappings} and contains only a subset of
	 * the field mappings (those used as metadata).
	 *
	 * @public
	 * @type {Object}
	 * @readonly
	 */
	get dbFieldMappingsForMeta() {

		const me = this;

		let fm = me.dbFieldMappings;

		if ( fm.meta === undefined || fm.meta === null ) {

			return {};
		}

		return fm.meta;
	}

	/**
	 * A plain object that maps database fields to this model's internal
	 * data structure. This object is part of
	 * {@link Model.MysqlModel#dbFieldMappings} and contains only a subset of
	 * the field mappings (those used as attributes).
	 *
	 * @public
	 * @type {Object}
	 * @readonly
	 */
	get dbFieldMappingsForAttributes() {

		const me = this;

		let fm = me.dbFieldMappings;

		if ( fm.attributes === undefined || fm.attributes === null ) {

			return {};
		}

		return fm.attributes;
	}

	/**
	 * A plain object that maps database fields to this model's internal
	 * data structure. This object is part of
	 * {@link Model.MysqlModel#dbFieldMappings} and contains only a subset of
	 * the field mappings (those used as parameters).
	 *
	 * @public
	 * @type {Object}
	 * @readonly
	 */
	get dbFieldMappingsForParameters() {

		const me = this;

		let fm = me.dbFieldMappings;

		if ( fm.parameters === undefined || fm.parameters === null ) {

			return {};
		}

		return fm.parameters;
	}

	/**
	 * Connects to the MySQL database via Sequelize.
	 *
	 * @private
	 * @returns {Promise<Sequelize.Model>} @todo correct return type?
	 */
	_connectToDatabase() {

		const me = this;

		let adapter = me.adapter;

		me.$log(
			"debug",
			"Connecting to MySQL ('" + me.mysqlHostname + "') as user '" + me.mysqlUsername + "'."
		);

		return adapter.authenticate().then( function () {

			me.$log( "debug", "Connected to, and authenticated with, MySQL." );

			return me.db;

		} ).catch( function ( err ) {

			// console.log( err.stack );

			throw new ERRORS.DatabaseConnectionError(
				err, "Couldn't connect to the database."
			);
		} );
	}

	/**
	 * Produces a Sequelize-compatible "order" query object from the provided
	 * request object.
	 *
	 * @private
	 * @param {Request.Request} request - A request object.
	 * @returns {Object} A Sequelize-compatible "order" query object.
	 */
	_createOrderFromRequest( request ) {

		const me = this;

		let sort = request.sort || "";

		let sortFieldsArray = sort.split( "," );

		return me._createOrderFromSortFieldsArray( sortFieldsArray );
	}

	/**
	 * Produces a Sequelize-compatible "order" query object from the provided
	 * sort fields array.
	 *
	 * @private
	 * @param {Array} sortFieldsArray - Array of sort fields.
	 * @returns {Object} A Sequelize-compatible "order" query object.
	 */
	_createOrderFromSortFieldsArray( sortFieldsArray ) {

		const me = this;

		// Dependencies
		const _ = me.$dep( "lodash" );

		let fm		= me.dbFieldMappings;
		let order	= [];

		_.each( sortFieldsArray, function ( field ) {

			let direction = "ASC";

			field = _.trim( field );

			if ( !field ) {

				return true;
			}

			// descending order

			if ( _.startsWith( field, "-" ) ) {

				direction	= "DESC";
				field		= field.substr( 1 );
			}

			// get field mapping

			let mappedField = _.get( fm.attributes || {}, field, null );

			if ( mappedField === null ) {
				mappedField = _.get( fm.meta || {}, field, null );
			}

			if ( mappedField === null ) {
				mappedField = _.get( fm.relationships || {}, field, null );
			}

			if ( mappedField === null ) {
				mappedField = field;
			}

			// add to array

			order.push( [ mappedField, direction ] );

			// continue

			return true;
		} );

		return order;
	}

	/**
	 * Produces a Sequelize-compatible "values" object from the provided
	 * request object.
	 *
	 * @private
	 * @param {Request.Request} request - A request object.
	 * @returns {Object} A Sequelize-compatible "values" query object.
	 */
	_createValuesFromRequest( request ) {

		const me = this;

		// Dependencies
		const _ = me.$dep( "lodash" );

		let data = _.get( request, "body.data" );

		return me._createValuesFromData( data );
	}

	/**
	 * Produces a Sequelize-compatible "values" object from the provided
	 * resource data object.
	 *
	 * @private
	 * @param {Object} data - A resource data object.
	 * @returns {Object} A Sequelize-compatible "values" query object.
	 */
	_createValuesFromData( data ) {

		const me = this;

		// Dependencies
		const _ = me.$dep( "lodash" );

		let attributes		= data.attributes;
		let relationships	= data.relationships;

		let attributeValues		= me._getValuesFromAttributes( attributes );
		let relationshipValues	= me._getValuesFromRelationships( relationships );

		return _.assign( {}, attributeValues, relationshipValues );
	}

	/**
	 * Produces a Sequelize-compatible "values" object from the provided
	 * attributes data.
	 *
	 * @private
	 * @param {Object} attributes - Attributes object.
	 * @returns {Object} A Sequelize-compatible "values" query object.
	 */
	_getValuesFromAttributes( attributes ) {

		const me = this;

		let fieldMappings = me.dbFieldMappingsForAttributes;

		return me._getDataFromMappedStructure( attributes, fieldMappings );
	}

	/**
	 * Produces a Sequelize-compatible "values" object from the provided
	 * relationships data.
	 *
	 * @private
	 * @param {Object} relationships - Relationships object.
	 * @returns {Object} A Sequelize-compatible "values" query object.
	 */
	_getValuesFromRelationships( relationships ) {

		const me = this;

		// Dependencies
		const _ = me.$dep( "lodash" );

		let data	= relationships;
		let fm		= me.dbFieldMappingsForRelationships;
		let values	= {};

		_.each( fm, function ( dbFieldName, dataKey ) {

			// add to values

			let value = _.get( data, dataKey + ".data.id" );

			if ( _.isUndefined( value ) ) {

				// Continue...

				return true;
			}

			values[ dbFieldName ] = value;

			// Continue...

			return true;
		} );

		return values;
	}

	/**
	 * Produces a Sequelize-compatible "where" query object from the provided
	 * request object.
	 *
	 * @private
	 * @param {Request.Request} request - A request object.
	 * @returns {Object} A Sequelize-compatible "where" query object.
	 */
	_createWhereFromRequest( request ) {

		const me = this;

		// Dependencies
		const _ = me.$dep( "lodash" );

		let fm		= me.dbFieldMappingsForParameters;
		let params	= request.parametersWithValues;
		let where	= {};

		let ignoreParams = [
			"hardDelete",
			"pageNumber",
			"pageSize",
			"sort",
		];

		_.each( fm, function ( dbFieldName, paramKey ) {

			// check for ignored parameters

			if ( _.includes( ignoreParams, paramKey ) ) {

				// continue...

				return true;
			}

			// add to where

			if ( params[ paramKey ] ) {

				where[ dbFieldName ] = params[ paramKey ].value;
			}

			// continue...

			return true;
		} );

		// Exclude soft-deleted records by default...

		if ( !where.deleted ) {

			where.deleted = "no";
		}

		return where;
	}

	/**
	 * Executes a READ query to the database, which may return zero, one,
	 * or more than one records in response.
	 *
	 * This method uses request data and is usually called by an endpoint.
	 *
	 * @public
	 * @param {Request.Request} request - The request object.
	 * @returns {Promise<Resource.ResourceCollection>} The query results.
	 */
	readManyByRequest( request ) {

		const me = this;

		const BB = me.$dep( "bluebird" );

		let offset;
		let limit;

		return BB.try( function () {

			offset	= request.offset;
			limit	= request.limit;

			let queryConfig = {
				adapterMethod : "findAndCountAll",
				options       : {
					offset : offset,
					limit  : limit,
				},
			};

			// Build Query Arguments
			queryConfig.options.where = me._createWhereFromRequest( request );
			queryConfig.options.order = me._createOrderFromRequest( request );

			me.$log(
				"debug",
				"Starting a " + me.$className + "#readManyByRequest() query operation."
			);

			// Execute the Query
			return me._executeDbQuery( queryConfig );

		} ).then( function ( result ) {

			let rows		= result.rows;
			let totalCount	= result.count;
			let rowCount	= rows.length;

			me.$log(
				"info",
				"model.operation.read.many.by.request.complete",
				"readManyByRequest operation complete: [" + rowCount + " of " + totalCount + "] records returned."
			);

			let resourceCollection = me._createResourceCollection( rows );

			let pagination = me._createPaginationObject(
				offset, limit, rowCount, totalCount
			);

			return [ resourceCollection, pagination ];
		} );
	}

	/**
	 * Creates and returns a pagination object.
	 *
	 * @param {number} offset - Query row offset.
	 * @param {number} limit - Query row limit.
	 * @param {number} rowCount - The number of records returned from the query.
	 * @param {number} totalCount - Total records available on server.
	 * @returns {Object} Pagination object.
	 * @private
	 */
	_createPaginationObject( offset, limit, rowCount, totalCount ) {

		return {
			allRecordsReturned : !( rowCount < totalCount ),
			currentPage        : limit ? Math.ceil( ( offset + 1 ) / limit ) : 0,
			pageSize           : limit,
			totalPages         : limit ? Math.ceil( totalCount / limit ) : 0,
			recordsReturned    : rowCount,
			firstRecordIndex   : rowCount ? offset : -1,
			lastRecordIndex    : offset + rowCount - 1,
			totalRecords       : totalCount,
		};
	}

	/**
	 * Executes a CREATE query to the database to create a new record.
	 *
	 * @param {Object} data - Data to use in the create operation.
	 * @param {string} userId - User ID performing the create operation.
	 * @returns {Promise<Resource.Resource>} The query results.
	 */
	createOne( data, userId ) {

		const me = this;

		// Dependencies
		const BB		= me.$dep( "bluebird" );
		const uuidUtils	= me.$dep( "util/uuid" );

		return BB.try( function () {

			me.$log(
				"debug",
				"Starting a " + me.$className + "#createOne() query operation."
			);

			// FIXME: assert userId

			let values = me._createValuesFromData( data );

			// Protected fields that should never be updated directly
			delete values.created_datetime;
			delete values.updated_datetime;
			delete values.created_user_id;
			delete values.updated_user_id;

			// Indicate user making the create request.
			// Sequelize will handle the `created_datetime` and `updated_datetime` timestamps.
			values.created_user_id	= userId;
			values.updated_user_id	= userId;

			// Generate new primary key value
			values[ me.databasePrimaryKey ]	= uuidUtils.generate();

			// Build Query Arguments
			let queryConfig = {
				adapterMethod : "create",
				values        : values,
				options       : {
				},
			};

			// Execute the Query
			return me._executeDbQuery( queryConfig );

		} ).then( function ( model ) {

			// Refresh instance with DB data
			return model.reload();

		} ).then( function ( model ) {

			let count		= 1;
			let resource	= me._createResource( model );

			me.$log(
				"info",
				"model.operation.create.one.complete",
				"createOne operation complete: [" + count + "] records created."
			);

			return resource;
		} );
	}

	/**
	 * Executes a CREATE query to the database to create a new record.
	 *
	 * This method uses request data and is usually called by an endpoint.
	 *
	 * @public
	 * @param {Request.Request} request - The request object.
	 * @returns {Promise<Resource.Resource>} The query results.
	 */
	createOneByRequest( request ) {

		const me = this;

		// Dependencies
		const BB	= me.$dep( "bluebird" );
		const _		= me.$dep( "lodash" );

		return BB.try( function () {

			let data = _.get( request, "body.data" );

			return me.createOne( data, request.userId );
		} );
	}

	/**
	 * Executes a READ query to the database for a specific resource ID.
	 *
	 * @param {string} id - Resource ID to read.
	 * @returns {Promise<Resource.Resource>} The query results.
	 */
	readOneById( id ) {

		const me = this;

		// Dependencies
		const BB	= me.$dep( "bluebird" );
		const _		= me.$dep( "lodash" );

		return BB.try( function () {

			me.$log(
				"debug",
				"Starting a " + me.$className + "#readOneById() query operation."
			);

			let pkField = me.databasePrimaryKey;

			let where = {
				deleted     : "no",
				[ pkField ] : id,
			};

			if ( _.isUndefined( where[ pkField ] ) ) {

				throw new Error( "readOneById(): Missing expected primary key value!" );
			}

			// Build Query Arguments
			let queryConfig = {
				adapterMethod : "findOne",
				options       : {
					where : where,
					// FIXME: is findOne supposed to automatically set the LIMIT=1? The docs say yes, but it seems broken
					// http://docs.sequelizejs.com/class/lib/model.js~Model.html#static-method-findOne
					limit : 1,
				},
			};

			// Execute the Query
			return me._executeDbQuery( queryConfig );

		} ).then( function ( model ) {

			if ( !model ) {

				throw new ERRORS.MissingResourceError(
					"The requested resource does not exist."
				);
			}

			let count		= 1;
			let resource	= me._createResource( model );

			me.$log(
				"info",
				"model.operation.read.one.by.id.complete",
				"readOneById operation complete: [" + count + "] records returned."
			);

			return resource;
		} );
	}

	/**
	 * Executes a READ query to the database, which may return zero or one
	 * record in response.
	 *
	 * This method uses request data and is usually called by an endpoint.
	 *
	 * @public
	 * @param {Request.Request} request - The request object.
	 * @returns {Promise<Resource.Resource>} The query results.
	 */
	readOneByRequest( request ) {

		const me = this;

		// Dependencies
		const BB = me.$dep( "bluebird" );

		return BB.try( function () {

			me.$log(
				"debug",
				"Starting a " + me.$className + "#readOneByRequest() query operation."
			);

			// Build Query Arguments
			let queryConfig = {
				adapterMethod : "findOne",
				options       : {
					where : me._createWhereFromRequest( request ),
					// FIXME: is findOne supposed to automatically set the LIMIT=1? The docs say yes, but it seems broken
					// http://docs.sequelizejs.com/class/lib/model.js~Model.html#static-method-findOne
					limit : 1,
				},
			};

			// Execute the Query
			return me._executeDbQuery( queryConfig );

		} ).then( function ( model ) {

			if ( !model ) {

				throw new ERRORS.MissingResourceError(
					"The requested resource does not exist."
				);
			}

			let count		= 1;
			let resource	= me._createResource( model );

			me.$log(
				"info",
				"model.operation.read.one.by.request.complete",
				"readOneByRequest operation complete: [" + count + "] records returned."
			);

			return resource;
		} );
	}

	/**
	 * Executes an UPDATE query to the database for a specific resource ID.
	 *
	 * @param {string} id - Resource ID to update.
	 * @param {Object} data - Resource data to update.
	 * @param {string} userId - User ID performing the update.
	 * @returns {Promise<Resource.Resource>} The query results.
	 */
	updateOneById( id, data, userId ) {

		const me = this;

		// Dependencies
		const BB	= me.$dep( "bluebird" );
		const _		= me.$dep( "lodash" );

		return BB.try( function () {

			me.$log(
				"debug",
				"Starting a " + me.$className + "#updateOneById() query operation."
			);

			let pkField = me.databasePrimaryKey;

			let where = {
				deleted     : "no",
				[ pkField ] : id,
			};

			if ( _.isUndefined( where[ pkField ] ) ) {

				throw new Error( "updateOneById(): Missing expected primary key value!" );
			}

			// Build Query Arguments
			let queryConfig = {
				adapterMethod : "findOne",
				options       : {
					where : where,
					// FIXME: is findOne supposed to automatically set the LIMIT=1? The docs say yes, but it seems broken
					// http://docs.sequelizejs.com/class/lib/model.js~Model.html#static-method-findOne
					limit : 1,
				},
			};

			// TODO: do we need to support this scenario?
			// if ( queryConfig.values.deleted ) {
			//
			// 	delete queryConfig.options.where.deleted;
			// }

			// Execute the Query
			return me._executeDbQuery( queryConfig );

		} ).then( function ( model ) {

			if ( !model ) {

				throw new ERRORS.MissingResourceError(
					"The requested resource does not exist."
				);
			}

			// Gather values from request data
			let values = me._createValuesFromData( data );

			// Protected fields that should never be updated via request values
			delete values.created_datetime;
			delete values.updated_datetime;
			delete values.created_user_id;
			delete values.updated_user_id;

			// Indicate user making the update request.
			// Sequelize will handle the `updated_datetime` timestamp.
			values.updated_user_id = userId;

			// Update model with new values
			model.set( values );

			// Save model changes
			return model.save();

		} ).then( function ( model ) {

			// Refresh instance with DB data
			return model.reload();

		} ).then( function ( model ) {

			let count		= 1;
			let resource	= me._createResource( model );

			me.$log(
				"info",
				"model.operation.update.one.by.id.complete",
				"updateOneById operation complete: [" + count + "] records updated."
			);

			return resource;
		} );
	}

	/**
	 * Executes an UPDATE query to the database, which may update zero or one
	 * record with specified values.
	 *
	 * This method uses request data and is usually called by an endpoint.
	 *
	 * @public
	 * @param {Request.Request} request - The request object.
	 * @returns {Promise<Resource.Resource>} The query results.
	 */
	updateOneByRequest( request ) {

		const me = this;

		// Dependencies
		const BB = me.$dep( "bluebird" );

		return BB.try( function () {

			me.$log(
				"debug",
				"Starting a " + me.$className + "#updateOneByRequest() query operation."
			);

			// Build Query Arguments
			let queryConfig = {
				adapterMethod : "findOne",
				options       : {
					where : me._createWhereFromRequest( request ),
					// FIXME: is findOne supposed to automatically set the LIMIT=1? The docs say yes, but it seems broken
					// http://docs.sequelizejs.com/class/lib/model.js~Model.html#static-method-findOne
					limit : 1,
				},
			};

			// TODO: do we need to support this scenario?
			// if ( queryConfig.values.deleted ) {
			//
			// 	delete queryConfig.options.where.deleted;
			// }

			// Execute the Query
			return me._executeDbQuery( queryConfig );

		} ).then( function ( model ) {

			if ( !model ) {

				throw new ERRORS.MissingResourceError(
					"The requested resource does not exist."
				);
			}

			// Gather values from request data
			let values = me._createValuesFromRequest( request );

			// Protected fields that should never be updated via request values
			delete values.created_datetime;
			delete values.updated_datetime;
			delete values.created_user_id;
			delete values.updated_user_id;

			// Indicate user making the update request.
			// Sequelize will handle the `updated_datetime` timestamp.
			values.updated_user_id = request.userId;

			// Update model with new values
			model.set( values );

			// Save model changes
			return model.save();

		} ).then( function ( model ) {

			// Refresh instance with DB data
			return model.reload();

		} ).then( function ( model ) {

			let count		= 1;
			let resource	= me._createResource( model );

			me.$log(
				"info",
				"model.operation.update.one.by.request.complete",
				"updateOneByRequest operation complete: [" + count + "] records updated."
			);

			return resource;
		} );
	}

	/**
	 * Executes a soft-delete UPDATE query to the database, which may update
	 * zero or one record with deleted=yes.
	 *
	 * @public
	 * @param {Request.Request} request - The request object.
	 * @returns {Promise<Resource.Resource>} The query results.
	 */
	softDeleteOneByRequest( request ) {

		const me = this;

		// Dependencies
		const BB	= me.$dep( "bluebird" );
		const _		= me.$dep( "lodash" );

		return BB.try( function () {

			me.$log(
				"debug",
				"Starting a " + me.$className + "#softDeleteOneByRequest() query operation."
			);

			// Safety check, make sure where includes primary key

			let where	= me._createWhereFromRequest( request );
			let pkField	= me.databasePrimaryKey;

			if ( _.isUndefined( where[ pkField ] ) ) {

				throw new Error( "softDeleteOne(): Missing expected primary key value!" );
			}

			// Build Query Arguments
			let queryConfig = {
				adapterMethod : "update",
				values        : {
					deleted         : "yes",
					// Indicate user making the delete request.
					// Sequelize will handle the `updated_datetime` timestamp.
					updated_user_id : request.userId,
				},
				options: {
					where : where,
					limit : 1,
				},
			};

			// Execute the Query
			return me._executeDbQuery( queryConfig );

		} ).then( function ( result ) {

			let deletedCount = result[ 0 ];

			if ( !deletedCount ) {

				throw new ERRORS.MissingResourceError(
					"The requested resource does not exist."
				);
			}

			me.$log(
				"info",
				"model.operation.soft.delete.one.by.request.complete",
				"softDeleteOneByRequest operation complete: [" + deletedCount + "] records soft-deleted."
			);

			return [ null, null ];
		} );
	}

	/**
	 * Executes a hard-delete DELETE query to the database, which may delete
	 * zero or one record.
	 *
	 * @public
	 * @param {Request.Request} request - The request object.
	 * @returns {Promise<Resource.Resource>} The query results.
	 */
	hardDeleteOneByRequest( request ) {

		const me = this;

		// Dependencies
		const BB	= me.$dep( "bluebird" );
		const _		= me.$dep( "lodash" );

		return BB.try( function () {

			me.$log(
				"debug",
				"Starting a " + me.$className + "#hardDeleteOneByRequest() query operation."
			);

			// Safety check, make sure where includes primary key

			let where	= me._createWhereFromRequest( request );
			let pkField	= me.databasePrimaryKey;

			if ( _.isUndefined( where[ pkField ] ) ) {

				throw new Error( "hardDeleteOne(): Missing expected primary key value!" );
			}

			// Build Query Arguments
			let queryConfig = {
				adapterMethod : "destroy",
				options       : {
					where : where,
					limit : 1,
				},
			};

			// Execute the Query
			return me._executeDbQuery( queryConfig );

		} ).then( function ( result ) {

			let deletedCount = result;

			if ( !deletedCount ) {

				throw new ERRORS.MissingResourceError(
					"The requested resource does not exist."
				);
			}

			me.$log(
				"info",
				"model.operation.hard.delete.one.by.request.complete",
				"hardDeleteOneByRequest operation complete: [" + deletedCount + "] records hard-deleted."
			);

			return [ null, null ];
		} );
	}

	/**
	 * Executes a hard or soft delete operation depending on the `hardDelete`
	 * request parameter.
	 *
	 * If `hardDelete` is TRUE, a hard-delete is performed which permanently
	 * deletes the record.
	 *
	 * If `hardDelete` is FALSE or NULL, a soft-delete is performed which
	 * sets deleted=yes on the record.
	 *
	 *
	 * This method uses request data and is usually called by an endpoint.
	 *
	 * @public
	 * @param {Request.Request} request - The request object.
	 * @returns {Promise<Resource.Resource>} The query results.
	 */
	deleteOneByRequest( request ) {

		const me = this;

		// Dependencies
		const BB = me.$dep( "bluebird" );

		return BB.try( function () {

			let hardDelete = request.getParameterValue( "hardDelete" );

			if ( hardDelete === true ) {

				return me.hardDeleteOneByRequest( request );
			}

			return me.softDeleteOneByRequest( request );
		} );
	}

	/**
	 * Connects to the Mysql database and then executes a generic database
	 * query. (that was prepared by a specialist method, such as
	 * {@link Model.MysqlModel#readMany})
	 *
	 * @private
	 * @param {Object} cfg - A configuration object that will be used to create
	 *     a query through one of `Sequelize.Model`'s query methods.
	 * @param {string} cfg.adapterMethod - The method to call on
	 *     `Sequelize.Model`.
	 * @param {Object} cfg.options - Options passed to the DB query.
	 * @param {Object} cfg.values - Values passed to the DB query.
	 * @param {Object} cfg.id - Primary key value passed to the DB query.
	 * @returns {Promise<Sequelize.Model[]|Sequelize.Model>} The query results.
	 */
	_executeDbQuery( cfg ) {

		const me = this;

		let adapterMethod	= cfg.adapterMethod;
		let id				= cfg.id;
		let values			= cfg.values;
		let options			= cfg.options;

		// Connect...
		return me._connectToDatabase().then( function ( db ) {

			// Execute...

			switch ( adapterMethod ) {

				case "findByPk":

					return db[ adapterMethod ]( id, options );

				case "update":
				case "create":

					return db[ adapterMethod ]( values, options );

				default:

					return db[ adapterMethod ]( options );
			}

		} ).catch( function ( err ) {

			throw new ERRORS.DatabaseConnectionError(
				err, "Database Query Failed"
			);
		} );
	}

	/**
	 * Initializes and instantiates a new {@link Resource.Resource} object
	 * using a single item from within a Sequelize query result object.
	 *
	 * @private
	 * @param {Sequelize.Model} dbResultItem - Sequelize model.
	 * @returns {Resource.Resource} The instantiated resource object.
	 */
	_createResource( dbResultItem ) {

		const me = this;

		let resource	= me._initEmptyResource();
		let data		= dbResultItem.get();

		// Set the id
		resource.id = me._getIdFromDbItem( dbResultItem );

		// Persist the db result in the resource.
		// This is just in case we ever need it again.
		resource.rawDataSource = dbResultItem;

		// Parse Attributes
		resource.attributes = me._getAttributesFromDbData( data );

		// Parse Meta
		resource.meta = me._getMetaFromDbData( data );

		// Parse Relationships
		resource.relationships = me._getRelationshipsFromDbData( data );

		// Done
		return resource;
	}

	/**
	 * Initializes and instantiates a new {@link Resource.ResourceCollection}
	 * object using all of the items from within a Sequelize query result
	 * object.
	 *
	 * @private
	 * @param {Sequelize.Model[]} dbResult - Database query results.
	 * @returns {Resource.ResourceCollection} The instantiated resource
	 *     collection object.
	 */
	_createResourceCollection( dbResult ) {

		const me = this;

		// Dependencies
		const _ = me.$dep( "lodash" );

		let resourceCollection = me._initEmptyResourceCollection();

		_.each( dbResult, function ( item ) {

			let resource = me._createResource( item );

			resourceCollection.addResource( resource );
		} );

		return resourceCollection;
	}

	/**
	 * Finds the primary key value from with a Sequelize query result object.
	 *
	 * @private
	 * @param {Object} dbItem - One item from within a Sequelize result object.
	 * @returns {string} The primary key.
	 */
	_getIdFromDbItem( dbItem ) {

		const me = this;

		let pkField = me.databasePrimaryKey;

		return dbItem.get( pkField );
	}

	/**
	 * Extracts attribute values from the _data_ of a single item in a Sequelize
	 * query result object.
	 *
	 * @private
	 * @param {Object} dbItemData - The _data_ from a single item in a Sequelize
	 *     result object.
	 * @returns {Object} Attribute data.
	 */
	_getAttributesFromDbData( dbItemData ) {

		const me = this;

		let fieldMappings = me.dbFieldMappingsForAttributes;

		return me._getMappedStructureFromData( dbItemData, fieldMappings );
	}

	/**
	 * Extracts metadata values from the _data_ of a single item in a Sequelize
	 * query result object.
	 *
	 * @private
	 * @param {Object} dbItemData - The _data_ from a single item in a Sequelize
	 *     result object.
	 * @returns {Object} Metadata.
	 */
	_getMetaFromDbData( dbItemData ) {

		const me = this;

		let fieldMappings = me.dbFieldMappingsForMeta;

		return me._getMappedStructureFromData( dbItemData, fieldMappings );
	}

	/**
	 * Extracts foreign key (relationship field data) values from the _data_ of
	 * a single item in a Sequelize query result object.
	 *
	 * @private
	 * @param {Object} dbItemData - The _data_ from a single item in a Sequelize
	 *     result object.
	 * @returns {Object} A plain object containing zero or more
	 *     {@link Resource.ResourceIdentifier} objects.
	 */
	_getRelationshipsFromDbData( dbItemData ) {

		const me = this;

		// Dependencies
		const _			= me.$dep( "lodash" );
		const TIPE		= me.$dep( "tipe" );
		// const ERRORS	= me.$dep( "errors" );

		let relationships = me.relationships;
		let fieldMappings = me.dbFieldMappingsForRelationships;
		let ret = {};

		_.each( fieldMappings, function ( dbFieldName, relName ) {

			let relationship;
			let dbFieldValue;
			let resourceIdentifier;

			// Init the property on our return with a NULL value
			ret[ relName ] = null;

			// Capture the relationship object...
			relationship = relationships[ relName ];

			// Ensure we have a relationship that
			// matches the field mapping.
			if ( TIPE( relationship ) !== "object" ) {

				throw new ERRORS.MissingRelationshipError(
					"The '" + me.name + "' model definition contains a " +
					"database field mapping for a relationship (" +
					"'" + relName + "') but a relationship with that name " +
					"has not been defined in the model configuration " +
					"(this.config.relationships)."
				);
			}

			// Capture the field value...
			dbFieldValue = dbItemData[ dbFieldName ];

			// If our mapped value is not available, we'll leave
			// the return value for this relationship as null.

			if ( _.isNil( dbFieldValue ) ) {

				// continue...

				return true;
			}

			// Create the resource identifier object
			resourceIdentifier = relationship.createRemoteResourceIdentifier( dbFieldValue );

			// Persist
			ret[ relName ] = resourceIdentifier;

			// continue...

			return true;
		} );

		return ret;
	}

	/**
	 * A utility function that extracts values from the data of a single item
	 * with a Sequelize result object using a field mapping object as a guide.
	 *
	 * @private
	 * @param {Object} data - The _data_ from a single item in a Sequelize
	 *     result object.
	 * @param {Object} map - A field mapping object.
	 * @returns {Object} Mapped data.
	 */
	_getMappedStructureFromData( data, map ) {

		const me = this;

		// Dependencies
		const _		= me.$dep( "lodash" );
		const TIPE	= me.$dep( "tipe" );

		let ret = {};

		_.each( map, function ( val, key ) {

			if ( TIPE( val ) === "object" ) {

				ret[ key ] = me._getMappedStructureFromData( data, val );

			} else if ( data[ val ] === undefined ) {

				ret[ key ] = null;

			} else {

				ret[ key ] = data[ val ];
			}
		} );

		return ret;
	}

	/**
	 * A utility function that extracts values from the mapped data of a single
	 * item using a field mapping object as a guide.
	 *
	 * @private
	 * @param {Object} mappedData - The _mapped data_ from a single item.
	 * @param {Object} map - A field mapping object.
	 * @param {Object} [data] - The existing data collected so far. Used for recursive calls.
	 * @returns {Object} Data.
	 */
	_getDataFromMappedStructure( mappedData, map, data ) {

		const me = this;

		// Dependencies
		const _		= me.$dep( "lodash" );
		const TIPE	= me.$dep( "tipe" );

		// Initialize result data, if necessary...
		if ( _.isNil( data ) ) {

			data = {};
		}

		// No mapped data to process, exit early...
		if ( _.isNil( mappedData ) ) {

			return data;
		}

		// Process mapped data...
		_.each( map, function ( val, key ) {

			if ( TIPE( val ) === "object" ) {

				me._getDataFromMappedStructure( mappedData[ key ], val, data );

			} else if ( mappedData[ key ] !== undefined ) {

				data[ val ] = mappedData[ key ];
			}
		} );

		return data;
	}

	/**
	 * Defines the database model using Sequelize#define. This method is called,
	 * exclusively, by the `db` getter, when it is called for the first time.
	 * Because of that, this method should only run one time throughout the
	 * lifetime of a MysqlModel object.
	 *
	 * @private
	 * @returns {Sequelize.Model} A Sequelize model definition.
	 * @see http://docs.sequelizejs.com/class/lib/model.js~Model.html
	 */
	_defineDatabaseModel() {

		const me = this;

		let sequelize = me.adapter;

		// Capture the database model's fields
		let fields = me.getDatabaseFields();

		// Invoke Sequelize to define the model
		return sequelize.define(
			me.name,
			fields,
			{
				tableName: me.mysqlTable,
			}
		);
	}

	/**
	 * Builds the database field list for Sequelize. Although other uses
	 * may exist, this method was developed, primarily, for use by the
	 * #_defineDatabaseModel method, which uses the return from this method
	 * as the "fields" parameter in Sequelize#define.
	 *
	 * This method will call the child class, "#getCustomDatabaseFields",
	 * to get any Model-specific fields, and will then prepend and append
	 * various universal/common fields to those.
	 *
	 * @public
	 * @returns {Object} An object containing the complete list of fields
	 *     for the Sequelize database model.
	 */
	getDatabaseFields() {

		const me = this;

		// Dependencies
		const _ = me.$dep( "lodash" );

		let dataTypes 		= me.adapterClass;
		let presets 		= me.adapterFieldPresets;
		let stdFieldsStart 	= {};
		let stdFieldsEnd 	= {};
		let finalFields;

		// Get model-specific fields from the child class
		let customFields = me.getCustomDatabaseFields( dataTypes, presets );

		// Resolve the field name for the primary key field
		let primaryKeyFieldName = me.databasePrimaryKey;

		// Define the fields that will be injected
		// at the start of the field list.
		stdFieldsStart[ primaryKeyFieldName ] = {
			preset     : presets.BINARYUUID,
			primaryKey : true,
		};
		stdFieldsStart.deleted = {
			preset: presets.BOOLYESNO,
		};
		stdFieldsStart.status = {
			preset : presets.ENUM,
			values : [ "active" ],
		};

		// Define the fields that will be injected
		// at the end of the field list.
		stdFieldsEnd.created_user_id = {
			preset: presets.BINARYUUID,
		};
		stdFieldsEnd.created_datetime = {
			preset: presets.ZERO_NULL_DATETIME,
		};
		stdFieldsEnd.updated_user_id = {
			preset: presets.BINARYUUID,
		};
		stdFieldsEnd.updated_datetime = {
			preset: presets.ZERO_NULL_DATETIME,
		};

		// Prune the standard fields if any of them are defined (overridden)
		// by the customFields. I could have accomplished the same thing by
		// re-ordering the "Object.assign" call, below, but I wanted to preserve
		// the field order in the object (even though it is not guaranteed).
		_.each( customFields, function ( cfValue, cfName ) {

			if ( stdFieldsStart[ cfName ] !== undefined ) {

				delete stdFieldsStart[ cfName ];
			}

			if ( stdFieldsEnd[ cfName ] !== undefined ) {

				delete stdFieldsEnd[ cfName ];
			}
		} );

		// Create the final fields
		finalFields = Object.assign(
			{},
			stdFieldsStart,
			customFields,
			stdFieldsEnd
		);

		// Apply presets
		finalFields = presets.apply( finalFields );

		// All done...
		return finalFields;
	}
}

module.exports = MysqlModel;
