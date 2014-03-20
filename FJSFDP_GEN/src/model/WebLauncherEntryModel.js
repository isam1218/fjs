//{FON:GEN:d6dc6cae606675f2e4fc6aad891c41b3} GENERATED CODE! DO NOT EDIT MANUALY!
namespace('fjs.fdp');


/**
 * Code generated by com.fonality.meta.generator.java.fdp.client.fjs.JGen_FJS_FeedModelEntry
 * @interface This meta structure provided data for web launcher.
 */
fjs.fdp.WebLauncherEntryModel = function()
{
	
	/**
	 * Config id. Should be 'user_default' since we have only one possible user's conifg.
	 * @type {String}
	 */
	this.id = null; //$NON-NLS-1$
	/**
	 * Configuration display name.
	 * @type {String}
	 */
	this.name = null; //$NON-NLS-1$
	/**
	 * Configuration description.
	 * @type {String}
	 */
	this.description = null; //$NON-NLS-1$
	/**
	 * Indicates user's config. Should be always true
	 * @type {boolean}
	 */
	this.isUser = null;
	/**
	 * Enabled by default flag.
	 * @type {boolean}
	 */
	this.enabledByDefault = null;
	/**
	 * Launch web page only when the call is answered property.
	 * @type {boolean}
	 */
	this.launchWhenCallAnswered = null;
	/**
	 * Url for inbound calls.
	 * @type {String}
	 */
	this.inbound = null; //$NON-NLS-1$
	/**
	 * Silent property for inbound calls.
	 * @type {boolean}
	 */
	this.inboundSilent = null;
	/**
	 * Auto-launch property for inbound calls.
	 * @type {boolean}
	 */
	this.inboundAuto = null;
	/**
	 * Url for inbound hangup calls.
	 * @type {String}
	 */
	this.inboundHangup = null; //$NON-NLS-1$
	/**
	 * Silent property for inbound hangup calls.
	 * @type {boolean}
	 */
	this.inboundHangupSilent = null;
	/**
	 * Auto-launch property for inbound hangup calls.
	 * @type {boolean}
	 */
	this.inboundHangupAuto = null;
	/**
	 * Url for outbound calls.
	 * @type {String}
	 */
	this.outbound = null; //$NON-NLS-1$
	/**
	 * Silent property for outbound calls.
	 * @type {boolean}
	 */
	this.outboundSilent = null;
	/**
	 * Auto-launch property for outbound calls.
	 * @type {boolean}
	 */
	this.outboundAuto = null;
	/**
	 * Url for outbound hangup calls.
	 * @type {String}
	 */
	this.outboundHangup = null; //$NON-NLS-1$
	/**
	 * Silent property for outbound hangup calls.
	 * @type {boolean}
	 */
	this.outboundHangupSilent = null;
	/**
	 * Auto-launch property for outbound hangup calls.
	 * @type {boolean}
	 */
	this.outboundHangupAuto = null;
};
