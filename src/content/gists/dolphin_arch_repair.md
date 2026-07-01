---
title: "Dolphin Arch repair"
description: "Two steps to repair default app save on dolphin"
date: 2026-06-29
tags: [ "dolphin", "fix", "arch" ]
---

## Install xdg and set env

```bash
sudo pacman -S archlinux-xdg-menu
export XDG_MENU_PREFIX=arch- kbuildsycoca6
```
```bash
kbuildsycoca6 --noincremental
sudo update-desktop-database
cd /etc/xdg/menus
sudo mv arch-applications.menu applications.menu
```
## References
https://github.com/prasanthrangan/hyprdots/issues/1406
https://www.reddit.com/r/kde/comments/1bd313p/comment/l1jinyf/?utm_source=share&utm_medium=web3x&utm_name=web3xcss&utm_term=1&utm_content=share_button
