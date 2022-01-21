all: pack

force: pack install

pack:
	gnome-extensions pack --force

install:
	gnome-extensions install --force minimize-shelf@etenil.shell-extension.zip
	gnome-extensions enable minimize-shelf@etenil

clean:
	gnome-extensions disable minimize-shelf@etenil
	gnome-extensions uninstall minimize-shelf@etenil
	rm minimize-shelf@etenil.shell-extension.zip
