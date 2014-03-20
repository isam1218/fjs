//{FON:GEN:d6dc6cae606675f2e4fc6aad891c41b3} GENERATED CODE! DO NOT EDIT MANUALY!
namespace('fjs.fdp');


/**
 * Code generated by com.fonality.meta.generator.java.fdp.client.fjs.JGen_FJS_FeedModelEntry
 * Meta voicemailMessage is the structure provided data about voicemail box content. Any
 * count of data from different user lists can be joined and use same set of fields.
 * @constructor
 */
fjs.fdp.PbxVoicemailMessage35EntryModel = function()
{
	
	/**
	 * Synthetic VM message id from asterisk
	 * @type {String}
	 */
	this.pbxVoicemailMessageKey = null; //$NON-NLS-1$
	/**
	 * Voicemail box extension
	 * @type {String}
	 */
	this.box = null; //$NON-NLS-1$
	/**
	 * Caller name
	 * @type {String}
	 */
	this.callerName = null; //$NON-NLS-1$
	/**
	 * Caller address
	 * @type {String}
	 */
	this.callerAddress = null; //$NON-NLS-1$
	/**
	 * Message duration
	 * @type {number}
	 */
	this.duration = null;
	/**
	 * Message date
	 * @type {number}
	 */
	this.date = null;
	/**
	 * Message folder - INBOX|Old|etc...
	 * @type {String}
	 */
	this.folder = null; //$NON-NLS-1$
	/**
	 * Message flag
	 * @type {int}
	 */
	this.flag = null;
	/**
	 * Recognized text of voicemail message
	 * @type {String}
	 */
	this.transcription = null; //$NON-NLS-1$
};
