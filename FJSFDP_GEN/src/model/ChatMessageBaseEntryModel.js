//{FON:GEN:d6dc6cae606675f2e4fc6aad891c41b3} GENERATED CODE! DO NOT EDIT MANUALY!
namespace('fjs.fdp');


/**
 * Code generated by com.fonality.meta.generator.java.fdp.client.fjs.JGen_FJS_FeedModelEntry
 * @interface It is not history, it is realtime chat messages that stored till user close session.
 * Chat message structure defines the list of chat messages. Every chat message is owned
 * by some user. In other words chat message sent form user A to user B will be represented by two
 * instances, one in user A list and another in user B list. It is required because users may close
 * their chat in unpredicted order.
 */
fjs.fdp.ChatMessageBaseEntryModel = function()
{
	
	/**
	 * Chat session id of this message.
	 * MetaPID is not used here becuase chat_sessions have no datasources (only default is used).
	 * It is subject to change in v1.1
	 * @type {String}
	 */
	this.sessionId = null; //$NON-NLS-1$
	/**
	 * Contains message as plain text.
	 * @type {String}
	 */
	this.textPlain = null; //$NON-NLS-1$
	/**
	 * Contains message as XHTML text.
	 * @type {String}
	 */
	this.textXhtml = null; //$NON-NLS-1$
	/**
	 * Time when message was sent.
	 * @type {number}
	 */
	this.sent = null;
	/**
	 * Client chat message id.
	 * @type {String}
	 */
	this.clientId = null; //$NON-NLS-1$
	/**
	 * Message direction
	 * <UL>
	 * <LI>true - incoming</LI>
	 * <LI>false - outgoing</LI>
	 * </UL>
	 * @type {boolean}
	 */
	this.incoming = null;
};
