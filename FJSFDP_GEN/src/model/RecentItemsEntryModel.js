//{FON:GEN:d6dc6cae606675f2e4fc6aad891c41b3} GENERATED CODE! DO NOT EDIT MANUALY!
namespace('fjs.fdp');


/**
 * Code generated by com.fonality.meta.generator.java.fdp.client.fjs.JGen_FJS_FeedModelEntry
 * Common recent feed.
 * @constructor
 */
fjs.fdp.RecentItemsEntryModel = function()
{
	
	/**
	 * @type {String}
	 */
	this.entryKey = null; //$NON-NLS-1$
	/**
	 * @type {Object}
	 */
	this.state = null;
	/**
	 * @type {String}
	 */
	this.clientId = null; //$NON-NLS-1$
	/**
	 * @type {number}
	 */
	this.timestamp = null;
	/**
	 * ID of provided item
	 * @type {String}
	 */
	this.providedId = null; //$NON-NLS-1$
	/**
	 * Feed name of provided item
	 * @type {String}
	 */
	this.providerFeed = null; //$NON-NLS-1$
	/**
	 * Call log id
	 * @type {String}
	 */
	this.callLogId = null; //$NON-NLS-1$
	/**
	 * Formatted phone number of person/entity on other side or the call
	 * <p/>
	 * In depends on call type, direction, permissions etc. it can be one of the following:
	 * <ul>
	 * <li>Extension number (3-5 digits) of fdp contact, queue, conference etc.</li>
	 * <li>Formatted external number</li>
	 * <li>Formatted mobile phone number of fdp contact</li>
	 * <li>null/empty - if extension/phone is unknown or blocked by permissions</li>
	 * </ul>
	 * @type {String}
	 */
	this.phone = null; //$NON-NLS-1$
};
