//{FON:GEN:d6dc6cae606675f2e4fc6aad891c41b3} GENERATED CODE! DO NOT EDIT MANUALY!
namespace('fjs.fdp');


/**
 * Code generated by com.fonality.meta.generator.java.fdp.client.fjs.JGen_FJS_FeedModelEntry
 * Provides user client with list of known queues.
 * @constructor
 */
fjs.fdp.QueueEntryModel = function()
{
	
	/**
	 * Queue name.
	 * @type {String}
	 */
	this.name = null; //$NON-NLS-1$
	/**
	 * Queue description.
	 * @type {String}
	 */
	this.description = null; //$NON-NLS-1$
	/**
	 * Count of new messages in this queue.
	 * @type {int}
	 */
	this.queuemessagestats_unread = null;
	/**
	 * Total messages in this queue.
	 * @type {int}
	 */
	this.queuemessagestats_total = null;
	/**
	 * Contact id who want to do/see something
	 * @type {String}
	 */
	this.queuepermissions_contactIdOriginator = null; //$NON-NLS-1$
	/**
	 * Subject of activity.
	 * @type {String}
	 */
	this.queuepermissions_queueId = null; //$NON-NLS-1$
	/**
	 * Bit set of disallowed actions. If zero, all actions allowed.
	 * @type {int}
	 */
	this.queuepermissions_permissions = null;
	/**
	 * Time To Answer (affects completed_sla)
	 * @type {int}
	 */
	this.queue_stat_calls_tta = null;
	/**
	 * Statistics gathered since this time.
	 * @type {number}
	 */
	this.queue_stat_calls_resetTime = null;
	/**
	 * Number of calls waiting for answer
	 * @type {int}
	 */
	this.queue_stat_calls_waiting = null;
	/**
	 * Number of abandoned calls
	 * @type {int}
	 */
	this.queue_stat_calls_abandon = null;
	/**
	 * Percent of abandoned calls
	 * @type {int}
	 */
	this.queue_stat_calls_abandonPercent = null;
	/**
	 * Count of calls successfully answered
	 * @type {int}
	 */
	this.queue_stat_calls_completed = null;
	/**
	 * Percent of calls successfully answered
	 * @type {int}
	 */
	this.queue_stat_calls_completedPercent = null;
	/**
	 * Count of calls answered in TTA(Time To Answer) seconds. (Time To Answer Service Level Agreement)
	 * @type {int}
	 */
	this.queue_stat_calls_completedSla = null;
	/**
	 * Percent of calls answered in TTA(Time To Answer) seconds. (Time To Answer Service Level Agreement)
	 * @type {int}
	 */
	this.queue_stat_calls_completedSlaPercent = null;
	/**
	 * Average talk time for a call.
	 * @type {int}
	 */
	this.queue_stat_calls_avgTalk = null;
	/**
	 * Estimated Speed of Answer. Average time that call waits in a queue before answer.
	 * @type {int}
	 */
	this.queue_stat_calls_esa = null;
	/**
	 * Number of active calls.
	 * @type {int}
	 */
	this.queue_stat_calls_active = null;
	/**
	 * Number of members currently on a call
	 * @type {int}
	 */
	this.queue_stat_members_membersTalking = null;
	/**
	 * Total members count for this queue
	 * @type {int}
	 */
	this.queue_stat_members_membersCount = null;
	/**
	 * Number of members currently logged in
	 * @type {int}
	 */
	this.queue_stat_members_membersLogged = null;
};
