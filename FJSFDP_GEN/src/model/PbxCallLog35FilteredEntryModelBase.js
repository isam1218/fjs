//{FON:GEN:d6dc6cae606675f2e4fc6aad891c41b3} GENERATED CODE! DO NOT EDIT MANUALY!
namespace('fjs.fdp');


/**
 * Code generated by com.fonality.meta.generator.java.fdp.client.fjs.JGen_FJS_FeedModelEntryBase
 * Meta structure provides call's log.
 * @constructor
 */
fjs.fdp.PbxCallLog35FilteredEntryModelBase = function()
{
	
	/**
	 * Filter by entity (contact, queue, conference, group)
	 * @type {String}
	 */
	this.filterId = null; //$NON-NLS-1$
	/**
	 * Call owner location number
	 * @type {String}
	 */
	this.location = null; //$NON-NLS-1$
	/**
	 * Call type (fdp.CallType)
	 * @type {int}
	 */
	this.type = null;
	/**
	 * Incoming or outgoing direction of call. If true call is
	 * incoming, otherwise call is outbound i.e this contact initiate a call
	 * @type {boolean}
	 */
	this.incoming = null;
	/**
	 * True if call was missed, i.e. not answered
	 * @type {boolean}
	 */
	this.missed = null;
	/**
	 * True if call was visited, i.e. user already saw this entry.
	 * @type {boolean}
	 */
	this.visited = null;
	/**
	 * Unique call key for owner
	 * @type {String}
	 */
	this.callKey = null; //$NON-NLS-1$
	/**
	 * Creation time
	 * @type {number}
	 */
	this.startedAt = null;
	/**
	 * Call duration time
	 * @type {number}
	 */
	this.duration = null;
	/**
	 * In case of office or voicemail call this field provides pid of user on other side of the call.
	 * <br/>
	 * It is empty (0) for external calls or in case of applied permissions.
	 * @type {String}
	 */
	this.userId = null; //$NON-NLS-1$
	/**
	 * source field for user id
	 * @type {number}
	 */
	this.userIdSource = null;
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
	/**
	 * Display name or caller/callee name on other side or the call
	 * <p/>
	 * In depends on call type, direction, permissions etc. it can be one of the following:
	 * <ul>
	 * <li>Display name of fdp contact</li>
	 * <li>Caller name for external contacts</li>
	 * <li>Conference room name and number (subject for i18n in v1.1)</li>
	 * <li>null/empty - for unknown caller</li>
	 * <li>null/empty - for blocked numbers</li>
	 * </ul>
	 * @type {String}
	 */
	this.displayName = null; //$NON-NLS-1$
	/**
	 * Conference id if this is conference call
	 * @type {String}
	 */
	this.conferenceId = null; //$NON-NLS-1$
	/**
	 * Department id if this is group call
	 * @type {String}
	 */
	this.departmentId = null; //$NON-NLS-1$
	/**
	 * Queue id if this is queue call
	 * @type {String}
	 */
	this.queueId = null; //$NON-NLS-1$
	/**
	 * MetaPid of call recording if recording is on
	 * @type {String}
	 */
	this.recordingId = null; //$NON-NLS-1$
};
