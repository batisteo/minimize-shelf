/* Minimize-shelf
   Copyright 2020-2021 Guillaume Pasquet
   Copyright 2022 Baptiste Darthenay
   License: GPLv3
   Contains some code from Simple Task Bar extension by fthx
   Contains some code from All Windows extension by lyonel
*/

const { Gio, GObject, St, Shell } = imports.gi;
const Me = imports.misc.extensionUtils.getCurrentExtension();
const Main = imports.ui.main;
const Meta = imports.gi.Meta;

const ICON_SIZE = 22;

const settings = Me.imports.utils.settings.getSettings();

const WindowList = GObject.registerClass(
    { GTypeName: 'WindowList' },
    class WindowList extends GObject.Object {
        _init(params) {
            this.direction = params.direction; // 'left' | 'right'
            this.apps_menu = new St.BoxLayout({});
            this.actor = this.apps_menu;

            this._updateMenu();
            this._restacked = global.display.connect(
                'restacked',
                this._updateMenu.bind(this)
            );
            this._window_change_monitor = global.display.connect(
                'window-left-monitor',
                this._updateMenu.bind(this)
            );
            this._workspace_removed = global.workspace_manager.connect(
                'workspace-removed',
                this._updateMenu.bind(this)
            );
            this._workspace_changed = global.workspace_manager.connect(
                'active-workspace-changed',
                this._updateMenu.bind(this)
            );
            this._workspace_added = global.workspace_manager.connect(
                'workspace-added',
                this._updateMenu.bind(this)
            );
        }

        _destroy() {
            global.display.disconnect(this._restacked);
            global.display.disconnect(this._window_change_monitor);
            global.workspace_manager.disconnect(this._workspace_removed);
            global.workspace_manager.disconnect(this._workspace_changed);
            global.workspace_manager.disconnect(this._workspace_added);
            this.apps_menu.destroy();
        }

        _updateMenu() {
            this.apps_menu.destroy_all_children();

            this.tracker = Shell.WindowTracker.get_default();
            this.workspaces_count = global.workspace_manager.get_n_workspaces();

            let workspace = global.workspace_manager.get_active_workspace();
            this.windows = workspace.list_windows();

            for (let meta_window of this.windows) {
                meta_window.set_icon_geometry(
                    this._animationAnchorArea(workspace)
                );
            }

            for (let meta_window of this.windows.filter(w => w.minimized)) {
                this.box = new St.Bin({
                    visible: true,
                    reactive: true,
                    can_focus: true,
                    track_hover: true,
                });
                this.box.window = meta_window;
                this.app = this.tracker.get_window_app(this.box.window);
                this.box.connect('button-press-event', () => {
                    this._activateWindow(workspace, meta_window);
                });
                this.box.icon = this.app.create_icon_texture(ICON_SIZE);
                this.box.style_class = 'focused-app';
                this.box.set_child(this.box.icon);
                this.apps_menu.add_actor(this.box);
            }
        }

        _animationAnchorArea(ws) {
            const width = ws.get_display().get_size()[0];
            // Some arbitrary values in pixels because I can’t figure out
            // how to get the apps_menu position
            const anchor = this.direction === 'left' ? 200 : width - 150;
            if (this.area?.x !== anchor)
                // Avoid creating too much rectangles
                this.area = new Meta.Rectangle({
                    x: anchor,
                    y: 0,
                    width: ICON_SIZE,
                    height: ICON_SIZE,
                });
            return this.area;
        }

        _activateWorkspace(ws) {
            if (global.workspace_manager.get_active_workspace() === ws)
                Main.overview.toggle();
            else Main.overview.show();

            ws.activate(global.get_current_time());
        }

        _activateWindow(ws, w) {
            const is_active_ws =
                global.workspace_manager.get_active_workspace() === ws;

            if (is_active_ws && w.has_focus() && !Main.overview.visible)
                w.minimize();
            else w.activate(global.get_current_time());

            Main.overview.hide();
            if (!w.is_on_all_workspaces())
                ws.activate(global.get_current_time());
        }

        _onButtonPress(actor, event) {
            this._updateMenu();
            this.parent(actor, event);
        }

        _insert() {
            const box = Main.panel[`_${this.direction}Box`];
            const index = { left: -1, right: 1 }[this.direction];
            box.insert_child_at_index(this.actor, index);
        }
    }
);

let windowlist;

function init() {
    settings.connect('changed', () => {
        disable();
        enable();
    });
}

function enable() {
    windowlist = new WindowList({
        direction: settings.get_enum('direction') === 0 ? 'left' : 'right',
    });
    windowlist._insert();
}

function disable() {
    windowlist._destroy();
}
