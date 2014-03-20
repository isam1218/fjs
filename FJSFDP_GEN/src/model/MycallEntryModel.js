//{FON:GEN:d6dc6cae606675f2e4fc6aad891c41b3} GENERATED CODE! DO NOT EDIT MANUALY!
namespace('fjs.fdp');


/**
 * Code generated by com.fonality.meta.generator.java.fdp.client.fjs.JGen_FJS_FeedModelEntry
 * Provides information about user call. It have more
 * information then fdp_call feed and provides information about ALL user
 * calls.
 * @constructor
 */
fjs.fdp.MycallEntryModel = function()
{
	
	/**
	 * Caller id
	 * @type {String}
	 */
	this.contactId = null; //$NON-NLS-1$
	/**
	 * Display name of the person on other side of the call. For
	 * conference call it will be conference name, for call to the queue (in
	 * ring state) it will be queue name. For call menu it will be "call
	 * menu" and so on.
	 * @type {String}
	 */
	this.displayName = null; //$NON-NLS-1$
	/**
	 * Phone of person on other side of the call.
	 * @type {String}
	 */
	this.phone = null; //$NON-NLS-1$
	/**
	 * If true the call is incoming, otherwise is outgoing call.
	 * @type {boolean}
	 */
	this.incoming = null;
	/**
	 * Call status
	 * @type {String}
	 */
	this.state = null; //$NON-NLS-1$
	/**
	 * Call type
	 * @type {String}
	 */
	this.type = null; //$NON-NLS-1$
	/**
	 * Contain non-zero value if this call is barge call. <br>
	 * <li> 0 - None </li>
	 * <li> 1 - Monitor </li>
	 * <li> 2 - Barge </li>
	 * <li> 3 - Whisper </li>
	 * @type {String}
	 */
	this.barge = null; //$NON-NLS-1$
	/**
	 * Contain non-zero value if this side of call is being barged. <br>
	 * In depends on permissions this fact can be hidden and value will be always 0. <br>
	 * <li> 0 - None </li>
	 * <li> 1 - Monitor </li>
	 * <li> 2 - Barge </li>
	 * <li> 3 - Whisper </li>
	 * @type {String}
	 */
	this.barged = null; //$NON-NLS-1$
	/**
	 * Call muted
	 * @type {boolean}
	 */
	this.mute = null;
	/**
	 * Call recording
	 * @type {boolean}
	 */
	this.record = null;
	/**
	 * Creation time
	 * @type {number}
	 */
	this.created = null;
	/**
	 * Location id
	 * @type {String}
	 */
	this.locationId = null; //$NON-NLS-1$
	/**
	 * SIP id for softphone call manipulations
	 * @type {String}
	 */
	this.sipId = null; //$NON-NLS-1$
	/**
	 * Call id provided by HUD server
	 * @type {String}
	 */
	this.htCallId = null; //$NON-NLS-1$
	/**
	 * @type {String}
	 */
	this.uaePerson = null; //$NON-NLS-1$
	/**
	 * @type {String}
	 */
	this.uaeCompany = null; //$NON-NLS-1$
	/**
	 * @type {String}
	 */
	this.uaeOpportunityAmmount = null; //$NON-NLS-1$
	/**
	 * @type {String}
	 */
	this.uaeOpportunityName = null; //$NON-NLS-1$
	/**
	 * @type {number}
	 */
	this.holdStart = null;
	/**
	 * Primary key from my call entry.
	 * @type {String}
	 */
	this.mycalldetails_htCallId = null; //$NON-NLS-1$
	/**
	 * Conference id, if any, entry is linked to.
	 * @type {String}
	 */
	this.mycalldetails_conferenceId = null; //$NON-NLS-1$
	/**
	 * Department id, if any, entry is linked to.
	 * @type {String}
	 */
	this.mycalldetails_departmentId = null; //$NON-NLS-1$
	/**
	 * Queue id, if any, entry is linked to.
	 * @type {String}
	 */
	this.mycalldetails_queueId = null; //$NON-NLS-1$
	/**
	 * Bit set of disallowed actions. If zero, all actions allowed.
	 * MyCallPermissions.
	 * @type {int}
	 */
	this.mycalldetails_permissions = null;
};
