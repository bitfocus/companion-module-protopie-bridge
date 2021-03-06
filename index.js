// ProtoPie-Bridge

var instance_skel = require('../../instance_skel');
var debug;
var log;

var io = require('socket.io-client');
var socket = null;

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions
	
	return self;
}

instance.prototype.init = function () {
	var self = this;

	debug = self.debug;
	log = self.log;

	self.status(self.STATUS_OK);
	
	self.initModule();
};

instance.prototype.updateConfig = function (config) {
	var self = this;
	self.config = config;

	self.status(self.STATUS_OK);

	self.initModule();
};

instance.prototype.initModule = function () {
	var self = this;
	
	if (self.config.host) {		
		socket = io.connect('http://' + self.config.host + ':' + self.config.port, {reconnection: true});

		// Add a connect listener
		socket.on('connect', function() { 
			socket.emit('companion');
		});
		
		socket.on('ppMessage', function(data) {
			//add last message received variable here
		});
	}
	
	self.actions(); // export actions
};

// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
		{
			type: 'text',
			id: 'info',
			width: 12,
			label: 'Information',
			value: 'You will need to have the ProtoPie program running on the remote computer.'
		},
		{
			type: 'textinput',
			id: 'host',
			label: 'Target Host',
			width: 6
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Target Port',
			default: 9981,
			width: 4,
			regex: self.REGEX_PORT
		}
	]
}

// When module gets deleted
instance.prototype.destroy = function () {
	var self = this;
	socket.close();
	socket = null;
	debug('destroy', self.id);
}

instance.prototype.actions = function() {
	var self = this;

	self.system.emit('instance_actions', self.id, {

		'send_message': {
			label: 'Message',
			options: [
				{
					type: 'textinput',
					label: 'Message',
					id: 'message',
					default: ''
				},
				{
					type: 'textinput',
					label: 'Value',
					id: 'value',
					default: ''
				}
			]
		}

	});
}

instance.prototype.action = function (action) {
	var self = this;
	var options = action.options;

	switch (action.action) {
		case 'send_message':
			let messageObj = {};
			messageObj.messageId = options.message;
			messageObj.value = (options.value === 'null' ? null : options.value);
			socket.emit('ppMessage', messageObj);
			break;
		default:
			break;
	}
};

instance_skel.extendedBy(instance);
exports = module.exports = instance;