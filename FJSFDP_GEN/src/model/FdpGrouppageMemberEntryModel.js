//{FON:GEN:d6dc6cae606675f2e4fc6aad891c41b3} GENERATED CODE! DO NOT EDIT MANUALY!
namespace('fjs.fdp');


/**
 * Code generated by com.fonality.meta.generator.java.fdp.client.fjs.JGen_FJS_FeedModelEntry
 * @interface Meta structure provides data about group calls members.
 */
fjs.fdp.FdpGrouppageMemberEntryModel = function()
{
	
	/**
	 * Group id.
	 * @type {String}
	 */
	this.groupId = null; //$NON-NLS-1$
	/**
	 * Formatted exte number of person/entity on other side or the call
	 * <p/>
	 * In depends on call type, direction, permissions etc. it can be one of the following:
	 * <ul>
	 * <li>Extension number (3-5 digits) of fdp contact, queue, conference etc.</li>
	 * <li>Formatted mobile phone number of fdp contact</li>
	 * <li>null/empty - if extension/phone is unknown or blocked by permissions</li>
	 * </ul>
	 * @type {String}
	 */
	this.phone = null; //$NON-NLS-1$
	/**
	 * In case of office or voicemail call this field provides meta pid (both source id and pid) of contact
	 * on other side of the call. Can be used on client side to get picture of other side of the call.
	 * <br/>
	 * It is empty/null for external calls or in case of applied permissions.
	 * @type {String}
	 */
	this.contactId = null; //$NON-NLS-1$
	/**
	 * @type {boolean}
	 */
	this.originator = null;
	/**
	 * @type {String}
	 */
	this.callId = null; //$NON-NLS-1$
	/**
	 * Page|Intercom|Voicemail
	 * @type {String}
	 */
	this.type = null; //$NON-NLS-1$
	/**
	 * Time when member joined conference.
	 * @type {number}
	 */
	this.started = null;
};
