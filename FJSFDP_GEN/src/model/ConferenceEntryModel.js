//{FON:GEN:d6dc6cae606675f2e4fc6aad891c41b3} GENERATED CODE! DO NOT EDIT MANUALY!
namespace('fjs.fdp');


/**
 * Code generated by com.fonality.meta.generator.java.fdp.client.fjs.JGen_FJS_FeedModelEntry
 * @interface Meta structure provides information about conference room.
 */
fjs.fdp.ConferenceEntryModel = function()
{
	
	/**
	 * Conference room description. Reserved for future
	 * releases.
	 * @type {String}
	 */
	this.description = null; //$NON-NLS-1$
	/**
	 * Server MetaPid
	 * @type {String}
	 */
	this.serverNumber = null; //$NON-NLS-1$
	/**
	 * Conference name. For 3.5 and 3.6 it is hardcoded value
	 * constructed from
	 * server number, conference number and conference
	 * extension.
	 * In future release it can be adjusted form control panel.
	 * @type {String}
	 */
	this.name = null; //$NON-NLS-1$
	/**
	 * Conference room number - 1,2,3, etc.
	 * @type {int}
	 */
	this.roomNumber = null;
	/**
	 * Formatted external phone number. null/empty if there is
	 * no external number assigned to a conference.
	 * @type {String}
	 */
	this.phone = null; //$NON-NLS-1$
	/**
	 * Conference extension number -8505, 8506, ...
	 * @type {String}
	 */
	this.extensionNumber = null; //$NON-NLS-1$
	/**
	 * Conference number
	 * @type {String}
	 */
	this.conferencepermissions_conferenceNumber = null; //$NON-NLS-1$
	/**
	 * Permanent permissions(view/kick).
	 * Bit set of disallowed actions. If zero, all actions allowed.
	 * @type {int}
	 */
	this.conferencepermissions_permissions = null;
	/**
	 * Number of talking members in conference room.
	 * @type {int}
	 */
	this.conferencestatus_membersCount = null;
	/**
	 * Time of last conference call.
	 * @type {number}
	 */
	this.conferencestatus_started = null;
	/**
	 * Indicate that client is joined to this conference.
	 * @type {boolean}
	 */
	this.conferencestatus_isMeJoined = null;
	/**
	 * Runtime permissions(record)
	 * Bit set of disallowed actions. If zero, all actions allowed.
	 * @type {int}
	 */
	this.conferencestatus_permissions = null;
	/**
	 * True if some member in this conference is being recorded. It depends on
	 * permissions this fact can be hidden and value will be always false.
	 * @type {boolean}
	 */
	this.conferencestatus_recorded = null;
	/**
	 * @type {String}
	 */
	this.conferencestatus_members = null; //$NON-NLS-1$
};
