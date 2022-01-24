const Gio = imports.gi.Gio;
const GObject = imports.gi.GObject;
const Gtk = imports.gi.Gtk;

const Me = imports.misc.extensionUtils.getCurrentExtension();

const settings = Me.imports.utils.settings.getSettings();
const Direction = Me.imports.utils.settings.Direction;

const _toggle_direction = widget => {
    if (widget.get_active())
        settings.set_enum('direction', Direction[widget.label]);
};

const PrefsWidget = GObject.registerClass(
    class PrefsWidget extends Gtk.Box {
        _init({ margin_top, margin_side }) {
            super._init();
            this.set_homogeneous(true);
            this.set_spacing(12);
            this.set_margin_top(margin_top);
            this.set_margin_bottom(margin_top);
            this.set_margin_start(margin_side);
            this.set_margin_end(margin_side);

            const label = new Gtk.Label({ label: 'Panel side' });
            const toggle_left = Gtk.ToggleButton.new_with_label('Left');
            const toggle_right = Gtk.ToggleButton.new_with_label('Right');

            toggle_left.connect('toggled', _toggle_direction);
            toggle_right.connect('toggled', _toggle_direction);
            toggle_right.set_group(toggle_left);

            (settings.get_enum('direction') === Direction.Left
                ? toggle_left
                : toggle_right
            ).set_active(true);

            this.append(label);
            this.append(toggle_left);
            this.append(toggle_right);
        }
    }
);

function init() {}

function buildPrefsWidget() {
    return new PrefsWidget({ margin_top: 200, margin_side: 160 });
}
