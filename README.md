https://www.ubuntu.com/download/server
# user vdw/vdw

sudo -i
systemctl stop apparmor && systemctl disable apparmor

# https://doc.ubuntu-fr.org/mount_fstab
mkdir /media/data /media/freeboxdd /media/freeboxbackup
echo "
UUID=325506bf-ebaa-4e9c-b59f-4d7d65c13b3c    /media/data           ext4    defaults        0       2
//192.168.0.254/disque\040dur /media/freeboxdd  cifs  user=guest,sec=ntlm,password='',vers=1.0,uid=1000,gid=1000  0  0
//192.168.0.254/BACKUP /media/freeboxbackup  cifs  user=guest,sec=ntlm,password='',vers=1.0,uid=1000,gid=1000  0  0
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


https://linuxize.com/post/how-to-install-and-use-docker-compose-on-ubuntu-18-04/
# from https://github.com/nextcloud/docker/blob/master/.examples/docker-compose/with-nginx-proxy/mariadb/apache/docker-compose.yml
docker-compose build
docker-compose up -d

daixian/daixian0
amandine/amandine0
marc/marc0000
sophie/sophie00


https://willhaley.com/blog/raspberry-pi-wifi-ethernet-bridge/
+ static lease http://trentsonlinedocs.xyz/how_to_reassign_a_static_ip_address_with_dnsmasq/
+ port forward https://silentkernel.fr/utiliser-iptables-pour-une-redirection-de-port/
iptables -A POSTROUTING -t nat -o eth0 -j MASQUERADE
iptables -A PREROUTING -t nat -i wlan0 -p tcp --dport 80 -j DNAT --to-destination 10.1.1.54:80
iptables -A PREROUTING -t nat -i wlan0 -p tcp --dport 443 -j DNAT --to-destination 10.1.1.54:443
iptables -A FORWARD -i eth0 -p tcp --dport 80 -j ACCEPT
iptables -A FORWARD -i eth0 -p tcp --dport 443 -j ACCEPT

nano /etc/iptables/rules.v4, add :
-A POSTROUTING -t nat -o eth0 -j MASQUERADE
-A PREROUTING -t nat -i wlan0 -p tcp --dport 80 -j DNAT --to-destination 10.1.1.54:80
-A PREROUTING -t nat -i wlan0 -p tcp --dport 443 -j DNAT --to-destination 10.1.1.54:443
-A FORWARD -i eth0 -p tcp --dport 80 -j ACCEPT
-A FORWARD -i eth0 -p tcp --dport 443 -j ACCEPT

