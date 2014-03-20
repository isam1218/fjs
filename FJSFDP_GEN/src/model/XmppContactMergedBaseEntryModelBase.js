//{FON:GEN:d6dc6cae606675f2e4fc6aad891c41b3} GENERATED CODE! DO NOT EDIT MANUALY!
namespace('fjs.fdp');


/**
 * Code generated by com.fonality.meta.generator.java.fdp.client.fjs.JGen_FJS_FeedModelEntryBase
 * @constructor
 */
fjs.fdp.XmppContactMergedBaseEntryModelBase = function()
{
	
	/**
	 * Contact's' jid.
	 * @type {String}
	 */
	this.jid = null; //$NON-NLS-1$
	/**
	 * Contact's' first name.
	 * @type {String}
	 */
	this.firstName = null; //$NON-NLS-1$
	/**
	 * Contact's last name.
	 * @type {String}
	 */
	this.lastName = null; //$NON-NLS-1$
	/**
	 * Contact's full name.
	 * @type {String}
	 */
	this.fullName = null; //$NON-NLS-1$
	/**
	 * Contact's display name.
	 * @type {String}
	 */
	this.displayName = null; //$NON-NLS-1$
	/**
	 * Primary email address of contact.
	 * @type {String}
	 */
	this.email = null; //$NON-NLS-1$
	/**
	 * Semicolon separated list of user instant messengers.
	 * @type {String}
	 */
	this.ims = null; //$NON-NLS-1$
	/**
	 * Business phone number. For pbx contacts it is direct
	 * phone number (call to this number will forward call to contact
	 * primary extension). For xmpp users this values taken from XMPP vCard.
	 * @type {String}
	 */
	this.phoneBusiness = null; //$NON-NLS-1$
	/**
	 * Mobile phone number.
	 * @type {String}
	 */
	this.phoneMobile = null; //$NON-NLS-1$
	/**
	 * Primary extension number.
	 * @type {String}
	 */
	this.primaryExtension = null; //$NON-NLS-1$
};
