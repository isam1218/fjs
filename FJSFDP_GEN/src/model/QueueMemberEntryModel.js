//{FON:GEN:d6dc6cae606675f2e4fc6aad891c41b3} GENERATED CODE! DO NOT EDIT MANUALY!
namespace('fjs.fdp');


/**
 * Code generated by com.fonality.meta.generator.java.fdp.client.fjs.JGen_FJS_FeedModelEntry
 * Provides user client with list of members in all queues. Member is an interception of
 * queues and contacts.
 * Every contact can be added to any queue to handle calls from this queue.
 * If queue Q contains contact A, there will be queue member M with contact_id = A and queue_id = Q.
 * @constructor
 */
fjs.fdp.QueueMemberEntryModel = function()
{
	
	/**
	 * Link to contact for this member.
	 * @type {String}
	 */
	this.contactId = null; //$NON-NLS-1$
	/**
	 * Queue.
	 * @type {String}
	 */
	this.queueId = null; //$NON-NLS-1$
	/**
	 * Contact's display name.
	 * @type {String}
	 */
	this.displayName = null; //$NON-NLS-1$
	/**
	 * Permanent agent flag. If true, agent always logged in.
	 * @type {boolean}
	 */
	this.permanent = null;
	/**
	 * Identifier of agent in queue.
	 * @type {String}
	 */
	this.extension = null; //$NON-NLS-1$
	/**
	 * Display name or a person talking in a queue.
	 * @type {String}
	 */
	this.queuemembercalls_displayName = null; //$NON-NLS-1$
	/**
	 * Formatted phone number of person talking in a queue.
	 * @type {String}
	 */
	this.queuemembercalls_phone = null; //$NON-NLS-1$
	/**
	 * In case of somebody from office call to a queue this field contains his id.
	 * In general case only external calls will call to a queue, so this field should be empty.
	 * @type {String}
	 */
	this.queuemembercalls_contactId = null; //$NON-NLS-1$
	/**
	 * Creation time
	 * @type {number}
	 */
	this.queuemembercalls_startedAt = null;
	/**
	 * Call type, see com.fonality.fdp.CallState.
	 * @type {String}
	 */
	this.queuemembercalls_state = null; //$NON-NLS-1$
	/**
	 * Bit set of disallowed actions. If zero, all actions allowed.
	 * @type {int}
	 */
	this.queuemembercalls_permissions = null;
	/**
	 * If true this side of call is being recorded.In depends on
	 * permissions this fact can be hidden and value will be always false.
	 * @type {boolean}
	 */
	this.queuemembercalls_recorded = null;
	/**
	 * If not None this call is barge call
	 * @type {String}
	 */
	this.queuemembercalls_barge = null; //$NON-NLS-1$
	/**
	 * If not None call is barged by user
	 * @type {String}
	 */
	this.queuemembercalls_bargedByMeOptions = null; //$NON-NLS-1$
	/**
	 * @type {Object}
	 */
	this.queuemembercalls_connection = null;
	/**
	 * The timestamp of last queue call handled by this queue member.
	 * @type {number}
	 */
	this.queue_members_stat_lastCallTimestamp = null;
	/**
	 * Total count of queue calls answered by this queue member.
	 * @type {number}
	 */
	this.queue_members_stat_callsHandled = null;
	/**
	 * Average time to handle a queue call.
	 * @type {number}
	 */
	this.queue_members_stat_avgTalkTime = null;
	/**
	 * Agent status for this member
	 * @type {String}
	 */
	this.queue_members_status_status = null; //$NON-NLS-1$
	/**
	 * Custom message for this status
	 * @type {String}
	 */
	this.queue_members_status_message = null; //$NON-NLS-1$
};
