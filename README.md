https://www.ubuntu.com/download/server
# user vdw/vdw

sudo -i
systemctl stop apparmor && systemctl disable apparmor

# https://doc.ubuntu-fr.org/mount_fstab
mkdir /media/data
echo "
UUID=325506bf-ebaa-4e9c-b59f-4d7d65c13b3c    /media/data           ext4    defaults        0       2
" >> /etc/fstab
sudo mount -a

# https://www.digitalocean.com/community/tutorials/how-to-install-and-use-docker-on-ubuntu-18-04

# https://hub.docker.com/r/dperson/samba/
mkdir /home/vdw/share
# docker run -d -it --name samba --restart always -p 139:139 -p 445:445 -v /home/vdw/share:/vdw -v /media/data:/data -v /home/vdw/.i2p/torrents:/torrents dperson/samba -u "vdw;vdw;1000;1000" -s "vdw;/vdw;yes;no;no;vdw;vdw;vdw;Public share" -s "data;/data" -s "torrents;/torrents"
docker run -d -it --name samba --restart always -p 139:139 -p 445:445 -v /home/vdw/share:/vdw -v /media/data:/data -v /home/vdw/.i2p/torrents:/torrents dperson/samba -s "vdw;/vdw" -s "data;/data" -s "torrents;/torrents"

# https://geti2p.net
# https://hub.docker.com/r/geti2p/i2p/
mkdir /home/vdw/.i2p
docker run -d -it --name i2p --restart always -v /home/vdw/.i2p:/var/lib/i2p -p 4444:4444 -p 6668:6668 -p 7657:7657 -p 14052:14052 geti2p/i2p
# to configure
#    http://192.168.0.42:7657/confignet  TCP port + public address
#    set .pac file in proxy settings:
function FindProxyForURL(url, host) {
	// eepsites
	if (shExpMatch(host, "*.i2p"))
	{
		return "PROXY 192.168.0.42:4444";
	}
	// default no proxy
	return "DIRECT";
}

# git clone https://github.com/vdwjeremy/media-sync.git
docker run -it --rm --name media-sync --user 1000:1000 -v /media/data/Photos:/Photos -v /media/freeboxbackup/Images/Photos:/backup -v /home/vdw/media-sync:/media-sync python:3.7 bash -c "cd /tmp && export PYTHONPATH=/tmp && pip install -t /tmp exifread && mkdir -p /media-sync/workspace && python /media-sync/media-sync.py"


mkdir -p /var/lib/nextcloud/html /var/lib/nextcloud/apps /var/lib/nextcloud/config /var/lib/nextcloud/data
docker run -d  -it --name nextcloud --restart always -p 80:80 -p 443:443 \
-v /home/vdw/nextcloud/html:/var/www/html \
-v /home/vdw/nextcloud/apps:/var/www/html/custom_apps \
-v /home/vdw/nextcloud/config:/var/www/html/config \
-v /home/vdw/nextcloud/data:/var/www/html/data \
nextcloud

! delete mod "redirect" from /data/etc/apache2/mods-enabled


# Backup

sudo mount /dev/sdc /media/usb
sudo rsync -rav --delete /media/data/nextcloud/Photos/ /media/usb/Images/Photos/
sudo rsync -rav --delete /media/data/nextcloud/Documents/ /media/usb/Documents/
sudo rsync -rav --delete /media/data/nextcloud/Videos/ /media/usb/Videos/
sudo rsync -rav --delete /media/data/multimedia/music/ /media/usb/Musique/
cd ~/media-sync/workspace
pip3 install --user exifread
python3 ~/media-sync/media-sync.py
