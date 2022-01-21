const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

const Direction = {
    Left: 0,
    Right: 1,
};

function getSettings() {
    let GioSSS = Gio.SettingsSchemaSource;
    let schemaSource = GioSSS.new_from_directory(
        Me.dir.get_child('schemas').get_path(),
        GioSSS.get_default(),
        false
    );
    let schemaObj = schemaSource.lookup(
        'org.gnome.shell.extensions.minimize-shelf',
        true
    );
    if (!schemaObj) throw new Error('Minimize-shelf: cannot find schemas');
    return new Gio.Settings({ settings_schema: schemaObj });
}

const DirectionDropdown = GObject.registerClass(
    class Dropdown extends Gtk.ComboBox {
        _init() {
            super._init({ model: this._model() });

            let renderer = new Gtk.CellRendererText();
            this.pack_start(renderer, true);
            this.add_attribute(renderer, 'text', 1);
            this.set_active(this._active());
            this.connect('changed', widget => {
                const active = widget.get_active_iter()[1];
                const value = widget.get_model().get_value(active, 0);
                getSettings().set_enum('direction', value);
            });
        }

        _model() {
            const model = new Gtk.ListStore();
            model.set_column_types([GObject.TYPE_INT, GObject.TYPE_STRING]);
            for (const [label, value] of Object.entries(Direction))
                model.set(model.append(), [0, 1], [value, label]);
            return model;
        }

        _active() {
            try {
                return getSettings().get_enum('direction');
            } catch (error) {
                return Direction.Right;
            }
        }
    }
);

const PrefsWidget = GObject.registerClass(
    class PrefsWidget extends Gtk.Grid {
        _init({ margin_top, margin_side }) {
            super._init();
            this.set_column_homogeneous(true);
            this.set_column_spacing(12);
            this.set_row_spacing(12);
            this.set_margin_top(margin_top);

            const label = new Gtk.Label({ label: 'Panel side' });
            label.set_margin_start(margin_side);
            this.attach(label, 0, 1, 1, 1);

            const dropdown = new DirectionDropdown();
            dropdown.set_margin_end(margin_side);
            this.attach(dropdown, 1, 1, 1, 1);
        }
    }
);

function init() {}

function buildPrefsWidget() {
    return new PrefsWidget({ margin_top: 100, margin_side: 200 });
}
