//{FON:GEN:d6dc6cae606675f2e4fc6aad891c41b3} GENERATED CODE! DO NOT EDIT MANUALY!
namespace('fjs.fdp');


/**
 * Code generated by com.fonality.meta.generator.java.fdp.client.fjs.JGen_FJS_FeedModelEntry
 * PBX Queue
 * @constructor
 */
fjs.fdp.PbxQueueEntryModel = function()
{
	
	/**
	 * Queue id
	 * @type {String}
	 */
	this.queueId = null; //$NON-NLS-1$
	/**
	 * Maximum number of callers to the queue at the same time
	 * @type {int}
	 */
	this.max = null;
	/**
	 * Queues's service level
	 * @type {int}
	 */
	this.serviceLevel = null;
	/**
	 * Description of the queue
	 * @type {String}
	 */
	this.description = null; //$NON-NLS-1$
	/**
	 * Queue's strategy
	 * @type {String}
	 */
	this.strategy = null; //$NON-NLS-1$
	/**
	 * Queue's weight. Indicates queue's priority, if agent has
	 * a call from several queues
	 * @type {int}
	 */
	this.weight = null;
};
