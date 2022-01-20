all: pack

pack:
	gnome-extensions pack --force

install:
	gnome-extensions install --force minimize-shelf@etenil.shell-extension.zip
	gnome-extensions enable minimize-shelf@etenil

clean:
	gnome-extensions disable minimize-shelf@etenil
	gnome-extensions uninstall --force minimize-shelf@etenil.shell-extension.zip
	rm minimize-shelf@etenil.shell-extension.zip
