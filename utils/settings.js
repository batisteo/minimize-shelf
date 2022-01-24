const Gio = imports.gi.Gio;

const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();

var Direction = {
    Left: 0,
    Right: 1,
};

function getSettings() {
    let schemaSource = Gio.SettingsSchemaSource.new_from_directory(
        Me.dir.get_child('schemas').get_path(),
        Gio.SettingsSchemaSource.get_default(),
        false
    );
    let schemaObj = schemaSource.lookup(
        'org.gnome.shell.extensions.minimize-shelf',
        true
    );
    if (!schemaObj) throw new Error('Minimize-shelf: cannot find schemas');
    return new Gio.Settings({ settings_schema: schemaObj });
}

