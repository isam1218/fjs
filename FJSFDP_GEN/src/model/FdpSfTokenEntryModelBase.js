//{FON:GEN:d6dc6cae606675f2e4fc6aad891c41b3} GENERATED CODE! DO NOT EDIT MANUALY!
namespace('fjs.fdp');


/**
 * Code generated by com.fonality.meta.generator.java.fdp.client.fjs.JGen_FJS_FeedModelEntryBase
 * Store access tokens for CP administrators, used by salesforce, has no any relations to Auth Service
 * @constructor
 */
fjs.fdp.FdpSfTokenEntryModelBase = function()
{
	
	/**
	 * Username
	 * @type {String}
	 */
	this.username = null; //$NON-NLS-1$
	/**
	 * Password
	 * @type {String}
	 */
	this.password = null; //$NON-NLS-1$
	/**
	 * Primary server id
	 * @type {int}
	 */
	this.serverId = null;
	/**
	 * Auth ticket assigned to this user
	 * @type {String}
	 */
	this.accessToken = null; //$NON-NLS-1$
};
