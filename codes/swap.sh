sudo dd if=/dev/zero of=/opt/swapfile bs=1M count=8192
sudo mkswap /opt/swapfile
sudo swapon /opt/swapfile
sudo chmod 0600 /opt/swapfile
sudo mount -a
sudo echo "/opt/swapfile swap swap defaults 0 0" >> /etc/fstab