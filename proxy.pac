function FindProxyForURL(url, host) {
	// eepsites
	if (shExpMatch(host, "*.i2p"))
	{
		return "PROXY 192.168.1.40:4444";
	}
	// default no proxy
	return "DIRECT";
}

