//{FON:GEN:d6dc6cae606675f2e4fc6aad891c41b3} GENERATED CODE! DO NOT EDIT MANUALY!
namespace('fjs.fdp');


/**
 * Code generated by com.fonality.meta.generator.java.fdp.client.fjs.JGen_FJS_FeedModelEntry
 * Store wall event attachments
 * @constructor
 */
fjs.fdp.StreamEventWallAttachmentBaseEntryModel = function()
{
	
	/**
	 * Unique attachment key: node_timestamp:counter
	 * @type {String}
	 */
	this.xkey = null; //$NON-NLS-1$
	/**
	 * PID of user who	owns this attachment.
	 * @type {String}
	 */
	this.ownerUserId = null; //$NON-NLS-1$
	/**
	 * Id of parent stream wall event.
	 * @type {String}
	 */
	this.parent = null; //$NON-NLS-1$
	/**
	 * Attachment file name
	 * @type {String}
	 */
	this.name = null; //$NON-NLS-1$
	/**
	 * Attachment file content type
	 * @type {String}
	 */
	this.type = null; //$NON-NLS-1$
	/**
	 * Attachment file content
	 * @type {byte[]}
	 */
	this.content = null;
	/**
	 * Time when attachment was created
	 * @type {number}
	 */
	this.created = null;
};
