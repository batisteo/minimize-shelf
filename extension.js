/* Minimize-shelf
   Copyright etenil 2020
   License: GPL v3
   Contains some code from Simple Task Bar extension by fthx
   Contains some code from All Windows extension by lyonel
*/

const Lang = imports.lang;
const St = imports.gi.St;
const Main = imports.ui.main;
const Util = imports.misc.util;
const Meta = imports.gi.Meta;
const Shell = imports.gi.Shell;
const Clutter = imports.gi.Clutter;

const ICON_SIZE = 22;
const HIDDEN_OPACITY = 127;


const WindowList = new Lang.Class({
	Name: 'WindowList.WindowList',

	_init: function(){
		this.apps_menu = new St.BoxLayout({});
		this.actor = this.apps_menu;
        this._updateMenu();
		this._restacked = global.display.connect('restacked', Lang.bind(this, this._updateMenu));
		this._window_change_monitor = global.display.connect('window-left-monitor', Lang.bind(this, this._updateMenu));
		this._workspace_removed = global.workspace_manager.connect('workspace-removed', Lang.bind(this, this._updateMenu));
		this._workspace_changed = global.workspace_manager.connect('active-workspace-changed', Lang.bind(this, this._updateMenu));
		this._workspace_added = global.workspace_manager.connect('workspace-added', Lang.bind(this, this._updateMenu));
	},

	_destroy: function() {
		global.display.disconnect(this._restacked);
		global.display.disconnect(this._window_change_monitor);
		global.workspace_manager.disconnect(this._workspace_removed);
		global.workspace_manager.disconnect(this._workspace_changed);
		global.workspace_manager.disconnect(this._workspace_added);
		this.apps_menu.destroy();
    },

    _updateMenu: function() {
    	this.apps_menu.destroy_all_children();
    
        this.tracker = Shell.WindowTracker.get_default();
        this.workspaces_count = global.workspace_manager.get_n_workspaces();

		let workspace = global.workspace_manager.get_active_workspace();
		this.windows = workspace.list_windows();
        	
		this.windows = this.windows.filter(
			function(w) {
				return w.minimized;
			}
		);

		for ( let i = 0; i < this.windows.length; ++i ) {
			let metaWindow = this.windows[i];
			this.box = new St.Bin({visible: true, 
							reactive: true, can_focus: true, track_hover: true});
			this.box.window = this.windows[i];
			this.app = this.tracker.get_window_app(this.box.window);
			this.box.connect('button-press-event', Lang.bind(this, function() {
										this._activateWindow(workspace, metaWindow); } ));
			this.box.icon = this.app.create_icon_texture(ICON_SIZE);
			this.box.style_class = 'focused-app';
			this.box.set_child(this.box.icon);
			this.apps_menu.add_actor(this.box);
		}
    },
    
    _activateWorkspace: function(ws) {
    	if (global.workspace_manager.get_active_workspace() === ws) {
    		Main.overview.toggle();
    	}
    	else {
    		Main.overview.show();
    	};
    	ws.activate(global.get_current_time()); 
    },

    _activateWindow: function(ws, w) {
        if (global.workspace_manager.get_active_workspace() === ws && w.has_focus() 
        												&& !(Main.overview.visible)) {
       		w.minimize();
       	}
        else {	
        	//w.unminimize();
			//w.unshade(global.get_current_time());
			w.activate(global.get_current_time());
		};
		Main.overview.hide();
		if (!(w.is_on_all_workspaces())) { ws.activate(global.get_current_time()); };
    },

     _onButtonPress: function(actor, event) {
     	this._updateMenu();
     	this.parent(actor, event);
    },

});

let windowlist;

function init() {
}

function enable() {
	windowlist = new WindowList;
    Main.panel._rightBox.insert_child_at_index(windowlist.actor, 1);

}

function disable() {
	windowlist._destroy();
}
